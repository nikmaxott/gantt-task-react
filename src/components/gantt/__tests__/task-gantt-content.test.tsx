// Test skeleton using React Testing Library + Jest
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { TaskGanttContent } from "../task-gantt-content";
import type { BarTask } from "../../../types/bar-task";

// Minimal mocks / factories
const makeBarTask = (id: string): BarTask<any> => ({
  task: {
    id,
    start: new Date(2026, 0, 1),
    end: new Date(2026, 0, 2),
    progress: 0,
    isDisabled: false,
  },
  x1: 0,
  x2: 100,
  barChildren: [],
});

test("dragging a bar triggers onDateChange on mouseup", async () => {
  const tasks = [makeBarTask("1")];
  const onDateChange = jest.fn().mockResolvedValue(true);

  // Render an SVG wrapper and mount TaskGanttContent inside so we can dispatch
  // mouse events on the SVG element.
  const { container } = render(
    <svg data-testid="gantt-svg" width="800" height="200">
      <TaskGanttContent
        tasks={tasks as any}
        dates={[new Date(2026, 0, 1), new Date(2026, 0, 2)]}
        ganttEvent={{ action: "" }}
        selectedTask={undefined}
        rowHeight={40}
        columnWidth={50}
        timeStep={24 * 60 * 60 * 1000} // one day
        svg={{ current: container.querySelector("svg") as SVGSVGElement }}
        taskHeight={20}
        arrowColor="#000"
        arrowIndent={5}
        fontSize="12px"
        fontFamily="Arial"
        rtl={false}
        setGanttEvent={() => {}}
        setFailedTask={() => {}}
        setSelectedTask={() => {}}
        onDateChange={onDateChange}
      />
    </svg>
  );

  // TODO: Locate the bar DOM element (TaskItem) and dispatch mousedown/mousemove/mouseup
  // Example (fill in correct selector depending on TaskItem rendering):
  const svg = container.querySelector("svg")!;
  fireEvent.mouseDown(svg, { clientX: 10 }); // start drag
  fireEvent.mouseMove(svg, { clientX: 50 }); // move
  fireEvent.mouseUp(svg, { clientX: 50 }); // finish

  // You may need to await because onDateChange is awaited inside the component.
  await new Promise(process.nextTick);

  // Assert onDateChange was called at least once
  expect(onDateChange).toHaveBeenCalled();
});
