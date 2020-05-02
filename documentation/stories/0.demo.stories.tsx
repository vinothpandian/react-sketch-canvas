import * as React from "react";
import { SvgSketchCanvas } from "react-sketch-canvas";
import {
  withKnobs,
  color,
  number,
  button,
  text,
  optionsKnob as options,
} from "@storybook/addon-knobs";
import "./0.demo.stories.scss";

export default {
  title: "Full Demo",
  component: SvgSketchCanvas,
  parameters: {
    info: { inline: true },
  },
  decorators: [withKnobs],
};

const pointerModes = {
  mouse: "mouse",
  touch: "touch",
  pen: "pen",
  all: "all",
};

type CanvasRef = React.RefObject<SvgSketchCanvas>;

export const SketchCanvas = () => {
  const canvasRef: CanvasRef = React.useRef<SvgSketchCanvas>(null);

  const width = text("Canvas width in em/rem/px (width)", "100%");
  const height = text("Canvas height in em/rem/px (height)", "400px");
  const canvasColor = color("Canvas background color (canvasColor)", "#FFFFFF");
  const background = text(
    "SVG background using CSS (background)",
    "no-repeat url(https://via.placeholder.com/150)"
  );
  const strokeColor = color("Stroke color (strokeColor)", "#000000");
  const strokeWidth = number("Stroke thickness (strokeWidth)", 4);
  const eraserWidth = number("Eraser thickness (eraserWidth)", 5);
  const pointerType = options(
    "Allowed pointer type (allowOnlyPointerType)",
    pointerModes,
    "all",
    {
      display: "inline-radio",
    }
  );

  button("Pen (eraseMode(false))", () => {
    const eraseMode = canvasRef.current?.eraseMode;

    if (eraseMode) {
      eraseMode(false);
    }
  });

  button("Eraser (eraseMode(true))", () => {
    const eraseMode = canvasRef.current?.eraseMode;

    if (eraseMode) {
      eraseMode(true);
    }
  });

  button("Undo (undo())", () => {
    const undo = canvasRef.current?.undo;

    if (undo) {
      undo();
    }
  });

  button("Redo (redo())", () => {
    const redo = canvasRef.current?.redo;

    if (redo) {
      redo();
    }
  });

  button("Reset (resetCanvas())", () => {
    const resetCanvas = canvasRef.current?.resetCanvas;

    if (resetCanvas) {
      resetCanvas();
    }
  });

  return (
    <div className="container">
      <div className="canvas">
        <h1>React Sketch Canvas - Full demo</h1>
        <SvgSketchCanvas
          ref={canvasRef}
          width={width}
          height={height}
          background={background}
          strokeWidth={strokeWidth}
          strokeColor={strokeColor}
          canvasColor={canvasColor}
          eraserWidth={eraserWidth}
          allowOnlyPointerType={pointerType}
        />
      </div>
    </div>
  );
};
