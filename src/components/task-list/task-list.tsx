import React, { useEffect, useRef } from "react";
import { BarTask } from "../../types/bar-task";
import { Task } from "../../types/public-types";

export type TaskListProps<T extends Task> = {
  headerHeight: number;
  rowWidth: number;
  fontFamily: string;
  fontSize: string;
  rowHeight: number;
  ganttHeight: number;
  scrollY: number;
  locale: string;
  tasks: T[];
  taskListRef: React.RefObject<HTMLTableElement>;
  selectedTask: BarTask<T> | undefined;
  setSelectedTask: (task: string) => void;
  onExpanderClick: (task: T) => void;
  TaskListHeader: React.FC<{
    headerHeight: number;
    rowWidth: number;
  }>;
  TaskListBody: React.FC<{
    rowHeight: number;
    rowWidth: number;
    locale: string;
    tasks: T[];
    selectedTaskId: string;
    ganttHeight: number;
    horizontalContainerRef: React.RefObject<HTMLTableSectionElement>;
    setSelectedTask: (taskId: string) => void;
    onExpanderClick: (task: T) => void;
  }>;
  TaskListTable?: React.FC<{
    taskListRef: React.RefObject<HTMLTableElement>;
    fontFamily: string;
    fontSize: string;
    headerHeight: number;
    rowHeight: number;
    rowWidth: number;
    tasks: T[];
    locale: string;
    selectedTaskId: string;
    ganttHeight: number;
    horizontalContainerRef: React.RefObject<HTMLTableSectionElement>;
    setSelectedTask: (taskId: string) => void;
    onExpanderClick: (task: T) => void;
  }>;
};

export const TaskList = <T extends Task>({
  headerHeight,
  fontFamily,
  fontSize,
  rowWidth,
  rowHeight,
  scrollY,
  tasks,
  selectedTask,
  setSelectedTask,
  onExpanderClick,
  locale,
  ganttHeight,
  taskListRef,
  TaskListHeader,
  TaskListBody,
  TaskListTable,
}: TaskListProps<T>) => {
  const horizontalContainerRef = useRef<HTMLTableSectionElement>(null);
  useEffect(() => {
    if (horizontalContainerRef.current) {
      horizontalContainerRef.current.scrollTop = scrollY;
    }
  }, [scrollY]);

  const headerProps = {
    headerHeight,
    rowWidth,
  };
  const selectedTaskId = selectedTask ? selectedTask.task.id : "";
  const tableProps = {
    rowHeight,
    rowWidth,
    tasks,
    locale,
    selectedTaskId,
    ganttHeight,
    horizontalContainerRef,
    setSelectedTask,
    onExpanderClick,
  };

  if (TaskListTable) {
    return (
      <TaskListTable
        taskListRef={taskListRef}
        fontFamily={fontFamily}
        fontSize={fontSize}
        headerHeight={headerHeight}
        {...tableProps}
      />
    );
  }

  return (
    <table
      ref={taskListRef}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
        borderCollapse: "collapse",
      }}
    >
      <TaskListHeader {...headerProps} />
      <TaskListBody {...tableProps} />
    </table>
  );
};
