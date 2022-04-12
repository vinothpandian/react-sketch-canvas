import * as React from 'react';
import { Canvas, CanvasRef } from '../Canvas';
import {
  CanvasMode,
  CanvasPath,
  CanvasText,
  ExportImageType,
  Point,
  Size,
} from '../types';

export type ReactSketchCanvasStates = {};

/* Props validation */
export interface ReactSketchCanvasProps {
  id?: string;
  width?: string;
  height?: string;
  className?: string;
  strokeColor?: string;
  canvasColor?: string;
  backgroundImage?: string;
  exportWithBackgroundImage?: boolean;
  strokeWidth?: number;
  eraserWidth?: number;
  textSize?: string;
  allowOnlyPointerType?: string;
  keepScale?: boolean;
  onChange?: (updatedPaths: CanvasPath[], updatedTexts: CanvasText[]) => void;
  onStroke?: (path: CanvasPath, isEraser: boolean) => void;
  style?: React.CSSProperties;
  withTimestamp?: boolean;
}

export interface ReactSketchCanvasRef {
  keepScale: boolean;
  mode: CanvasMode;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  exportImage: (imageType: ExportImageType) => Promise<string>;
  exportSvg: () => Promise<string>;
  exportPaths: () => CanvasPath[];
  exportTexts: () => CanvasText[];
  exportPathsPromise: () => Promise<CanvasPath[]>;
  exportTextsPromise: () => Promise<CanvasText[]>;
  loadPaths: (paths: CanvasPath[]) => void;
  loadTexts: (paths: CanvasText[]) => void;
  getSketchingTime: () => Promise<number>;
  resetCanvas: () => void;
}

export const ReactSketchCanvas = React.forwardRef<
  ReactSketchCanvasRef,
  ReactSketchCanvasProps
>((props, ref) => {
  const {
    id = 'react-sketch-canvas',
    width = '100%',
    height = '100%',
    className = '',
    canvasColor = 'white',
    strokeColor = 'red',
    backgroundImage = '',
    exportWithBackgroundImage = false,
    strokeWidth = 4,
    eraserWidth = 8,
    // textSize = '1em',
    allowOnlyPointerType = 'all',
    style = {
      border: '0.0625rem solid #9c9c9c',
      borderRadius: '0.25rem',
    },
    onChange = (_paths: CanvasPath[], _texts: CanvasText[]): void => {},
    onStroke = (_path: CanvasPath, _isEraser: boolean): void => {},
    withTimestamp = false,
  } = props;

  const svgCanvas = React.createRef<CanvasRef & SVGElement>();
  const [drawMode, setDrawMode] = React.useState<CanvasMode>(CanvasMode.pen);
  const [isDrawing, setIsDrawing] = React.useState<boolean>(false);
  const [resetStack, setResetStack] = React.useState<CanvasPath[]>([]);
  const [undoStack, setUndoStack] = React.useState<CanvasPath[]>([]);
  const [currentPaths, setCurrentPaths] = React.useState<CanvasPath[]>([]);
  const [currentTexts, setCurrentTexts] = React.useState<CanvasText[]>([]);

  const keepScaleRef = React.useRef(false);

  const isDrawingMode = (): boolean => {
    return drawMode === CanvasMode.pen || drawMode === CanvasMode.eraser;
  };

  const liftUpdatedStateUp = React.useCallback((): void => {
    const lastStroke = currentPaths.slice(-1)?.[0] ?? null;

    if (lastStroke === null) {
      return;
    }

    onStroke(lastStroke, lastStroke.drawMode === CanvasMode.eraser);
    // we want to run it whenever `isDrawing` changes
  }, [currentPaths, onStroke]);

  React.useEffect(() => {
    liftUpdatedStateUp();
  }, [isDrawing]);

  const resetCanvas = () => {
    setResetStack([]);
    setUndoStack([]);
    setCurrentPaths([]);
    setCurrentTexts([]);
    onChange(currentPaths, currentTexts);
  };

  const currentSizeRef = React.useRef<Size | undefined>();

  const handleResize = (size: Size) => {
    if (!keepScaleRef.current || !currentPaths.length) {
      currentSizeRef.current = size;
      return;
    }
    const currentSize = currentSizeRef.current;
    if (currentSize) {
      if (
        size.width === currentSize.width &&
        size.height === currentSize.height
      ) {
        return;
      }
      let [scaleX, scaleY] = [
        size.width / currentSize.width,
        size.height / currentSize.height,
      ];
      currentSizeRef.current = size;
      console.log('Current size: ', currentSizeRef.current);

      setCurrentPaths((paths) =>
        paths.map((path) => ({
          ...path,
          paths: path.paths.map((pt: Point) => ({
            x: pt.x * scaleX,
            y: pt.y * scaleY,
          })),
        }))
      );

      setCurrentTexts((texts) =>
        texts.map((item: CanvasText) => ({
          ...item,
          position: {
            x: item.position.x * scaleX,
            y: item.position.y * scaleY,
          },
        }))
      );
    }
  };

  React.useImperativeHandle(ref, () => ({
    get mode(): CanvasMode {
      return drawMode;
    },
    set mode(val: CanvasMode) {
      setDrawMode(val);
    },
    get keepScale(): boolean {
      return keepScaleRef.current;
    },
    set keepScale(val) {
      keepScaleRef.current = val;
    },
    clearCanvas: (): void => {
      setResetStack([...currentPaths]);
      setCurrentPaths([]);
      setCurrentTexts([]);
      onChange(currentPaths, currentTexts);
    },
    undo: (): void => {
      // If there was a last reset then
      if (resetStack.length !== 0) {
        setCurrentPaths([...resetStack]);
        setResetStack([]);
        onChange(currentPaths, currentTexts);
        return;
      }

      setUndoStack((undoStack) => [...undoStack, ...currentPaths.slice(-1)]);
      setCurrentPaths((currentPaths) => currentPaths.slice(0, -1));
      onChange(currentPaths, currentTexts);
    },
    redo: (): void => {
      // Nothing to Redo
      if (undoStack.length === 0) return;

      setCurrentPaths((currentPaths) => [
        ...currentPaths,
        ...undoStack.slice(-1),
      ]);
      setUndoStack((undoStack) => undoStack.slice(0, -1));
      onChange(currentPaths, currentTexts);
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
    exportPaths: (): CanvasPath[] => currentPaths,
    exportTexts: (): CanvasText[] => currentTexts,
    exportPathsPromise: (): Promise<CanvasPath[]> => {
      return new Promise<CanvasPath[]>((resolve, reject) => {
        try {
          resolve(currentPaths);
        } catch (e) {
          reject(e);
        }
      });
    },
    exportTextsPromise: (): Promise<CanvasText[]> => {
      return new Promise<CanvasText[]>((resolve, reject) => {
        try {
          resolve(currentTexts);
        } catch (e) {
          reject(e);
        }
      });
    },
    loadPaths: (paths: CanvasPath[]): void => {
      setCurrentPaths((currentPaths) => [...currentPaths, ...paths]);
      onChange(currentPaths, currentTexts);
    },
    loadTexts: (texts: CanvasText[]): void => {
      setCurrentTexts((currentTexts) => [...currentTexts, ...texts]);
      onChange(currentPaths, currentTexts);
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
      resetCanvas();
    },
  }));

  const handlePointerDown = (point: Point): void => {
    if (drawMode === CanvasMode.none) {
      return;
    }

    if (drawMode === CanvasMode.text) {
      // handle text label insertion
      setIsDrawing(false);
      setUndoStack([]);
      setCurrentTexts((texts) => {
        const textLabel: CanvasText = {
          id: Math.round(new Date().getTime()),
          text: 'Text',
          position: point,
        };
        return [...texts, textLabel];
      });
      onChange(currentPaths, currentTexts);
      return;
    }

    if (drawMode === CanvasMode.remove) {
      const path = svgCanvas.current?.getPathAtCurrentPoint();
      if (path) {
        setCurrentPaths((paths) => paths.filter((p) => p.id !== path?.id));
        setUndoStack((paths) => {
          return {
            ...paths,
            path,
          };
        });
      }
      return;
    }

    setIsDrawing(true);
    setUndoStack([]);

    let stroke: CanvasPath = {
      id: Math.round(new Date().getTime()),
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

    setCurrentPaths((currentPaths) => [...currentPaths, stroke]);
  };

  const handlePointerMove = (point: Point): void => {
    if (!isDrawing) return;

    const currentStroke = currentPaths.slice(-1)[0];
    const updatedStroke = {
      ...currentStroke,
      paths: [...currentStroke.paths, point],
    };
    setCurrentPaths((currentPaths) => [
      ...currentPaths.slice(0, -1),
      updatedStroke,
    ]);
  };

  const handlePointerUp = (): void => {
    if (!isDrawing) {
      return;
    }

    setIsDrawing(false);

    if (!withTimestamp) {
      return;
    }

    let currentStroke = currentPaths.slice(-1)?.[0] ?? null;

    if (currentStroke === null) {
      return;
    }

    const updatedStroke = {
      ...currentStroke,
      endTimestamp: Date.now(),
    };

    setCurrentPaths((currentPaths) => [
      ...currentPaths.slice(0, -1),
      updatedStroke,
    ]);
    onChange(currentPaths, currentTexts);
  };

  const handleTextChange = (oldText: CanvasText, newText: CanvasText): void => {
    setCurrentTexts((texts) => {
      for (const idx in texts) {
        if (currentTexts[idx].id === oldText.id) {
          currentTexts[idx] = newText;
          break;
        }
      }
      return texts;
    });
    onChange(currentPaths, currentTexts);
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
      allowOnlyPointerType={allowOnlyPointerType}
      style={style}
      paths={currentPaths}
      texts={currentTexts}
      isDrawing={isDrawingMode()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onTextChange={handleTextChange}
      onResize={handleResize}
    />
  );
});
