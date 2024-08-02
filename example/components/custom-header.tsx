import React from "react";

const MyTaskListHeader: React.FC = () => {
  return (
    <thead>
      <tr>
        <th>Ex</th>
        <th colSpan={2}>My Custom Task List Header OVER 2</th>
      </tr>
    </thead>
  );
};

export default MyTaskListHeader;
