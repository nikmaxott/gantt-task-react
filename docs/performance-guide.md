# Performance Guide: Scaling the Gantt Chart

This document captures a codebase-grounded assessment of `gantt-task-react`'s
rendering performance, why it degrades on larger task lists, and a
prioritized plan to fix it — including what a DOM/SVG → Canvas migration
would actually involve, and why it's not the first thing to reach for.

## Current architecture (as of this writing)

The chart is a single shared SVG document per `Gantt` instance:

- `src/components/gantt/task-gantt.tsx:46-76` mounts two `<svg>` elements:
  one for the calendar header, one for the chart body (`Grid` +
  `TaskGanttContent` as nested `<g>` groups).
- Bars, grid lines, ticks, the "today" highlight, dependency arrows, and
  calendar labels are all SVG primitives (`<rect>`, `<line>`, `<path>`,
  `<polygon>`, `<text>`) inside those two shared `<svg>` roots — there is
  **no** per-task `<svg>` mount and **no** canvas anywhere in the codebase.
- The task list (left-hand names/dates table) is an HTML `<table>`
  (`src/components/task-list/task-list.tsx`,
  `task-list-body.tsx`).
- The tooltip is a single floating HTML `<div>`
  (`src/components/other/tooltip.tsx`).
- Scrolling uses native browser scroll containers with proxy spacer divs
  (`vertical-scroll.tsx`, `horizontal-scroll.tsx`), synced imperatively to
  the real SVG containers — not a virtualization engine.

| Component | Path | Role |
|---|---|---|
| `Gantt` | `src/components/gantt/gantt.tsx` (539 lines) | Top-level orchestrator; owns all state (scroll, selection, dates, converted bar tasks). |
| `TaskGantt` | `src/components/gantt/task-gantt.tsx` | Mounts the two `<svg>` elements, wires native scroll via refs. |
| `TaskGanttContent` | `src/components/gantt/task-gantt-content.tsx` (305 lines) | Maps over every `BarTask` to render one `<Arrow>` per dependency and one `<TaskItem>` per task; owns the drag/mouse-move state machine. |
| `Grid` / `GridBody` | `src/components/grid/grid.tsx`, `grid-body.tsx` | One `<rect>` row + `<line>` per task, one `<line>` tick per date column — fully unconditional. |
| `Calendar` / `TopPartOfCalendar` | `src/components/calendar/calendar.tsx` (394 lines) | One `<text>` per date column for every view mode; regenerated every render. |
| `TaskItem` | `src/components/task-item/task-item.tsx` | Per-task `<g>` wrapping the bar/milestone/project variant + label; calls `getBBox()` in a `useEffect` per task per render. |
| `Bar` / `BarSmall` / `Milestone` / `Project` | `src/components/task-item/bar/*`, `.../milestone/*`, `.../project/*` | The four visual variants, each a handful of SVG shapes. |
| `Arrow` | `src/components/other/arrow.tsx` | One `<path>` + `<polygon>` per dependency edge; geometry computed inline every render. |
| `TaskListBodyDefault` | `src/components/task-list/task-list-body.tsx` | One `<tr>` per task in the left-hand HTML table, unconditional. |

No `react-window`/`react-virtualized`/canvas/graphics library appears in
`package.json` — the only runtime peer deps are `react` and `react-dom`.
The shipped example dataset has 8 tasks; there's no perf guidance or
benchmark anywhere in the repo, so the library was evidently built and
tested against small task lists (tens, maybe low hundreds), not thousands.

## Root causes of the slowdown

These are the actual bottlenecks, in order of impact — and none of them
require a rendering-technology change to fix:

1. **Scroll triggers a full data recompute.** The effect that calls
   `convertToBarTasks` has `scrollX` in its dependency array
   (`src/components/gantt/gantt.tsx:114-185`, dep list at `163-185`). Every
   horizontal scroll/wheel tick re-derives the date range and re-converts
   *every task's* bar geometry and dependency wiring from scratch (an O(n)
   pass containing an O(n²)-ish dependency-resolution loop via `findIndex`
   in `src/helpers/bar-helper.ts:53-61`), then calls `setBarTasks([...])`
   with a new array — forcing `TaskGanttContent`, `Grid`, and the task list
   to fully re-render on every scroll frame.
2. **Zero virtualization.** `Grid`, `Calendar`, `TaskGanttContent`, and
   `TaskListBodyDefault` all `.map()` over every task and every date column
   unconditionally, regardless of what's actually scrolled into view.
3. **Zero memoization.** No `React.memo` anywhere in `src`, no
   `useCallback` at all, and prop-bundle objects (`gridProps`,
   `calendarProps`, `barProps`, `tableProps`) are freshly-constructed
   literals every render of the single top-level `Gantt` component
   (`gantt.tsx:413-472`). Any state change — scroll, hover, drag, select —
   re-renders the whole tree.
4. **Per-task layout thrashing.** `TaskItem` calls
   `textRef.current.getBBox()` inside a `useEffect` for every task on every
   render (`task-item.tsx:60-64`) — a synchronous DOM read that forces
   reflow, repeated per task.
5. **No state isolation.** All state (including scroll position) lives in
   one `useState`-heavy top-level component, so a scrollbar drag re-renders
   everything a full data edit would.

## Recommended plan, in order

### 1. Decouple scroll from recompute (do this first)

`convertToBarTasks` should depend only on `tasks`, `dateSetup`, and
view-mode-affecting inputs — never `scrollX`/`scrollY`. Scroll position
should move a `transform`/`viewBox` offset on the already-built SVG, not
regenerate it. This single dependency-array fix likely resolves most of
the "janky scrolling" symptom by itself, with minimal risk.

### 2. Memoize the render tree — done

`Grid`, `Calendar`, `TaskGantt`, `TaskGanttContent`, `TaskList`,
`TaskListBodyDefault`, `TaskListHeaderDefault`, `TaskItem`, `Bar`,
`BarSmall`, `Milestone`, `Project`, and `Arrow` are now all wrapped in
`React.memo` (generic components use the `Inner`/cast pattern —
`React.memo(FooInner) as typeof FooInner` — to keep their call signature
generic for consumers). On its own that does very little, because most of
the props flowing into them were freshly-constructed every render; the
memoization only pays off once the values reaching those props are
actually stable:

- `gridProps`, `calendarProps`, `barProps`, and `tableProps` in
  `gantt.tsx` are now built with `useMemo` instead of as fresh object
  literals every render.
- `handleSelectedTask` and `handleExpanderClick` are now `useCallback`,
  since they're threaded down as props into memoized children — a fresh
  function identity on every `Gantt` render would have defeated the
  memoization for every one of them, regardless of the `React.memo` wraps.
- `barTasks.map(t => t.task)` (rebuilt as a new array every render even
  when `barTasks` was unchanged) is now `useMemo`'d once, as
  `taskListTasks`.
- `TaskGanttContent`'s `handleBarEventStart` — the shared `onEventStart`
  handler passed to *every* `TaskItem` — is now `useCallback`'d too. Doing
  so required removing its read of the live `ganttEvent` value for the
  hover (`mouseenter`/`mouseleave`) branches, in favor of the same
  functional-`setState` trick used for the `scrollX` fix: `setGanttEvent(prev
  => ...)` instead of reading `ganttEvent.action` from the closure. Without
  that, hovering *any* task would have handed *every* task's `TaskItem` a
  new `onEventStart` reference and silently defeated their memoization on
  every mouse move.
- A related bug in the same file: `svg?.current?.createSVGPoint()` was
  being computed fresh every render and stored as `point`, then listed as
  a dependency of the mousemove/mouseup drag effect — since it was never
  the same object twice, that effect re-subscribed its listeners on every
  single render, independent of anything relevant actually changing. Each
  handler now creates its own point at the moment it needs one instead, so
  there's nothing render-churny left to depend on.

Net effect: during a drag, only the actively-dragged task's `TaskItem` and
its arrows re-render — every other row now sees fully stable props and
bails out of rendering entirely. During a hover, the same applies. Scroll
was already handled by the step-1 fix.

Verified with `tsc --noEmit`, `eslint` (including
`react-hooks/exhaustive-deps`), the full test suite, and a full
`npm run build` (declaration-file bundling included) — all clean.

**Update — also done:** scroll position is now split out of `Gantt`'s
state entirely, via a new `GanttViewport` component
(`src/components/gantt/gantt-viewport.tsx`). It owns `scrollX`, `scrollY`,
`ignoreScrollEvent`, the derived layout measurements
(`taskListWidth`/`svgContainerWidth`/`svgContainerHeight`), and the
wheel/scrollbar/arrow-key handlers that update them. `Gantt` itself now
holds only task-data state (`dateSetup`, `barTasks`, `ganttEvent`,
`selectedTask`, `failedTask`) and hands `GanttViewport` fully memoized
bundles of everything else — so scrolling, dragging the scrollbar, or
nudging with arrow keys no longer re-runs `Gantt`'s own component function
at all, not just the memoized subtree below it.

Two behaviors needed re-threading across the new state boundary:

- RTL's initial-scroll-to-the-far-end is now computed inside
  `GanttViewport` itself, from the `svgWidth` prop it already receives,
  guarded by a ref so it only fires once — no need to route it through
  `Gantt`.
- The `viewDate` prop's scroll-to-date jump still resolves in `Gantt`
  (only it has `dateSetup` to turn a date into a column index) and is now
  handed down as a one-shot `scrollToX` command prop that `GanttViewport`
  applies via an effect, instead of `Gantt` reaching into scroll state
  directly.

Verified with `tsc --noEmit`, `eslint`, the full test suite, and full
builds of both the library and the demo app.

### 3. Fix the `getBBox()` call in `TaskItem`

Cache label width per task (it only changes when task text/font changes)
instead of reading layout every render.

### 4. Virtualize rows and date columns

The change that actually lets this scale to thousands of tasks — and it
works whether the chart stays on SVG or moves to Canvas:

- Only render `TaskItem`/`Arrow`/grid-row elements for tasks whose row
  falls within the visible vertical range (+ overscan), computed from
  `scrollY` / `rowHeight` — the same idea as `react-window`, applied to
  `<g>` elements instead of divs.
- Same for date columns horizontally: compute the visible column range
  from `scrollX` / `columnWidth` and only render those ticks/labels.
- This turns per-frame cost from O(total tasks × total columns) to
  O(visible tasks × visible columns) — the single biggest lever available,
  bigger than a Canvas rewrite, without touching hit-testing, drag, or
  accessibility.

Steps 1–4 typically take an SVG Gantt chart from "chokes at 500 rows" to
"smooth at 10,000+ rows," because cost stops scaling with total data size
and starts scaling with viewport size. **Most cases should stop here.**

### 5. Canvas migration — descoped, not planned

**Decision:** not required for this project. Scaling target and usage
don't call for it, and steps 1–4 already cover the cost that actually
scales with data size. Kept below for reference only, in case that
changes.

Canvas is worth it mainly when many thousands of bars/arrows are
*simultaneously visible* (so even the virtualized SVG node count is high),
or you need effects SVG struggles with. It costs real capability: SVG
gives free hit-testing, free accessibility (each bar is a DOM node), free
CSS styling/hover/focus, and free event handlers per bar — Canvas gives
none of that for free.

Migration shape, if pursued:

1. Keep the task-list `<table>` and tooltip `<div>` as DOM — no reason to
   canvas-ify text-heavy, low-count UI.
2. Replace the body `<svg>` with a single `<canvas>` sized to the
   *viewport*, not the full content size (today the SVG is
   `rowHeight * tasks.length` tall and relies on native scroll).
3. Own scroll/pan yourself: keep `scrollX`/`scrollY` and translate the
   drawing context by `-scrollX, -scrollY` each frame instead of syncing a
   native scrollbar.
4. Draw in a `requestAnimationFrame` loop (or draw-on-demand on
   scroll/data change, cheaper if nothing is animating): clear the visible
   rect, then for each visible row (same virtualization math as step 4
   above — needed either way) draw grid line, bar rect, progress rect, and
   label via `ctx.fillRect`/`ctx.fillText`; draw arrows via
   `ctx.beginPath`/`ctx.lineTo` + a manually-filled arrowhead triangle.
5. Reimplement hit-testing: on pointer events, compute row/column from
   `(x, y)` and viewport offset, then check whether the pointer falls
   within that task's bar/handle/arrow bounding box.
6. Handle DPI scaling (`devicePixelRatio`) — size the canvas backing store
   to `cssSize * dpr` and scale the context, or text/lines render blurry
   on high-DPI displays.
7. Plan for the accessibility regression: SVG bars are individually
   focusable/labelable; canvas bars are pixels. Screen-reader support
   needs a parallel off-screen accessible DOM tree, as most canvas chart
   libraries do — this is a real added engineering cost, not a footnote.

## Should this use React Compiler?

Worth adding, but as a complement to the plan above, not a substitute for
it — and it's arguably a better fit here than in a typical app, precisely
*because* this is a component library.

**What it would fix, essentially for free:** root cause 3 (zero
`React.memo`/`useCallback`) — the compiler auto-memoizes components and
values at build time, which is exactly the manual pass in step 2.
Consumers of this library can't add `React.memo` to its internals
themselves; only compiling it in once, at this library's build step, means
every downstream app gets the memoization automatically, with no
hand-maintained memo hygiene that can silently regress later.

**What it won't fix:** root causes 1 (the `scrollX` dependency-array bug)
and 2 (zero virtualization) are logic and architecture problems, not
missing-memoization problems — the compiler optimizes what's written, it
doesn't know an effect *shouldn't* depend on `scrollX`, and it doesn't stop
the code from rendering off-screen rows in the first place. Fix those
manually regardless; then let the compiler take over step 2 instead of
hand-writing the `React.memo`/`useMemo`/`useCallback` pass.

Before adopting it here specifically:

- **Runtime footprint.** `package.json` currently has no `dependencies` at
  all — only peer deps on `react`/`react-dom`. Compiled output calls a
  memo-cache runtime helper: free (built into `react/compiler-runtime`) on
  React 19, but React 18 (in the supported `^18.0.0 || ^19.0.0` range)
  needs the small `react-compiler-runtime` polyfill package as a real
  dependency. Decide that trade-off deliberately rather than by accident.
- **Cross-version testing.** The memo-cache mechanism differs between
  React 18 and 19 — test the compiled build against both, since it's easy
  for a subset of consumers' React versions to be subtly wrong even when
  dev testing looks fine.
- **Lint first.** Run `eslint-plugin-react-hooks`'s compiler rules (or
  `eslint-plugin-react-compiler`) as a dry run before enabling the
  compiler, to surface any Rules-of-React violations — worth doing given
  the native-listener/ref-heavy drag state machine in
  `task-gantt-content.tsx`.
- **Build integration.** This project builds with Vite
  (`vite.config.ts`), so it's a Babel plugin added to `@vitejs/plugin-react`'s
  config — straightforward, but it is a build-step addition to a
  currently very lean build.

## Bottom line

Steps 1–4, no Canvas. Steps 1 and 2 are done (`scrollX` decoupled from the
data recompute, the render tree memoized); step 4 (virtualization) is the
remaining lever for large datasets. Canvas is descoped — it would trade
away accessibility, hit-testing, and CSS styling that SVG gives for free,
for a problem (simultaneously-visible element count) this project doesn't
have.
