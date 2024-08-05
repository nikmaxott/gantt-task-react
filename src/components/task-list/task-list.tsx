import React, { useEffect, useRef } from "react";
import { BarTask } from "../../types/bar-task";
import { Task } from "../../types/public-types";

export type TaskListProps<T extends Task> = {
  headerHeight: number;
  rowWidth: string;
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
    rowWidth: string;
  }>;
  TaskListTable: React.FC<{
    rowHeight: number;
    rowWidth: string;
    locale: string;
    tasks: T[];
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
      <TaskListTable {...tableProps} />
    </table>
  );
};
