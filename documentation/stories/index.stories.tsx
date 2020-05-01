import * as React from "react";
import { SvgSketchCanvas } from "react-sketch-canvas";
import {
  withKnobs,
  color,
  number,
  optionsKnob as options,
} from "@storybook/addon-knobs";

export default {
  title: "Canvas",
  component: SvgSketchCanvas,
  parameters: {
    info: { inline: true },
  },
  decorators: [withKnobs],
};

const pointerModes = {
  Mouse: "mouse",
  Touch: "touch",
  Pen: "pen",
  All: "all",
};

export const Default = () => {
  const canvasColor = color("Canvas background color", "#FFFFFF");
  const strokeColor = color("Stroke color", "#000000");
  const strokeWidth = number("Stroke thickness", 4);
  const eraserWidth = number("Eraser thickness", 5);

  const pointerType = options("Allowed pointer type", pointerModes, "all", {
    display: "radio",
  });

  return (
    <SvgSketchCanvas
      strokeWidth={strokeWidth}
      strokeColor={strokeColor}
      canvasColor={canvasColor}
      eraserWidth={eraserWidth}
      allowOnlyPointerType={pointerType}
    />
  );
};
