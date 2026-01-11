import { useRef } from "react";
import {
  type CanvasPath,
  ReactSketchCanvas,
  type ReactSketchCanvasProps,
  type ReactSketchCanvasRef,
} from "react-sketch-canvas";

interface WithLoadPathsButtonProps extends ReactSketchCanvasProps {
  loadPathsButtonId?: string;
  paths: CanvasPath[];
}

export function WithLoadPathsButton({
  loadPathsButtonId = "load-paths-button",
  paths,
  ...canvasProps
}: WithLoadPathsButtonProps) {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);

  const handleLoadPathsClick = () => {
    canvasRef.current?.loadPaths(paths);
  };

  return (
    <div>
      <ReactSketchCanvas ref={canvasRef} {...canvasProps} />
      <button
        type="button"
        id={loadPathsButtonId}
        onClick={handleLoadPathsClick}
      >
        Load Paths
      </button>
    </div>
  );
}
