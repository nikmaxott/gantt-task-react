import React from "react";
import { GridBody, GridBodyProps } from "./grid-body";

export type GridProps = GridBodyProps;
const GridInternal = (props: GridProps) => {
  return (
    <g className="grid">
      <GridBody {...props} />
    </g>
  );
};

export const Grid = React.memo(GridInternal) as typeof GridInternal;
