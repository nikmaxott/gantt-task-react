import { memo, useRef, useEffect } from "react";
import { GridProps, Grid } from "../grid/grid";
import { CalendarProps, Calendar } from "../calendar/calendar";
import { TaskGanttContentProps, TaskGanttContent } from "./task-gantt-content";
import styles from "./gantt.module.css";
import { Task } from "../../types/public-types";

export type TaskGanttProps<T extends Task> = {
  gridProps: GridProps;
  calendarProps: CalendarProps;
  barProps: TaskGanttContentProps<T>;
  ganttHeight: number;
  scrollY: number;
  scrollX: number;
};
const TaskGanttInner = <T extends Task>({
  gridProps,
  calendarProps,
  barProps,
  ganttHeight,
  scrollY,
  scrollX,
}: TaskGanttProps<T>) => {
  const ganttSVGRef = useRef<SVGSVGElement>(null);
  const horizontalContainerRef = useRef<HTMLDivElement>(null);
  const verticalGanttContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (horizontalContainerRef.current) {
      horizontalContainerRef.current.scrollTop = scrollY;
    }
  }, [scrollY]);

  useEffect(() => {
    if (verticalGanttContainerRef.current) {
      verticalGanttContainerRef.current.scrollLeft = scrollX;
    }
  }, [scrollX]);

  return (
    <div
      className={styles.ganttVerticalContainer}
      ref={verticalGanttContainerRef}
      dir="ltr"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={gridProps.svgWidth}
        height={calendarProps.headerHeight}
        fontFamily={barProps.fontFamily}
      >
        <title>Gantt Chart Calendar Header</title>
        <desc>Displays the calendar in {calendarProps.viewMode}s</desc>
        <Calendar {...calendarProps} />
      </svg>
      <div
        ref={horizontalContainerRef}
        className={styles.horizontalContainer}
        style={
          ganttHeight
            ? { height: ganttHeight, width: gridProps.svgWidth }
            : { width: gridProps.svgWidth }
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={gridProps.svgWidth}
          height={barProps.rowHeight * barProps.tasks.length}
          fontFamily={barProps.fontFamily}
          ref={ganttSVGRef}
        >
          <title>Gantt Chart Content</title>
          <desc>Displays the tasks in the Gantt chart</desc>
          <Grid {...gridProps} />
          <TaskGanttContent {...barProps} svg={ganttSVGRef} />
        </svg>
      </div>
    </div>
  );
};

// scrollX/scrollY change on every scroll tick, so this won't bail during
// scrolling itself — the payoff is skipping re-renders triggered by state
// elsewhere in Gantt that don't touch scroll, grid, calendar, or tasks.
export const TaskGantt = memo(TaskGanttInner) as typeof TaskGanttInner;
