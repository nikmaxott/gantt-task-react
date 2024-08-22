import React from "react";

const MyTaskListHeader: React.FC<{
  headerHeight: number;
  rowWidth: number;
}> = ({ headerHeight, rowWidth }) => {
  return (
    <thead style={{ display: "block" }}>
      <tr
        style={{
          height: headerHeight - 2,
        }}
      >
        <th>Ex</th>
        <th style={{ minWidth: `${rowWidth * 2}px` }} colSpan={2}>
          My Custom Task List Header OVER 2
        </th>
        <th style={{ minWidth: rowWidth }}>Final</th>
      </tr>
    </thead>
  );
};

export default MyTaskListHeader;
