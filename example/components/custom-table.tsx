import React from "react";
import { Task } from "../../src";

const MyTaskListTable: React.FC<{
  tasks: Task[];
  onExpanderClick: (task: Task) => void;
  ganttHeight: number;
  rowHeight: number;
  rowWidth: number;
  locale: string;
  selectedTaskId: string;
  horizontalContainerRef: React.RefObject<HTMLTableSectionElement>;
  setSelectedTask: (taskId: string) => void;
}> = ({
  tasks,
  onExpanderClick,
  ganttHeight,
  rowHeight,
  rowWidth,
  horizontalContainerRef,
}) => {
  return (
    <tbody
      ref={horizontalContainerRef}
      style={ganttHeight ? { maxHeight: ganttHeight } : {}}
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
            <td style={{ minWidth: `${rowWidth}px` }}>
              <a href="#">Link to {t.name}</a>
            </td>
            <td style={{ minWidth: `${rowWidth}px` }}>
              {t.isDisabled ? "Disabled" : "Not Disabled"}
            </td>
          </tr>
        );
      })}
    </tbody>
  );
};

export default MyTaskListTable;
