import React, {
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { GridProps } from "../grid/grid";
import { CalendarProps } from "../calendar/calendar";
import { TaskGanttContentProps } from "./task-gantt-content";
import { TaskGantt } from "./task-gantt";
import { Tooltip } from "../other/tooltip";
import { VerticalScroll } from "../other/vertical-scroll";
import { HorizontalScroll } from "../other/horizontal-scroll";
import {
  TaskListProps,
  TaskList as TaskListDefault,
} from "../task-list/task-list";
import { BarTask } from "../../types/bar-task";
import { GanttEvent } from "../../types/gantt-task-actions";
import { Task } from "../../types/public-types";
import styles from "./gantt.module.css";

export type GanttViewportProps<T extends Task> = {
  gridProps: GridProps;
  calendarProps: CalendarProps;
  barProps: TaskGanttContentProps<T>;
  ganttHeight: number;
  ganttFullHeight: number;
  svgWidth: number;
  rowHeight: number;
  columnWidth: number;
  headerHeight: number;
  listCellWidth: number;
  rtl: boolean;
  arrowIndent: number;
  fontFamily: string;
  fontSize: string;
  locale: string;
  tasksLength: number;
  taskListTasks: T[];
  selectedTask: BarTask<T> | undefined;
  ganttEvent: GanttEvent<T>;
  /**
   * A one-shot scroll target driven by the consumer's `viewDate` prop.
   * Gantt computes this — it needs `dateSetup`, which lives up there —
   * and this component applies it. `undefined` means "no pending jump",
   * and it only ever changes when `viewDate` resolves to a genuinely new
   * date, so it won't fight a scroll position the visitor set by hand.
   */
  scrollToX?: number;
  handleSelectedTask: (taskId: string) => void;
  handleExpanderClick: (task: T) => void;
  renderTooltipContent: (props: {
    task: T;
    fontSize: string;
    fontFamily: string;
  }) => React.JSX.Element;
  renderTaskListHeader: (props: {
    headerHeight: number;
    rowWidth: number;
  }) => React.JSX.Element;
  renderTaskListBody: (props: {
    rowHeight: number;
    rowWidth: number;
    locale: string;
    tasks: T[];
    selectedTaskId: string;
    ganttHeight: number;
    horizontalContainerRef: React.RefObject<HTMLTableSectionElement | null>;
    setSelectedTask: (taskId: string) => void;
    onExpanderClick: (task: T) => void;
  }) => React.JSX.Element;
  renderTaskListTable?: (props: {
    tasks: T[];
    taskListRef: React.RefObject<HTMLTableElement | null>;
    scrollY: number;
    setSelectedTask: (taskId: string) => void;
    onExpanderClick: (task: T) => void;
    selectedTaskId?: string;
  }) => React.JSX.Element;
};

/**
 * Owns every piece of state that changes on a scroll tick — scrollX,
 * scrollY, and the layout measurements derived from them — so that
 * scrolling, dragging the scrollbar, or nudging with arrow keys never
 * re-renders Gantt itself. Gantt keeps only task data (dateSetup,
 * barTasks, ganttEvent, selectedTask) and hands this component fully
 * memoized bundles of everything else.
 */
const GanttViewportInner = <T extends Task>({
  gridProps,
  calendarProps,
  barProps,
  ganttHeight,
  ganttFullHeight,
  svgWidth,
  rowHeight,
  columnWidth,
  headerHeight,
  listCellWidth,
  rtl,
  arrowIndent,
  fontFamily,
  fontSize,
  locale,
  tasksLength,
  taskListTasks,
  selectedTask,
  ganttEvent,
  scrollToX,
  handleSelectedTask,
  handleExpanderClick,
  renderTooltipContent,
  renderTaskListHeader,
  renderTaskListBody,
  renderTaskListTable,
}: GanttViewportProps<T>) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLTableElement>(null);

  const [taskListWidth, setTaskListWidth] = useState(0);
  const [svgContainerWidth, setSvgContainerWidth] = useState(0);
  const [svgContainerHeight, setSvgContainerHeight] = useState(ganttHeight);

  const [scrollY, setScrollY] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const [ignoreScrollEvent, setIgnoreScrollEvent] = useState(false);

  // RTL charts start scrolled to the (reversed) beginning of the
  // timeline. svgWidth is 0 on the very first render, before the date
  // range exists, so this catches up the moment it becomes real — same
  // one-shot semantics as the sentinel this used to be in Gantt's own
  // state, just entirely local here instead of routed through it.
  const hasSetInitialRtlScroll = useRef(false);
  useEffect(() => {
    if (rtl && !hasSetInitialRtlScroll.current && svgWidth > 0) {
      hasSetInitialRtlScroll.current = true;
      setScrollX(svgWidth);
    }
  }, [rtl, svgWidth]);

  useEffect(() => {
    if (scrollToX !== undefined) {
      setScrollX(scrollToX);
    }
  }, [scrollToX]);

  useEffect(() => {
    if (!listCellWidth) {
      setTaskListWidth(0);
    }
    if (taskListRef.current) {
      setTaskListWidth(taskListRef.current.offsetWidth);
    }
  }, [taskListRef, listCellWidth]);

  useEffect(() => {
    if (wrapperRef.current) {
      setSvgContainerWidth(wrapperRef.current.offsetWidth - taskListWidth);
    }
  }, [wrapperRef, taskListWidth]);

  useEffect(() => {
    if (ganttHeight) {
      setSvgContainerHeight(ganttHeight + headerHeight);
    } else {
      setSvgContainerHeight(tasksLength * rowHeight + headerHeight);
    }
  }, [ganttHeight, tasksLength, headerHeight, rowHeight]);

  // scroll events
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.shiftKey || event.deltaX) {
        const scrollMove = event.deltaX ? event.deltaX : event.deltaY;
        let newScrollX = scrollX + scrollMove;
        if (newScrollX < 0) {
          newScrollX = 0;
        } else if (newScrollX > svgWidth) {
          newScrollX = svgWidth;
        }
        setScrollX(newScrollX);
        event.preventDefault();
      } else if (ganttHeight) {
        let newScrollY = scrollY + event.deltaY;
        if (newScrollY < 0) {
          newScrollY = 0;
        } else if (newScrollY > ganttFullHeight - ganttHeight) {
          newScrollY = ganttFullHeight - ganttHeight;
        }
        if (newScrollY !== scrollY) {
          setScrollY(newScrollY);
          event.preventDefault();
        }
      }

      setIgnoreScrollEvent(true);
    };

    // subscribe if scroll is necessary
    wrapperRef.current?.addEventListener("wheel", handleWheel, {
      passive: false,
    });
    return () => {
      wrapperRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, [
    wrapperRef,
    scrollY,
    scrollX,
    ganttHeight,
    svgWidth,
    rtl,
    ganttFullHeight,
  ]);

  const handleScrollY = (event: SyntheticEvent<HTMLDivElement>) => {
    if (scrollY !== event.currentTarget.scrollTop && !ignoreScrollEvent) {
      setScrollY(event.currentTarget.scrollTop);
      setIgnoreScrollEvent(true);
    } else {
      setIgnoreScrollEvent(false);
    }
  };

  const handleScrollX = (event: SyntheticEvent<HTMLDivElement>) => {
    if (scrollX !== event.currentTarget.scrollLeft && !ignoreScrollEvent) {
      setScrollX(event.currentTarget.scrollLeft);
      setIgnoreScrollEvent(true);
    } else {
      setIgnoreScrollEvent(false);
    }
  };

  /**
   * Handles arrow keys events and transform it to new scroll
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    let newScrollY = scrollY;
    let newScrollX = scrollX;
    let isX = true;
    switch (event.key) {
      case "Down": // IE/Edge specific value
      case "ArrowDown":
        newScrollY += rowHeight;
        isX = false;
        break;
      case "Up": // IE/Edge specific value
      case "ArrowUp":
        newScrollY -= rowHeight;
        isX = false;
        break;
      case "Left":
      case "ArrowLeft":
        newScrollX -= columnWidth;
        break;
      case "Right": // IE/Edge specific value
      case "ArrowRight":
        newScrollX += columnWidth;
        break;
    }
    if (isX) {
      if (newScrollX < 0) {
        newScrollX = 0;
      } else if (newScrollX > svgWidth) {
        newScrollX = svgWidth;
      }
      setScrollX(newScrollX);
    } else {
      if (newScrollY < 0) {
        newScrollY = 0;
      } else if (newScrollY > ganttFullHeight - ganttHeight) {
        newScrollY = ganttFullHeight - ganttHeight;
      }
      setScrollY(newScrollY);
    }
    setIgnoreScrollEvent(true);
  };

  const tableProps: TaskListProps<T> = useMemo(
    () => ({
      rowHeight,
      rowWidth: listCellWidth,
      fontFamily,
      fontSize,
      tasks: taskListTasks,
      locale,
      headerHeight,
      ganttHeight,
      selectedTask,
      taskListRef,
      scrollY,
      setSelectedTask: handleSelectedTask,
      onExpanderClick: handleExpanderClick,
      TaskListHeader: renderTaskListHeader,
      TaskListBody: renderTaskListBody,
    }),
    [
      rowHeight,
      listCellWidth,
      fontFamily,
      fontSize,
      taskListTasks,
      locale,
      headerHeight,
      ganttHeight,
      selectedTask,
      scrollY,
      handleSelectedTask,
      handleExpanderClick,
      renderTaskListHeader,
      renderTaskListBody,
    ]
  );

  return (
    <>
      <div
        className={styles.wrapper}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        ref={wrapperRef}
      >
        {renderTaskListTable ? (
          <>
            {renderTaskListTable({
              tasks: taskListTasks,
              taskListRef,
              scrollY,
              setSelectedTask: handleSelectedTask,
              onExpanderClick: handleExpanderClick,
              selectedTaskId: selectedTask?.task.id,
            })}
          </>
        ) : (
          <>{listCellWidth > 0 && <TaskListDefault {...tableProps} />} </>
        )}
        <TaskGantt
          gridProps={gridProps}
          calendarProps={calendarProps}
          barProps={barProps}
          ganttHeight={ganttHeight}
          scrollY={scrollY}
          scrollX={scrollX}
        />
        {ganttEvent.changedTask && (
          <Tooltip<T>
            arrowIndent={arrowIndent}
            rowHeight={rowHeight}
            svgContainerHeight={svgContainerHeight}
            svgContainerWidth={svgContainerWidth}
            fontFamily={fontFamily}
            fontSize={fontSize}
            scrollX={scrollX}
            scrollY={scrollY}
            task={ganttEvent.changedTask}
            headerHeight={headerHeight}
            taskListWidth={taskListWidth}
            TooltipContent={renderTooltipContent}
            rtl={rtl}
          />
        )}
        <VerticalScroll
          ganttFullHeight={ganttFullHeight}
          ganttHeight={ganttHeight}
          headerHeight={headerHeight}
          scroll={scrollY}
          onScroll={handleScrollY}
          rtl={rtl}
        />
      </div>
      <HorizontalScroll
        svgWidth={svgWidth}
        taskListWidth={taskListWidth}
        scroll={scrollX}
        rtl={rtl}
        onScroll={handleScrollX}
      />
    </>
  );
};

export const GanttViewport = React.memo(
  GanttViewportInner
) as typeof GanttViewportInner;