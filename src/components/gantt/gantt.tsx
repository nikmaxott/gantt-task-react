import { useState, useEffect, useMemo, useCallback } from "react";
import { ViewMode, GanttProps, Task } from "../../types/public-types";
import { GridProps } from "../grid/grid";
import { ganttDateRange, seedDates } from "../../helpers/date-helper";
import { CalendarProps } from "../calendar/calendar";
import { TaskGanttContentProps } from "./task-gantt-content";
import { TaskListHeaderDefault } from "../task-list/task-list-header";
import { TaskListBodyDefault } from "../task-list/task-list-body";
import { StandardTooltipContent } from "../other/tooltip";
import { GanttViewport } from "./gantt-viewport";
import { BarTask } from "../../types/bar-task";
import { convertToBarTasks } from "../../helpers/bar-helper";
import { GanttEvent } from "../../types/gantt-task-actions";
import { DateSetup } from "../../types/date-setup";
import { removeHiddenTasks, sortTasks } from "../../helpers/other-helper";

export const Gantt = <T extends Task>({
  tasks,
  headerHeight = 50,
  columnWidth = 60,
  listCellWidth = 155,
  rowHeight = 50,
  ganttHeight = 0,
  viewMode = ViewMode.Day,
  preStepsCount = 1,
  locale = "en-GB",
  barFill = 60,
  barCornerRadius = 3,
  barProgressColor = "#a3a3ff",
  barProgressSelectedColor = "#8282f5",
  barBackgroundColor = "#b8c2cc",
  barBackgroundSelectedColor = "#aeb8c2",
  projectProgressColor = "#7db59a",
  projectProgressSelectedColor = "#59a985",
  projectBackgroundColor = "#fac465",
  projectBackgroundSelectedColor = "#f7bb53",
  projectStrokeColor = "#fac465",
  projectStrokeSelectedColor = "#f7bb53",
  milestoneBackgroundColor = "#f1c453",
  milestoneBackgroundSelectedColor = "#f29e4c",
  rtl = false,
  handleWidth = 8,
  timeStep = 300000,
  arrowColor = "grey",
  fontFamily = "Arial, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue",
  fontSize = "14px",
  arrowIndent = 20,
  todayColor = "rgba(252, 248, 227, 0.5)",
  viewDate,
  renderTooltipContent = StandardTooltipContent,
  renderTaskListHeader = TaskListHeaderDefault,
  renderTaskListBody = TaskListBodyDefault,
  renderTaskListTable,
  onDateChange,
  onProgressChange,
  onDoubleClick,
  onClick,
  onDelete,
  onSelect,
  onExpanderClick,
}: GanttProps<T>) => {
  const [dateSetup, setDateSetup] = useState<DateSetup>(() => {
    const dateRange = ganttDateRange(tasks, viewMode, preStepsCount);

    if (!dateRange) {
      return { viewMode, dates: [] };
    }

    const [startDate, endDate] = dateRange;
    return { viewMode, dates: seedDates(startDate, endDate, viewMode) };
  });
  const [currentViewDate, setCurrentViewDate] = useState<Date | undefined>(
    undefined
  );

  const [barTasks, setBarTasks] = useState<BarTask<T>[]>([]);
  const [ganttEvent, setGanttEvent] = useState<GanttEvent<T>>({
    action: "",
  });
  const taskHeight = useMemo(
    () => (rowHeight * barFill) / 100,
    [rowHeight, barFill]
  );

  const [selectedTask, setSelectedTask] = useState<BarTask<T>>();
  const [failedTask, setFailedTask] = useState<BarTask<T> | null>(null);

  const svgWidth = dateSetup.dates.length * columnWidth;
  const ganttFullHeight = barTasks.length * rowHeight;

  // A deliberate scroll-to-date jump requested via the `viewDate` prop.
  // Scroll position itself lives entirely in GanttViewport now — this is
  // just a one-shot command handed down to it, computed here because only
  // Gantt has `dateSetup` to resolve a date into a column index.
  const [viewDateScrollX, setViewDateScrollX] = useState<number | undefined>(
    undefined
  );

  // task change events
  useEffect(() => {
    let filteredTasks: T[];
    if (onExpanderClick) {
      filteredTasks = removeHiddenTasks(tasks);
    } else {
      filteredTasks = tasks;
    }
    filteredTasks = filteredTasks.sort(sortTasks);

    const dateRange = ganttDateRange(filteredTasks, viewMode, preStepsCount);

    if (!dateRange) {
      return;
    }

    const [startDate, endDate] = dateRange || [new Date(), new Date()];

    let newDates = seedDates(startDate, endDate, viewMode);
    if (rtl) {
      newDates = newDates.reverse();
    }
    setDateSetup({ dates: newDates, viewMode });
    setBarTasks(
      convertToBarTasks<T>(
        filteredTasks,
        newDates,
        columnWidth,
        rowHeight,
        taskHeight,
        barCornerRadius,
        handleWidth,
        rtl,
        barProgressColor,
        barProgressSelectedColor,
        barBackgroundColor,
        barBackgroundSelectedColor,
        projectProgressColor,
        projectProgressSelectedColor,
        projectBackgroundColor,
        projectBackgroundSelectedColor,
        projectStrokeColor,
        projectStrokeSelectedColor,
        milestoneBackgroundColor,
        milestoneBackgroundSelectedColor
      )
    );
  }, [
    tasks,
    viewMode,
    preStepsCount,
    rowHeight,
    barCornerRadius,
    columnWidth,
    taskHeight,
    handleWidth,
    barProgressColor,
    barProgressSelectedColor,
    barBackgroundColor,
    barBackgroundSelectedColor,
    projectProgressColor,
    projectProgressSelectedColor,
    projectBackgroundColor,
    projectBackgroundSelectedColor,
    milestoneBackgroundColor,
    milestoneBackgroundSelectedColor,
    rtl,
    onExpanderClick,
  ]);

  useEffect(() => {
    if (
      viewMode === dateSetup.viewMode &&
      ((viewDate && !currentViewDate) ||
        (viewDate && currentViewDate?.valueOf() !== viewDate.valueOf()))
    ) {
      const dates = dateSetup.dates;
      const index = dates.findIndex(
        (d, i) =>
          viewDate.valueOf() >= d.valueOf() &&
          i + 1 !== dates.length &&
          viewDate.valueOf() < dates[i + 1].valueOf()
      );
      if (index === -1) {
        return;
      }
      setCurrentViewDate(viewDate);
      setViewDateScrollX(columnWidth * index);
    }
  }, [
    viewDate,
    columnWidth,
    dateSetup.dates,
    dateSetup.viewMode,
    viewMode,
    currentViewDate,
    setCurrentViewDate,
  ]);

  useEffect(() => {
    const { changedTask, action } = ganttEvent;
    if (changedTask) {
      if (action === "delete") {
        setGanttEvent({ action: "" });
        setBarTasks(barTasks.filter(t => t.task.id !== changedTask.task.id));
      } else if (
        action === "move" ||
        action === "end" ||
        action === "start" ||
        action === "progress"
      ) {
        const prevStateTask = barTasks.find(
          t => t.task.id === changedTask.task.id
        );
        if (
          prevStateTask &&
          (prevStateTask.task.start.getTime() !==
            changedTask.task.start.getTime() ||
            prevStateTask.task.end.getTime() !==
              changedTask.task.end.getTime() ||
            prevStateTask.task.progress !== changedTask.task.progress)
        ) {
          // actions for change
          const newTaskList = barTasks.map(t =>
            t.task.id === changedTask.task.id ? changedTask : t
          );
          setBarTasks(newTaskList);
        }
      }
    }
  }, [ganttEvent, barTasks]);

  useEffect(() => {
    if (failedTask) {
      setBarTasks(
        barTasks.map(t => (t.task.id === failedTask.task.id ? failedTask : t))
      );
      setFailedTask(null);
    }
  }, [failedTask, barTasks]);

  /**
   * Task select event
   *
   * useCallback so this stays referentially stable across renders that
   * don't touch barTasks/selectedTask/onSelect — it's threaded down as a
   * prop to TaskGanttContent, TaskList, and (via those) every memoized
   * per-row component, so a fresh function here on every render would
   * silently defeat all of their memoization.
   */
  const handleSelectedTask = useCallback(
    (taskId: string) => {
      const newSelectedTask = barTasks.find(t => t.task.id === taskId);
      const oldSelectedTask = barTasks.find(
        t => !!selectedTask && t.task.id === selectedTask.task.id
      );
      if (onSelect) {
        if (oldSelectedTask) {
          onSelect(oldSelectedTask.task, false);
        }
        if (newSelectedTask) {
          onSelect(newSelectedTask.task, true);
        }
      }
      setSelectedTask(newSelectedTask);
    },
    [barTasks, selectedTask, onSelect]
  );
  const handleExpanderClick = useCallback(
    (task: T) => {
      if (onExpanderClick && task.hideChildren !== undefined) {
        onExpanderClick({ ...task, hideChildren: !task.hideChildren });
      }
    },
    [onExpanderClick]
  );

  // Same task list, new array reference, every render — recomputed only
  // when the underlying bar tasks actually change, so it doesn't defeat
  // memoization on TaskList/TaskListBodyDefault by itself.
  const taskListTasks = useMemo(
    () => barTasks.map(t => t.task),
    [barTasks]
  );

  const gridProps: GridProps = useMemo(
    () => ({
      columnWidth,
      svgWidth,
      tasks,
      rowHeight,
      dates: dateSetup.dates,
      todayColor,
      rtl,
    }),
    [columnWidth, svgWidth, tasks, rowHeight, dateSetup.dates, todayColor, rtl]
  );
  const calendarProps: CalendarProps = useMemo(
    () => ({
      dateSetup,
      locale,
      viewMode,
      headerHeight,
      columnWidth,
      fontFamily,
      fontSize,
      rtl,
    }),
    [
      dateSetup,
      locale,
      viewMode,
      headerHeight,
      columnWidth,
      fontFamily,
      fontSize,
      rtl,
    ]
  );
  const barProps: TaskGanttContentProps<T> = useMemo(
    () => ({
      tasks: barTasks,
      dates: dateSetup.dates,
      ganttEvent,
      selectedTask,
      rowHeight,
      taskHeight,
      columnWidth,
      arrowColor,
      timeStep,
      fontFamily,
      fontSize,
      arrowIndent,
      rtl,
      setGanttEvent,
      setFailedTask,
      setSelectedTask: handleSelectedTask,
      onDateChange,
      onProgressChange,
      onDoubleClick,
      onClick,
      onDelete,
    }),
    [
      barTasks,
      dateSetup.dates,
      ganttEvent,
      selectedTask,
      rowHeight,
      taskHeight,
      columnWidth,
      arrowColor,
      timeStep,
      fontFamily,
      fontSize,
      arrowIndent,
      rtl,
      setGanttEvent,
      setFailedTask,
      handleSelectedTask,
      onDateChange,
      onProgressChange,
      onDoubleClick,
      onClick,
      onDelete,
    ]
  );

  return (
    <GanttViewport<T>
      gridProps={gridProps}
      calendarProps={calendarProps}
      barProps={barProps}
      ganttHeight={ganttHeight}
      ganttFullHeight={ganttFullHeight}
      svgWidth={svgWidth}
      rowHeight={rowHeight}
      columnWidth={columnWidth}
      headerHeight={headerHeight}
      listCellWidth={listCellWidth}
      rtl={rtl}
      arrowIndent={arrowIndent}
      fontFamily={fontFamily}
      fontSize={fontSize}
      locale={locale}
      tasksLength={tasks.length}
      taskListTasks={taskListTasks}
      selectedTask={selectedTask}
      ganttEvent={ganttEvent}
      scrollToX={viewDateScrollX}
      handleSelectedTask={handleSelectedTask}
      handleExpanderClick={handleExpanderClick}
      renderTooltipContent={renderTooltipContent}
      renderTaskListHeader={renderTaskListHeader}
      renderTaskListBody={renderTaskListBody}
      renderTaskListTable={renderTaskListTable}
    />
  );
};
