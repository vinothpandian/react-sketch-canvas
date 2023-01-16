import * as React from "react";
import { Canvas, CanvasRef } from "../Canvas";
import { CanvasPath, ExportImageType, Point } from "../types";

/* Props validation */
export interface ReactSketchCanvasProps {
  allowOnlyPointerType?: string;
  backgroundImage?: string;
  canvasColor?: string;
  className?: string;
  eraserWidth?: number;
  exportWithBackgroundImage?: boolean;
  height?: string;
  id?: string;
  onChange?: (updatedPaths: CanvasPath[]) => void;
  onStroke?: (path: CanvasPath, isEraser: boolean) => void;
  preserveBackgroundImageAspectRatio?: string;
  strokeColor?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
  svgStyle?: React.CSSProperties;
  width?: string;
  withTimestamp?: boolean;
}

export interface ReactSketchCanvasRef {
  eraseMode: (_erase: boolean) => void;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  exportImage: (imageType: ExportImageType) => Promise<string>;
  exportSvg: () => Promise<string>;
  exportPaths: () => Promise<CanvasPath[]>;
  loadPaths: (paths: CanvasPath[]) => void;
  getSketchingTime: () => Promise<number>;
  resetCanvas: () => void;
}

export const ReactSketchCanvas = React.forwardRef<
  ReactSketchCanvasRef,
  ReactSketchCanvasProps
>((props, ref) => {
  const {
    id = "react-sketch-canvas",
    width = "100%",
    height = "100%",
    className = "",
    canvasColor = "white",
    strokeColor = "red",
    backgroundImage = "",
    exportWithBackgroundImage = false,
    preserveBackgroundImageAspectRatio = "none",
    strokeWidth = 4,
    eraserWidth = 8,
    allowOnlyPointerType = "all",
    style = {
      border: "0.0625rem solid lightgray",
      borderRadius: "0.25rem",
    },
    svgStyle = {},
    onChange = (_paths: CanvasPath[]): void => undefined,
    onStroke = (_path: CanvasPath, _isEraser: boolean): void => undefined,
    withTimestamp = false,
  } = props;

  const svgCanvas = React.createRef<CanvasRef>();
  const [drawMode, setDrawMode] = React.useState<boolean>(true);
  const [isDrawing, setIsDrawing] = React.useState<boolean>(false);
  const [resetStack, setResetStack] = React.useState<CanvasPath[]>([]);
  const [undoStack, setUndoStack] = React.useState<CanvasPath[]>([]);
  const [currentPaths, setCurrentPaths] = React.useState<CanvasPath[]>([]);

  const liftStrokeUp = React.useCallback((): void => {
    const lastStroke = currentPaths.slice(-1)?.[0] ?? null;

    if (lastStroke === null) {
      return;
    }

    onStroke(lastStroke, !lastStroke.drawMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawing]);

  React.useEffect(() => {
    liftStrokeUp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawing]);

  React.useEffect(() => {
    onChange(currentPaths);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPaths]);

  React.useImperativeHandle(ref, () => ({
    eraseMode: (erase: boolean): void => {
      setDrawMode(!erase);
    },
    clearCanvas: (): void => {
      setResetStack([...currentPaths]);
      setCurrentPaths([]);
    },
    undo: (): void => {
      // If there was a last reset then
      if (resetStack.length !== 0) {
        setCurrentPaths([...resetStack]);
        setResetStack([]);

        return;
      }

      setUndoStack((paths) => [...paths, ...currentPaths.slice(-1)]);
      setCurrentPaths((paths) => paths.slice(0, -1));
    },
    redo: (): void => {
      // Nothing to Redo
      if (undoStack.length === 0) return;

      setCurrentPaths((paths) => [...paths, ...undoStack.slice(-1)]);
      setUndoStack((paths) => paths.slice(0, -1));
    },
    exportImage: (imageType: ExportImageType): Promise<string> => {
      const exportImage = svgCanvas.current?.exportImage;

      if (!exportImage) {
        throw Error("Export function called before canvas loaded");
      } else {
        return exportImage(imageType);
      }
    },
    exportSvg: (): Promise<string> => {
      return new Promise<string>((resolve, reject) => {
        const exportSvg = svgCanvas.current?.exportSvg;

        if (!exportSvg) {
          reject(Error("Export function called before canvas loaded"));
        } else {
          exportSvg()
            .then((data) => {
              resolve(data);
            })
            .catch((e) => {
              reject(e);
            });
        }
      });
    },
    exportPaths: (): Promise<CanvasPath[]> => {
      return new Promise<CanvasPath[]>((resolve, reject) => {
        try {
          resolve(currentPaths);
        } catch (e) {
          reject(e);
        }
      });
    },
    loadPaths: (paths: CanvasPath[]): void => {
      setCurrentPaths((path) => [...path, ...paths]);
    },
    getSketchingTime: (): Promise<number> => {
      return new Promise<number>((resolve, reject) => {
        if (!withTimestamp) {
          reject(new Error("Set 'withTimestamp' prop to get sketching time"));
        }

        try {
          const sketchingTime = currentPaths.reduce(
            (totalSketchingTime, path) => {
              const startTimestamp = path.startTimestamp ?? 0;
              const endTimestamp = path.endTimestamp ?? 0;

              return totalSketchingTime + (endTimestamp - startTimestamp);
            },
            0
          );

          resolve(sketchingTime);
        } catch (e) {
          reject(e);
        }
      });
    },
    resetCanvas: (): void => {
      setResetStack([]);
      setUndoStack([]);
      setCurrentPaths([]);
    },
  }));

  const handlePointerDown = (point: Point, isEraser = false): void => {
    setIsDrawing(true);
    setUndoStack([]);

    const isDraw = !isEraser && drawMode;

    let stroke: CanvasPath = {
      drawMode: isDraw,
      strokeColor: isDraw ? strokeColor : "#000000", // Eraser using mask
      strokeWidth: isDraw ? strokeWidth : eraserWidth,
      paths: [point],
    };

    if (withTimestamp) {
      stroke = {
        ...stroke,
        startTimestamp: Date.now(),
        endTimestamp: 0,
      };
    }

    setCurrentPaths((paths) => [...paths, stroke]);
  };

  const handlePointerMove = (point: Point): void => {
    if (!isDrawing) return;

    const currentStroke = currentPaths.slice(-1)[0];
    const updatedStroke = {
      ...currentStroke,
      paths: [...currentStroke.paths, point],
    };
    setCurrentPaths((paths) => [...paths.slice(0, -1), updatedStroke]);
  };

  const handlePointerUp = (): void => {
    if (!isDrawing) {
      return;
    }

    setIsDrawing(false);

    if (!withTimestamp) {
      return;
    }

    const currentStroke = currentPaths.slice(-1)?.[0] ?? null;

    if (currentStroke === null) {
      return;
    }

    const updatedStroke = {
      ...currentStroke,
      endTimestamp: Date.now(),
    };

    setCurrentPaths((paths) => [...paths.slice(0, -1), updatedStroke]);
  };

  return (
    <Canvas
      ref={svgCanvas}
      id={id}
      width={width}
      height={height}
      className={className}
      canvasColor={canvasColor}
      backgroundImage={backgroundImage}
      exportWithBackgroundImage={exportWithBackgroundImage}
      preserveBackgroundImageAspectRatio={preserveBackgroundImageAspectRatio}
      allowOnlyPointerType={allowOnlyPointerType}
      style={style}
      svgStyle={svgStyle}
      paths={currentPaths}
      isDrawing={isDrawing}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  );
});
