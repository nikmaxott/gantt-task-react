import { memo } from "react";
import styles from "./task-list-header.module.css";

type TaskListHeaderProps = {
  headerHeight: number;
  rowWidth: number;
};

const TaskListHeaderDefaultInner = ({
  headerHeight,
  rowWidth,
}: TaskListHeaderProps) => {
  return (
    <thead className={styles.ganttTable}>
      <tr
        style={{
          height: headerHeight - 2,
        }}
      >
        <th></th>
        <th
          className={styles.ganttTable_HeaderItem}
          style={{
            minWidth: rowWidth,
          }}
        >
          &nbsp;Name
        </th>
        <th
          className={styles.ganttTable_HeaderItem}
          style={{
            minWidth: rowWidth,
          }}
        >
          &nbsp;From
        </th>
        <th
          className={styles.ganttTable_HeaderItem}
          style={{
            minWidth: rowWidth,
          }}
        >
          &nbsp;To
        </th>
      </tr>
    </thead>
  );
};

export const TaskListHeaderDefault = memo(
  TaskListHeaderDefaultInner
) as typeof TaskListHeaderDefaultInner;
