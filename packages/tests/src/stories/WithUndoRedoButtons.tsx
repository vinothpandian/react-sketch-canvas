import { useRef } from "react";
import {
  ReactSketchCanvas,
  ReactSketchCanvasProps,
  ReactSketchCanvasRef,
} from "react-sketch-canvas";

interface WithUndoRedoButtonsProps extends ReactSketchCanvasProps {
  undoButtonId?: string;
  redoButtonId?: string;
  clearCanvasButtonId?: string;
  resetCanvasButtonId?: string;
}

export function WithUndoRedoButtons({
  undoButtonId = "undo-button",
  redoButtonId = "redo-button",
  clearCanvasButtonId = "clear-canvas-button",
  resetCanvasButtonId = "reset-canvas-button",
  ...canvasProps
}: WithUndoRedoButtonsProps) {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);

  const handleUndoClick = () => {
    canvasRef.current?.undo();
  };

  const handleRedoClick = () => {
    canvasRef.current?.redo();
  };

  const handleClearCanvasClick = () => {
    canvasRef.current?.clearCanvas();
  };

  const handleResetCanvasClick = () => {
    canvasRef.current?.resetCanvas();
  };

  return (
    <div>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <ReactSketchCanvas ref={canvasRef} {...canvasProps} />
      <button id={undoButtonId} type="button" onClick={handleUndoClick}>
        Undo
      </button>
      <button id={redoButtonId} type="button" onClick={handleRedoClick}>
        Redo
      </button>
      <button
        id={clearCanvasButtonId}
        type="button"
        onClick={handleClearCanvasClick}
      >
        Clear Canvas
      </button>
      <button
        id={resetCanvasButtonId}
        type="button"
        onClick={handleResetCanvasClick}
      >
        Reset Canvas
      </button>
    </div>
  );
}
