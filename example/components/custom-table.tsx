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
  taskListRef,
  scrollY,
  tasks,
  selectedTaskId,
  setSelectedTask,
  onExpanderClick,
}: TaskListProps) {
  const horizontalContainerRef = useRef<HTMLTableSectionElement>(null);
  const rowHeight = 50;
  const rowWidth = 155;
  const height = 200;

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
        <tr style={{ height: rowHeight - 2, border: "1px solid black" }}>
          <th
            style={{
              minWidth: 40,
            }}
          >
            Ex
          </th>
          <th
            style={{
              minWidth: rowWidth * 2,
            }}
            colSpan={2}
          >
            My Custom Task List Header OVER 2
          </th>
          <th
            style={{
              minWidth: rowWidth,
            }}
          >
            Final
          </th>
        </tr>
      </thead>
      <tbody
        ref={horizontalContainerRef}
        style={{
          margin: 0,
          padding: 0,
          overflowX: "hidden",
          overflowY: "clip",
          display: "block",
          maxHeight: height,
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
              style={{
                background: selectedTaskId === t.id ? "gray" : "",
                height: rowHeight,
                border: "1px solid black",
              }}
              onClick={() => setSelectedTask(t.id)}
            >
              <td
                style={{
                  minWidth: 40,
                }}
              >
                {expanderSymbol ? (
                  <button type="button" onClick={() => onExpanderClick(t)}>
                    {expanderSymbol}
                  </button>
                ) : null}
              </td>
              <td
                style={{
                  minWidth: rowWidth * 2,
                }}
                colSpan={2}
              >
                <a href="#">Link to {t.name}</a>
              </td>
              <td
                style={{
                  minWidth: rowWidth,
                }}
              >
                {t.isDisabled ? "Disabled" : "Not Disabled"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
