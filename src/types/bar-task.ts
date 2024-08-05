import { Task, TaskType } from "./public-types";

export interface BarTask<T extends Task = Task> {
  task: T;
  index: number;
  typeInternal: TaskTypeInternal;
  x1: number;
  x2: number;
  y: number;
  height: number;
  progressX: number;
  progressWidth: number;
  barCornerRadius: number;
  handleWidth: number;
  barChildren: BarTask<T>[];
  styles: {
    backgroundColor: string;
    backgroundSelectedColor: string;
    progressColor: string;
    progressSelectedColor: string;
    strokeColor: string;
    strokeSelectedColor: string;
  };
}

export type TaskTypeInternal = TaskType | "smalltask";
