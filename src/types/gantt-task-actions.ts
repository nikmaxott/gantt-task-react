import { BarTask } from "./bar-task";
import { Task } from "./public-types";

export type BarMoveAction = "progress" | "end" | "start" | "move";
export type GanttContentMoveAction =
  | "mouseenter"
  | "mouseleave"
  | "delete"
  | "dblclick"
  | "click"
  | "select"
  | ""
  | BarMoveAction;

export type GanttEvent<T extends Task> = {
  changedTask?: BarTask<T>;
  originalSelectedTask?: BarTask<T>;
  action: GanttContentMoveAction;
};
