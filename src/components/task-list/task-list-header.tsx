import React from "react";
import styles from "./task-list-header.module.css";

export const TaskListHeaderDefault: React.FC<{
  headerHeight: number;
  rowWidth: string;
}> = ({ headerHeight, rowWidth }) => {
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
