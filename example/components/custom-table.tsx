import React, { useEffect, useRef } from "react";
import { Task } from "../../src";

export type TaskListProps = {
  taskListRef: React.RefObject<HTMLTableElement>;
  fontFamily: string;
  fontSize: string;
  headerHeight: number;
  rowHeight: number;
  rowWidth: number;
  tasks: Task[];
  locale: string;
  selectedTaskId: string;
  ganttHeight: number;
  horizontalContainerRef: React.RefObject<HTMLTableSectionElement>;
  setSelectedTask: (taskId: string) => void;
  onExpanderClick: (task: Task) => void;
  scrollY: number;
};

export const TaskList = ({
  fontFamily,
  fontSize,
  rowWidth,
  rowHeight,
  scrollY,
  tasks,
  selectedTask,
  setSelectedTask,
  onExpanderClick,
  ganttHeight,
  taskListRef,
}: TaskListProps) => {
  const horizontalContainerRef = useRef<HTMLTableSectionElement>(null);
  useEffect(() => {
    if (horizontalContainerRef.current) {
      horizontalContainerRef.current.scrollTop = scrollY;
    }
  }, [scrollY]);

  return (
    <table
      ref={taskListRef}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
        borderCollapse: "collapse",
      }}
    >
      <tbody
        ref={horizontalContainerRef}
        style={{
          margin: 0,
          padding: 0,
          overflow: "hidden",
          overflowY: "auto",
          display: "block",
          maxHeight: ganttHeight ? ganttHeight : "",
        }}
      >
        {tasks.map(t => {
          let expanderSymbol = "";
          if (t.hideChildren === false) {
            expanderSymbol = "YES";
          } else if (t.hideChildren === true) {
            expanderSymbol = "NO";
          }

          return (
            <tr key={t.id} style={{ height: rowHeight }}>
              <td>
                {expanderSymbol ? (
                  <button type="button" onClick={() => onExpanderClick(t)}>
                    {expanderSymbol}
                  </button>
                ) : null}
              </td>
              <td style={{ minWidth: rowWidth }} colSpan={2}>
                <a href="#">Link to {t.name}</a>
              </td>
              <td style={{ minWidth: rowWidth }}>
                {t.isDisabled ? "Disabled" : "Not Disabled"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
