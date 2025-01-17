import React from "react";
import { CustomTask } from "../App";

const MyTaskListBodyCustom = ({
  tasks,
  ganttHeight,
  rowHeight,
  rowWidth,
  horizontalContainerRef,
  onExpanderClick,
  setSelectedTask,
}: {
  tasks: CustomTask[];
  ganttHeight: number;
  rowHeight: number;
  rowWidth: number;
  locale: string;
  selectedTaskId: string;
  horizontalContainerRef: React.RefObject<HTMLTableSectionElement | null>;
  setSelectedTask: (taskId: string) => void;
  onExpanderClick: (task: CustomTask) => void;
}) => {
  return (
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
          <tr
            key={t.id}
            style={{ height: rowHeight }}
            onClick={() => setSelectedTask(t.id)}
          >
            <td>
              {expanderSymbol ? (
                <button type="button" onClick={() => onExpanderClick(t)}>
                  {expanderSymbol}
                </button>
              ) : null}
            </td>
            <td style={{ minWidth: rowWidth }}>
              <a href="#">Link to {t.name}</a>
            </td>
            <td style={{ minWidth: rowWidth }}>
              {t.hasExtraField ? "Wow!" : "Not Disabled"}
            </td>
          </tr>
        );
      })}
    </tbody>
  );
};

export default MyTaskListBodyCustom;
