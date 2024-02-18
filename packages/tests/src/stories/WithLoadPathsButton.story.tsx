import { useRef } from "react";
import {
  ReactSketchCanvas,
  ReactSketchCanvasProps,
  ReactSketchCanvasRef,
  CanvasPath,
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
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <ReactSketchCanvas ref={canvasRef} {...canvasProps} />
      <button id={loadPathsButtonId} onClick={handleLoadPathsClick}>
        Load Paths
      </button>
    </div>
  );
}
