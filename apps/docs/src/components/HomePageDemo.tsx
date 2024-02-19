import {
  ReactSketchCanvas,
  type ReactSketchCanvasRef,
} from "react-sketch-canvas";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { IconEraser, IconPencil, IconRestore } from "@tabler/icons-react";
import paths from "../assets/initialSketch.json";

const iconButton =
  "p-2 rounded-xl border cursor-pointer dark:border-accent-900 dark:text-accent-200";
const defaultIconButton =
  "bg-transparent hover:bg-accent-100 dark:hover:bg-accent-800";

export function HomePageDemo() {
  const [eraser, setEraser] = useState(false);
  const ref = useRef<ReactSketchCanvasRef>(null);
  const [strokeColor, setStrokeColor] = useState("#6497eb");

  useEffect(() => {
    if (ref.current) {
      ref.current.loadPaths(paths);
    }
  }, []);

  const handleEraserClick = () => {
    setEraser(true);
    if (ref.current) {
      ref.current.eraseMode(true);
    }
  };

  const handlePencilClick = () => {
    setEraser(false);
    if (ref.current) {
      ref.current.eraseMode(false);
    }
  };

  const handleResetClick = () => {
    if (ref.current) {
      ref.current.resetCanvas();
    }
  };

  const pencilSelected = !eraser
    ? "bg-accent-600 text-accent-50 hover:bg-accent-600 hover:text-accent-50"
    : defaultIconButton;

  const eraserSelected = eraser
    ? "bg-accent-600 text-accent-50 hover:bg-accent-600 hover:text-accent-50"
    : defaultIconButton;

  const onColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStrokeColor(event.target.value);
  };

  return (
    <div className="reset-wrapper flex gap-4">
      <ReactSketchCanvas
        ref={ref}
        canvasColor="transparent"
        height="400px"
        strokeWidth={4}
        strokeColor={strokeColor}
      />
      <div className="flex flex-col w-10">
        <div className="w-auto h-9 rounded-full overflow-hidden">
          <input
            title="Color"
            className="w-[200%] h-[200%] bg-transparent border-none cursor-pointer appearance-none transform-cpu -translate-x-1/4 -translate-y-1/4"
            type="color"
            value={strokeColor}
            onChange={onColorChange}
          />
        </div>
        <hr />
        <button
          title="Pencil"
          className={`${iconButton} ${pencilSelected}`}
          type="button"
          aria-label="pencil"
          onClick={handlePencilClick}
        >
          <IconPencil />
        </button>
        <button
          title="Eraser"
          className={`${iconButton} ${eraserSelected}`}
          type="button"
          aria-label="eraser"
          onClick={handleEraserClick}
        >
          <IconEraser />
        </button>
        <hr />
        <button
          title="Reset"
          className={`${iconButton} ${defaultIconButton}`}
          type="button"
          aria-label="clear"
          onClick={handleResetClick}
        >
          <IconRestore />
        </button>
      </div>
    </div>
  );
}
