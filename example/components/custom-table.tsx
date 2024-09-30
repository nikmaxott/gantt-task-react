import React, { useEffect, useRef } from "react";
import { Task } from "../../src";
import MyTaskListHeader from "./custom-header";
import MyTaskListBody from "./custom-body";

export type TaskListProps = {
  taskListRef: React.RefObject<HTMLTableElement>;
  fontFamily: string;
  fontSize: string;
  headerHeight: number;
  rowHeight: number;
  rowWidth: number;
  tasks: Task[];
  locale: string;
  selectedTask: string;
  ganttHeight: number;
  horizontalContainerRef: React.RefObject<HTMLTableSectionElement>;
  setSelectedTask: (taskId: string) => void;
  onExpanderClick: (task: Task) => void;
};

export const TaskList = ({
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
}: TaskListProps) => {
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
      <MyTaskListHeader {...headerProps} />
      <MyTaskListBody {...tableProps} />
    </table>
  );
};
