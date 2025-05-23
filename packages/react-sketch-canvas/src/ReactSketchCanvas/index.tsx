import * as React from "react";
import { useCallback } from "react";
import { Canvas } from "../Canvas";
import {
  CanvasPath,
  ExportImageOptions,
  ExportImageType,
  Point,
} from "../types";
import { CanvasRef } from "../Canvas/types";
import { ReactSketchCanvasProps, ReactSketchCanvasRef } from "./types";

type Operation = {
  type: "undo" | "redo" | "clear" | "loadPaths";
  payload?: CanvasPath[];
};

/**
 * ReactSketchCanvas is a wrapper around Canvas component to provide a controlled way to manage the canvas paths.
 * It provides a set of methods to manage the canvas paths, undo, redo, clear and reset the canvas.
 *
 * @param props - Props for the ReactSketchCanvas component
 * @param ref - Reference to the ReactSketchCanvas component
 *
 * @returns ReactSketchCanvas component
 */
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
    withViewBox = false,
    readOnly = false,
  } = props;

  const svgCanvas = React.createRef<CanvasRef>();
  const [drawMode, setDrawMode] = React.useState<boolean>(true);
  const [isDrawing, setIsDrawing] = React.useState<boolean>(false);
  const [history, setHistory] = React.useState<CanvasPath[][]>([[]]);
  const [historyPos, setHistoryPos] = React.useState<number>(0);
  const [historySynced, setHistorySynced] = React.useState<boolean>(false);
  const [currentPaths, setCurrentPaths] = React.useState<CanvasPath[]>([]);
  const [operationQueue, setOperationQueue] = React.useState<Operation[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = React.useState(false);

  const addLastStroke = useCallback((): void => {
    if (!historySynced) {
      setHistory((his) => [...his.slice(0, historyPos), [...currentPaths]]);
      setHistorySynced(true);
    }
  }, [currentPaths, historyPos, historySynced]);

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

  const processQueue = React.useCallback(async () => {
    if (isProcessingQueue || operationQueue.length === 0) return;

    setIsProcessingQueue(true);
    const operation = operationQueue[0];

    try {
      switch (operation.type) {
        case "undo":
          if (historyPos > 0) {
            addLastStroke();
            setCurrentPaths(history[historyPos - 1]);
            setHistoryPos((pos) => pos - 1);
          }
          break;
        case "redo":
          if (historyPos < history.length - 1) {
            addLastStroke();
            setCurrentPaths(history[historyPos + 1]);
            setHistoryPos((pos) => pos + 1);
          }
          break;
        case "clear":
          addLastStroke();
          setCurrentPaths([]);
          setHistory((his) => [...his.slice(0, historyPos + 1), []]);
          setHistoryPos((pos) => pos + 1);
          break;
        case "loadPaths":
          if (operation.payload) {
            addLastStroke();
            setCurrentPaths((paths) => {
              const newPaths = [...paths, ...operation.payload!];
              setHistory((his) => {
                const newHistoryPos = historyPos + 1;
                setHistoryPos(newHistoryPos);
                return [...his.slice(0, newHistoryPos), newPaths];
              });
              return newPaths;
            });
          }
          break;
        default:
          throw new Error(`Unknown operation type: ${operation.type}`);
      }
    } finally {
      setOperationQueue((queue) => queue.slice(1));
      setIsProcessingQueue(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    operationQueue,
    isProcessingQueue,
    historyPos,
    history,
    currentPaths,
    addLastStroke,
  ]);

  React.useEffect(() => {
    processQueue();
  }, [processQueue, operationQueue]);

  const enqueueOperation = useCallback((operation: Operation) => {
    setOperationQueue((queue) => [...queue, operation]);
  }, []);

  React.useImperativeHandle(
    ref,
    () => ({
      eraseMode: (erase: boolean): void => {
        setDrawMode(!erase);
      },
      clearCanvas: (): void => {
        enqueueOperation({ type: "clear" });
      },
      undo: (): void => {
        enqueueOperation({ type: "undo" });
      },
      redo: (): void => {
        enqueueOperation({ type: "redo" });
      },
      exportImage: (
        imageType: ExportImageType,
        options?: ExportImageOptions,
      ): Promise<string> => {
        const exportImage = svgCanvas.current?.exportImage;

        if (!exportImage) {
          throw Error("Export function called before canvas loaded");
        } else {
          return exportImage(imageType, options);
        }
      },
      exportSvg: (): Promise<string> =>
        new Promise<string>((resolve, reject) => {
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
        }),
      exportPaths: (): Promise<CanvasPath[]> =>
        new Promise<CanvasPath[]>((resolve, reject) => {
          try {
            resolve(currentPaths);
          } catch (e) {
            reject(e);
          }
        }),
      loadPaths: (paths: CanvasPath[]): void => {
        enqueueOperation({ type: "loadPaths", payload: paths });
      },
      getSketchingTime: (): Promise<number> =>
        new Promise<number>((resolve, reject) => {
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
              0,
            );

            resolve(sketchingTime);
          } catch (e) {
            reject(e);
          }
        }),
      resetCanvas: (): void => {
        setHistory([]);
        setHistoryPos(0);
        setCurrentPaths([]);
        setOperationQueue([]);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      currentPaths,
      history,
      historyPos,
      svgCanvas,
      withTimestamp,
      addLastStroke,
      enqueueOperation,
    ],
  );

  const handlePointerDown = (point: Point, isEraser = false): void => {
    setIsDrawing(true);

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
    addLastStroke();
    setHistoryPos((pos) => pos + 1);
    setHistorySynced(false);
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

    const currentStroke = currentPaths.slice(-1)?.[0] ?? null;

    setIsDrawing(false);

    if (!withTimestamp) {
      return;
    }

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
      withViewBox={withViewBox}
      readOnly={readOnly}
    />
  );
});

ReactSketchCanvas.displayName = "@react-sketch-canvas/ReactSketchCanvas";
