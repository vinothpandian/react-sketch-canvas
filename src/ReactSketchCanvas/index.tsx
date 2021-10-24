import { produce } from 'immer';
import * as React from 'react';
import { Canvas, CanvasRef } from '../Canvas';
import { CanvasPath, ExportImageType, Point } from '../types';

export type ReactSketchCanvasStates = {
  resetStack: CanvasPath[];
  undoStack: CanvasPath[];
  currentPaths: CanvasPath[];
};

/* Props validation */
export interface ReactSketchCanvasProps {
  width?: string;
  height?: string;
  className?: string;
  strokeColor?: string;
  canvasColor?: string;
  backgroundImage?: string;
  exportWithBackgroundImage?: boolean;
  preserveBackgroundImageAspectRatio?: string;
  strokeWidth?: number;
  eraserWidth?: number;
  allowOnlyPointerType?: string;
  onChange?: (updatedPaths: CanvasPath[]) => void;
  onStroke?: (path: CanvasPath, isEraser: boolean) => void;
  style?: React.CSSProperties;
  withTimestamp?: boolean;
}

export interface ReactSketchCanvasRef {
  eraseMode: (erase: boolean) => void;
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
    width = '100%',
    height = '100%',
    className = '',
    canvasColor = 'white',
    strokeColor = 'red',
    backgroundImage = '',
    exportWithBackgroundImage = false,
    preserveBackgroundImageAspectRatio = 'none',
    strokeWidth = 4,
    eraserWidth = 8,
    allowOnlyPointerType = 'all',
    style = {
      border: '0.0625rem solid #9c9c9c',
      borderRadius: '0.25rem',
    },
    onChange = (_paths: CanvasPath[]): void => {},
    onStroke = (_path: CanvasPath, _isEraser: boolean): void => {},
    withTimestamp = false,
  } = props;

  const svgCanvas = React.createRef<CanvasRef>();
  const [drawMode, setDrawMode] = React.useState<boolean>(true);
  const [isDrawing, setIsDrawing] = React.useState<boolean>(false);

  const [state, setState] = React.useState<ReactSketchCanvasStates>({
    // eslint-disable-next-line react/no-unused-state
    resetStack: [],
    undoStack: [],
    currentPaths: [],
  });

  const { undoStack, resetStack, currentPaths } = state;

  const liftStrokeUp = React.useCallback((): void => {
    const lastStroke = currentPaths.at(-1);

    if (lastStroke === undefined) {
      console.warn('No stroke found!');
      return;
    }

    onStroke(lastStroke, !lastStroke.drawMode);
  }, [isDrawing]);

  React.useEffect(() => {
    liftStrokeUp();
  }, [isDrawing]);

  React.useEffect(() => {
    onChange(currentPaths);
  }, [currentPaths]);

  React.useImperativeHandle(ref, () => ({
    eraseMode: (erase: boolean): void => {
      setDrawMode(!erase);
    },
    clearCanvas: (): void => {
      setState(
        produce((draft: ReactSketchCanvasStates) => {
          draft.resetStack = draft.currentPaths;
          draft.currentPaths = [];
        })
      );
    },
    undo: (): void => {
      // If there was a last reset then
      if (resetStack.length !== 0) {
        setState(
          produce((draft: ReactSketchCanvasStates) => {
            draft.currentPaths = draft.resetStack;
            draft.resetStack = [];
          })
        );

        return;
      }

      setState(
        produce((draft: ReactSketchCanvasStates) => {
          const lastSketchPath = draft.currentPaths.pop();

          if (lastSketchPath) {
            draft.undoStack.push(lastSketchPath);
          }
        })
      );
    },
    redo: (): void => {
      // Nothing to Redo
      if (undoStack.length === 0) return;

      setState(
        produce((draft: ReactSketchCanvasStates) => {
          const lastUndoPath = draft.undoStack.pop();

          if (lastUndoPath) {
            draft.currentPaths.push(lastUndoPath);
          }
        })
      );
    },
    exportImage: (imageType: ExportImageType): Promise<string> => {
      const exportImage = svgCanvas.current?.exportImage;

      if (!exportImage) {
        throw Error('Export function called before canvas loaded');
      } else {
        return exportImage(imageType);
      }
    },
    exportSvg: (): Promise<string> => {
      return new Promise<string>((resolve, reject) => {
        const exportSvg = svgCanvas.current?.exportSvg;

        if (!exportSvg) {
          reject(Error('Export function called before canvas loaded'));
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
      setState(
        produce((draft: ReactSketchCanvasStates) => {
          draft.currentPaths = draft.currentPaths.concat(paths);
        })
      );
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
      setState({
        // eslint-disable-next-line react/no-unused-state
        resetStack: [],
        undoStack: [],
        currentPaths: [],
      });
    },
  }));

  const handlePointerDown = (point: Point): void => {
    setIsDrawing(true);
    setState(
      produce((draft: ReactSketchCanvasStates) => {
        draft.undoStack = [];

        let stroke: CanvasPath = {
          drawMode: drawMode,
          strokeColor: drawMode ? strokeColor : '#000000', // Eraser using mask
          strokeWidth: drawMode ? strokeWidth : eraserWidth,
          paths: [point],
        };

        if (withTimestamp) {
          stroke = {
            ...stroke,
            startTimestamp: Date.now(),
            endTimestamp: 0,
          };
        }

        draft.currentPaths.push(stroke);
      })
    );
  };

  const handlePointerMove = (point: Point): void => {
    if (!isDrawing) return;

    setState(
      produce((draft: ReactSketchCanvasStates) => {
        const currentStroke = draft.currentPaths[draft.currentPaths.length - 1];
        currentStroke.paths.push(point);
      })
    );
  };

  const handlePointerUp = (): void => {
    if (!isDrawing) {
      return;
    }

    setIsDrawing(false);

    setState(
      produce((draft: ReactSketchCanvasStates) => {
        if (!withTimestamp) {
          return;
        }

        let currentStroke: CanvasPath | undefined = draft.currentPaths.pop();

        if (currentStroke) {
          currentStroke = {
            ...currentStroke,
            endTimestamp: Date.now(),
          };

          draft.currentPaths.push(currentStroke);
        }
      })
    );
  };

  return (
    <Canvas
      ref={svgCanvas}
      width={width}
      height={height}
      className={className}
      canvasColor={canvasColor}
      backgroundImage={backgroundImage}
      exportWithBackgroundImage={exportWithBackgroundImage}
      preserveBackgroundImageAspectRatio={preserveBackgroundImageAspectRatio}
      allowOnlyPointerType={allowOnlyPointerType}
      style={style}
      paths={currentPaths}
      isDrawing={isDrawing}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  );
});
