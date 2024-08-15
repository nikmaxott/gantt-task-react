import React from "react";

const MyTaskListHeader: React.FC<{
  headerHeight: number;
  rowWidth: string;
}> = ({ headerHeight }) => {
  return (
    <thead>
      <tr
        style={{
          height: headerHeight - 2,
        }}
      >
        <th>Ex</th>
        <th colSpan={2}>My Custom Task List Header OVER 2</th>
      </tr>
    </thead>
  );
};

export default MyTaskListHeader;
