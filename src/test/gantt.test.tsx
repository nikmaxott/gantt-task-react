import React from "react";
import { createRoot } from "react-dom/client";
import { Gantt, Task } from "../index";

// Extend SVGElement interface to satisfy typescript
interface ExtendedSVGElement extends SVGElement {
  createSVGPoint: () => SVGPoint;
  getBBox: () => DOMRect;
}

// Mock createSVGPoint method
beforeAll(() => {
  (SVGElement.prototype as ExtendedSVGElement).createSVGPoint = function () {
    return {
      x: 0,
      y: 0,
      matrixTransform: function () {
        return this;
      },
      w: 0,
      z: 0,
      toJSON: function () {
        return this;
      },
    };
  };

  (SVGElement.prototype as ExtendedSVGElement).getBBox = function () {
    return {
      x: 0,
      y: 0,
      width: 100,
      height: 20,
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
      toJSON: function () {
        return this;
      },
    };
  };
});

describe("gantt", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    const root = createRoot(div);
    root.render(
      <Gantt
        tasks={[
          {
            start: new Date(2020, 0, 1),
            end: new Date(2020, 2, 2),
            name: "Redesign website",
            id: "Task 0",
            progress: 45,
            type: "task",
          },
        ]}
      />
    );
  });

  it("renders without crashing with current type", () => {
    const div = document.createElement("div");
    const root = createRoot(div);
    root.render(
      <Gantt<Task>
        tasks={[
          {
            start: new Date(2020, 0, 1),
            end: new Date(2020, 2, 2),
            name: "Redesign website",
            id: "Task 0",
            progress: 45,
            type: "task",
          },
        ]}
      />
    );
  });

  it("renders without crashing with custom type", () => {
    const div = document.createElement("div");
    const root = createRoot(div);

    interface CustomTask extends Task {
      hasExtraField: boolean;
    }

    root.render(
      <Gantt<CustomTask>
        tasks={[
          {
            start: new Date(2020, 0, 1),
            end: new Date(2020, 2, 2),
            name: "Redesign website",
            id: "Task 0",
            hasExtraField: false,
            type: "task",
            progress: 0,
          },
        ]}
      />
    );
  });
});
