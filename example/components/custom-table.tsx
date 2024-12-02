import React, { useEffect, useRef } from "react";
import { Task } from "../../src";

export type TaskListProps = {
  tasks: Task[];
  taskListRef: React.RefObject<HTMLTableElement>;
  scrollY: number;
  selectedTaskId?: string;
  setSelectedTask: (taskId: string) => void;
  onExpanderClick: (task: Task) => void;
};

export default function MyTaskListTable({
  scrollY,
  tasks,
  selectedTaskId,
  setSelectedTask,
  onExpanderClick,
  taskListRef,
}: TaskListProps) {
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
        borderCollapse: "collapse",
      }}
    >
      <thead style={{ display: "block" }}>
        <tr>
          <th>Ex</th>
          <th colSpan={2}>My Custom Task List Header OVER 2</th>
          <th>Final</th>
        </tr>
      </thead>
      <tbody
        ref={horizontalContainerRef}
        style={{
          margin: 0,
          padding: 0,
          overflow: "hidden",
          overflowY: "auto",
          display: "block",
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
            <tr
              key={t.id}
              style={{ background: selectedTaskId === t.id ? "gray" : "" }}
              onClick={() => setSelectedTask(t.id)}
            >
              <td>
                {expanderSymbol ? (
                  <button type="button" onClick={() => onExpanderClick(t)}>
                    {expanderSymbol}
                  </button>
                ) : null}
              </td>
              <td colSpan={2}>
                <a href="#">Link to {t.name}</a>
              </td>
              <td>{t.isDisabled ? "Disabled" : "Not Disabled"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
