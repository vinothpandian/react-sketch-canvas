import * as React from "react";
import * as ReactDOM from "react-dom";
import { ReactSketchCanvas, Point } from "react-sketch-canvas"; // Adjusted path

// Default canvas for the root path or if no name matches
const DefaultCanvas = () => (
  <ReactSketchCanvas id="default-canvas" strokeColor="blue" strokeWidth={6} />
);

const StraightLineCanvas = () => {
  const straightLineGenerator = (points: Point[]): string => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  };
  return (
    <ReactSketchCanvas
      id="straight-line-canvas"
      getSvgPathFromPoints={straightLineGenerator}
      strokeWidth={4}
      strokeColor="red"
    />
  );
};

const ZigZagLineCanvas = () => {
  const zigZagGenerator = (points: Point[]): string => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const yOffset = i % 2 === 0 ? 0 : 5; // Zigzag effect
      d += ` L ${points[i].x} ${points[i].y + yOffset}`;
    }
    return d;
  };
  return (
    <ReactSketchCanvas
      id="zigzag-line-canvas"
      getSvgPathFromPoints={zigZagGenerator}
      strokeWidth={4}
      strokeColor="green"
    />
  );
};

const AllTests = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const name = queryParams.get("name");

  if (name === "straightLine") {
    return <StraightLineCanvas />;
  }

  if (name === "zigZagLine") {
    return <ZigZagLineCanvas />;
  }

  return <DefaultCanvas />;
};

ReactDOM.render(<AllTests />, document.getElementById("root"));
