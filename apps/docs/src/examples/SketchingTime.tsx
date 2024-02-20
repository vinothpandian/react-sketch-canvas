import {
  ReactSketchCanvas,
  type ReactSketchCanvasRef,
} from "react-sketch-canvas";
import { useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const [sketchingTime, setSketchingTime] = useState(0);

  const handleSketchingTime = async () => {
    const time = (await canvasRef.current?.getSketchingTime()) || 0;
    setSketchingTime(time);
  };

  const sketchingTimeInSeconds = (sketchingTime / 1_000).toLocaleString();

  return (
    <div className="d-flex flex-column gap-2 p-2">
      <h1>Tools</h1>
      <div className="d-flex gap-2 align-items-center ">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={handleSketchingTime}
        >
          Get Sketching Time
        </button>
        <span>{sketchingTimeInSeconds} seconds</span>
      </div>
      <h1>Canvas</h1>
      <ReactSketchCanvas ref={canvasRef} withTimestamp />
    </div>
  );
}
