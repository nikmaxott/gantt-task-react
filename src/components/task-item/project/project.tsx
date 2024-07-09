import React from "react";
import { TaskItemProps } from "../task-item";
import styles from "./project.module.css";

export const Project: React.FC<TaskItemProps> = ({ task, isSelected }) => {
  const barColor = isSelected
    ? task.styles.backgroundSelectedColor
    : task.styles.backgroundColor;
  const strokeColor = isSelected
    ? task.styles.strokeSelectedColor
    : task.styles.strokeColor;
  const processColor = isSelected
    ? task.styles.progressSelectedColor
    : task.styles.progressColor;
  const projectWith = task.x2 - task.x1;

  return (
    <g
      tabIndex={0}
      className={styles.projectWrapper}
      aria-labelledby={`taskName${task.id}`}
    >
      <rect
        fill={barColor}
        x={task.x1}
        width={projectWith}
        y={task.y}
        height={task.height}
        rx={task.barCornerRadius}
        ry={task.barCornerRadius}
        className={styles.projectBackground}
      />
      <rect
        x={task.progressX}
        width={task.progressWidth}
        y={task.y}
        height={task.height}
        ry={task.barCornerRadius}
        rx={task.barCornerRadius}
        fill={processColor}
      />
      <line
        style={{ stroke: strokeColor, strokeWidth: 4 }}
        x1={task.x1}
        y1={task.y}
        x2={task.x1}
        y2={task.y + task.height}
      />
      <line
        style={{ stroke: strokeColor, strokeWidth: 4 }}
        x1={task.x2}
        y1={task.y}
        x2={task.x2}
        y2={task.y + task.height}
      />
    </g>
  );
};
