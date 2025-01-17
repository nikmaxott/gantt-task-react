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
  locale: string;
  tasks: T[];
  taskListRef: React.RefObject<HTMLTableElement | null>;
  selectedTask: BarTask<T> | undefined;
  scrollY: number;
  setSelectedTask: (task: string) => void;
  onExpanderClick: (task: T) => void;
  TaskListHeader: (props: {
    headerHeight: number;
    rowWidth: number;
  }) => React.ReactNode;
  TaskListBody: (props: {
    rowHeight: number;
    rowWidth: number;
    locale: string;
    tasks: T[];
    selectedTaskId: string;
    ganttHeight: number;
    horizontalContainerRef: React.RefObject<HTMLTableSectionElement | null>;
    setSelectedTask: (taskId: string) => void;
    onExpanderClick: (task: T) => void;
  }) => React.ReactNode;
};

export const TaskList = <T extends Task>({
  headerHeight,
  fontFamily,
  fontSize,
  rowWidth,
  rowHeight,
  tasks,
  selectedTask,
  locale,
  ganttHeight,
  scrollY,
  taskListRef,
  TaskListHeader,
  TaskListBody,
  setSelectedTask,
  onExpanderClick,
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
