import {
  ReactSketchCanvas,
  type ReactSketchCanvasRef,
} from "react-sketch-canvas";
import { type ChangeEvent, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const [eraseMode, setEraseMode] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [eraserWidth, setEraserWidth] = useState(10);

  const handleEraserClick = () => {
    setEraseMode(true);
    canvasRef.current?.eraseMode(true);
  };

  const handlePenClick = () => {
    setEraseMode(false);
    canvasRef.current?.eraseMode(false);
  };

  const handleStrokeWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStrokeWidth(+event.target.value);
  };

  const handleEraserWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEraserWidth(+event.target.value);
  };

  return (
    <div className="d-flex flex-column gap-2">
      <h1>Tools</h1>
      <div className="d-flex gap-2 align-items-center ">
        <button
          className="btn btn-sm btn-primary"
          disabled={!eraseMode}
          onClick={handlePenClick}
        >
          Pen
        </button>
        <button
          className="btn btn-sm btn-primary"
          disabled={eraseMode}
          onClick={handleEraserClick}
        >
          Eraser
        </button>
        <label htmlFor="strokeWidth" className="form-label">
          Stroke width
        </label>
        <input
          disabled={eraseMode}
          type="range"
          className="form-range"
          min="1"
          max="20"
          step="1"
          id="strokeWidth"
          value={strokeWidth}
          onChange={handleStrokeWidthChange}
        />
        <label htmlFor="eraserWidth" className="form-label">
          Eraser width
        </label>
        <input
          disabled={!eraseMode}
          type="range"
          className="form-range"
          min="1"
          max="20"
          step="1"
          id="eraserWidth"
          value={eraserWidth}
          onChange={handleEraserWidthChange}
        />
      </div>
      <h1>Canvas</h1>
      <ReactSketchCanvas
        ref={canvasRef}
        strokeWidth={strokeWidth}
        eraserWidth={eraserWidth}
      />
    </div>
  );
}
