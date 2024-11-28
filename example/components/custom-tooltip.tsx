import React from "react";
import { Task } from "../../src";
type MyToolTipProps = {
  task: Task;
  fontSize: string;
  fontFamily: string;
};
const MyToolTip = (props: MyToolTipProps) => {
  return (
    <div
      style={{ backgroundColor: "white", borderRadius: "5px", padding: "2rem" }}
    >
      <b>{props.task.name}</b>
      <br />
      <span>{props.task.start.toDateString()}</span>
      <br />
      <span>{props.task.end.toDateString()}</span>
    </div>
  );
};

export default MyToolTip;
