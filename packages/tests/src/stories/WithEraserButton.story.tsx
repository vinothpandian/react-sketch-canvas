import { useRef } from "react";
import {
  ReactSketchCanvas,
  ReactSketchCanvasProps,
  ReactSketchCanvasRef,
} from "react-sketch-canvas";

interface WithEraserButtonProps extends ReactSketchCanvasProps {
  eraserButtonId?: string;
  penButtonId?: string;
}

export function WithEraserButton({
  eraserButtonId = "eraser-button",
  penButtonId = "pen-button",
  ...canvasProps
}: WithEraserButtonProps) {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);

  const handleEraserClick = () => {
    canvasRef.current?.eraseMode(true);
  };

  const handlePenClick = () => {
    canvasRef.current?.eraseMode(false);
  };

  return (
    <div>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <ReactSketchCanvas ref={canvasRef} {...canvasProps} />
      <button id={eraserButtonId} type="button" onClick={handleEraserClick}>
        Eraser
      </button>
      <button id={penButtonId} type="button" onClick={handlePenClick}>
        Pen
      </button>
    </div>
  );
}
