import React from "react";
import { Task } from "../../src";

const MyTaskListTable: React.FC<{
  tasks: Task[];
  onExpanderClick: (task: Task) => void;
  ganttHeight: number;
  rowHeight: number;
  rowWidth: string;
  locale: string;
  selectedTaskId: string;
  horizontalContainerRef: React.RefObject<HTMLTableSectionElement>;
  setSelectedTask: (taskId: string) => void;
}> = ({
  tasks,
  onExpanderClick,
  ganttHeight,
  rowHeight,
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
            <td>
              <a href="#">Link to {t.name}</a>
            </td>
            <td>{t.isDisabled ? "Disabled" : "Not Disabled"}</td>
          </tr>
        );
      })}
    </tbody>
  );
};

export default MyTaskListTable;
