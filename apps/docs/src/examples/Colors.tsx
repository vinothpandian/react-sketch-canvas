import {
  ReactSketchCanvas,
  type ReactSketchCanvasRef,
} from "react-sketch-canvas";
import { type ChangeEvent, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [canvasColor, setCanvasColor] = useState("#ffffff");

  const handleStrokeColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStrokeColor(event.target.value);
  };

  const handleCanvasColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCanvasColor(event.target.value);
  };

  return (
    <div className="d-flex flex-column gap-2 p-2">
      <h1>Tools</h1>
      <div className="d-flex gap-2 align-items-center ">
        <label htmlFor="color">Stroke color</label>
        <input
          type="color"
          value={strokeColor}
          onChange={handleStrokeColorChange}
        />
        <label htmlFor="color">Canvas color</label>
        <input
          type="color"
          value={canvasColor}
          onChange={handleCanvasColorChange}
        />
      </div>
      <h1>Canvas</h1>
      <ReactSketchCanvas
        ref={canvasRef}
        strokeColor={strokeColor}
        canvasColor={canvasColor}
      />
    </div>
  );
}
