import React from "react";
import { CustomTask } from "../App";

const MyTaskListTableCustom: React.FC<{
  tasks: CustomTask[];
  onExpanderClick: (task: CustomTask) => void;
}> = ({ tasks, onExpanderClick }) => {
  return (
    <tbody>
      {tasks.map(t => {
        let expanderSymbol = "";
        if (t.hideChildren === false) {
          expanderSymbol = "YES";
        } else if (t.hideChildren === true) {
          expanderSymbol = "NO";
        }

        return (
          <tr key={t.id}>
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
            <td>{t.hasExtraField ? "Wow!" : "Not Disabled"}</td>
          </tr>
        );
      })}
    </tbody>
  );
};

export default MyTaskListTableCustom;
