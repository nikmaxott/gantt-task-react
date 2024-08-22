import React, { useMemo } from "react";
import styles from "./task-list-table.module.css";
import { Task } from "../../types/public-types";

const localeDateStringCache: { [key: string]: string } = {};
const toLocaleDateStringFactory =
  (locale: string) =>
  (date: Date, dateTimeOptions: Intl.DateTimeFormatOptions) => {
    const key = date.toString();
    let lds = localeDateStringCache[key];
    if (!lds) {
      lds = date.toLocaleDateString(locale, dateTimeOptions);
      localeDateStringCache[key] = lds;
    }
    return lds;
  };
const dateTimeOptions: Intl.DateTimeFormatOptions = {
  weekday: "short",
  year: "numeric",
  month: "long",
  day: "numeric",
};

export const TaskListTableDefault = <T extends Task>({
  rowHeight,
  rowWidth,
  tasks,
  selectedTaskId,
  locale,
  ganttHeight,
  horizontalContainerRef,
  setSelectedTask,
  onExpanderClick,
}: {
  rowHeight: number;
  rowWidth: number;
  locale: string;
  tasks: T[];
  selectedTaskId: string;
  ganttHeight: number;
  horizontalContainerRef: React.RefObject<HTMLTableSectionElement>;
  setSelectedTask: (taskId: string) => void;
  onExpanderClick: (task: T) => void;
}) => {
  const toLocaleDateString = useMemo(
    () => toLocaleDateStringFactory(locale),
    [locale]
  );

  return (
    <tbody
      ref={horizontalContainerRef}
      style={ganttHeight ? { maxHeight: ganttHeight } : {}}
      className={styles.horizontalContainer}
    >
      {tasks.map(t => {
        let expanderSymbol = "";
        if (t.hideChildren === false) {
          expanderSymbol = "▼";
        } else if (t.hideChildren === true) {
          expanderSymbol = "▶";
        }

        const isSelected = selectedTaskId === t.id;

        return (
          <tr
            className={`${styles.taskListTableRow} ${expanderSymbol ? styles.taskListTableRow_Parent : ""} ${isSelected ? styles.taskListTableRow_Selected : ""}`}
            style={{ height: rowHeight }}
            key={`${t.id}row`}
            onClick={() => setSelectedTask(t.id)}
          >
            <td>
              {expanderSymbol ? (
                <button
                  type="button"
                  className={styles.taskListExpander}
                  onClick={() => onExpanderClick(t)}
                >
                  {expanderSymbol}
                </button>
              ) : null}
            </td>
            <td
              className={styles.taskListCell}
              style={{
                minWidth: rowWidth,
                maxWidth: rowWidth,
              }}
              title={t.name}
            >
              {t.name}
            </td>
            <td
              className={styles.taskListCell}
              style={{
                minWidth: rowWidth,
                maxWidth: rowWidth,
              }}
            >
              {toLocaleDateString(t.start, dateTimeOptions)}
            </td>
            <td
              className={styles.taskListCell}
              style={{
                minWidth: rowWidth,
                maxWidth: rowWidth,
              }}
            >
              {toLocaleDateString(t.end, dateTimeOptions)}
            </td>
          </tr>
        );
      })}
    </tbody>
  );
};
