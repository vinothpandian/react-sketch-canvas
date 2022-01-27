import * as React from 'react';
import { Canvas, CanvasRef } from '../Canvas';
import {
  CanvasMode,
  CanvasPath,
  CanvasText,
  ExportImageType,
  Point,
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
  preserveBackgroundImageAspectRatio?: string;
  strokeWidth?: number;
  eraserWidth?: number;
  textSize?: string;
  allowOnlyPointerType?: string;
  onChange?: (updatedPaths: CanvasPath[], updatedTexts: CanvasText[]) => void;
  onStroke?: (path: CanvasPath, isEraser: boolean) => void;
  style?: React.CSSProperties;
  withTimestamp?: boolean;
}

export interface ReactSketchCanvasRef {
  setMode: (mode: CanvasMode) => void;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  exportImage: (imageType: ExportImageType) => Promise<string>;
  exportSvg: () => Promise<string>;
  exportPaths: () => Promise<CanvasPath[]>;
  loadPaths: (paths: CanvasPath[]) => void;
  getSketchingTime: () => Promise<number>;
  adjustProportion: (
    imagescale: number,
    paths: CanvasPath[],
    texts: CanvasText[]
  ) => void;
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
    preserveBackgroundImageAspectRatio = 'none',
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

  const svgCanvas = React.createRef<CanvasRef>();
  const [drawMode, setDrawMode] = React.useState<CanvasMode>(CanvasMode.pen);
  const [isDrawing, setIsDrawing] = React.useState<boolean>(false);
  const [resetStack, setResetStack] = React.useState<CanvasPath[]>([]);
  const [undoStack, setUndoStack] = React.useState<CanvasPath[]>([]);
  const [currentPaths, setCurrentPaths] = React.useState<CanvasPath[]>([]);
  const [currentTexts, setCurrentTexts] = React.useState<CanvasText[]>([]);
  const [imageScale, setImageScale] = React.useState(1);

  const scalePaths = (paths: CanvasPath[], scale: number): CanvasPath[] => {
    return paths.map((path) => ({
      ...path,
      paths: path.paths.map((pt: Point) => ({
        x: pt.x * scale,
        y: pt.y * scale,
      })),
    }));
  };

  const scaleTexts = (texts: CanvasText[], scale: number): CanvasText[] => {
    return texts.map((item: CanvasText) => ({
      ...item,
      position: { x: item.position.x * scale, y: item.position.y * scale },
    }));
  };

  const isDrawingMode = (): boolean => {
    return drawMode === CanvasMode.pen || drawMode === CanvasMode.eraser;
  };

  const liftUpdatedStateUp = React.useCallback((): void => {
    const lastStroke = currentPaths.slice(-1)?.[0] ?? null;

    if (lastStroke === null) {
      console.warn('No stroke found!');
      return;
    }

    onStroke(lastStroke, !lastStroke.drawMode);
    // we want to run it whenever `isDrawing` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawing, currentPaths, onStroke]);

  React.useEffect(() => {
    liftUpdatedStateUp();
  }, [isDrawing, liftUpdatedStateUp]);

  React.useEffect(() => {
    onChange(currentPaths, currentTexts);
  }, [currentPaths, currentTexts, onChange]);

  const resetCanvas = () => {
    setResetStack([]);
    setUndoStack([]);
    setCurrentPaths([]);
    setCurrentTexts([]);
  };

  React.useImperativeHandle(ref, () => ({
    setMode: (mode: CanvasMode): void => {
      setDrawMode(mode);
    },
    adjustProportion: (
      imageScale: number,
      paths: CanvasPath[],
      texts: CanvasText[]
    ): void => {
      resetCanvas();
      setImageScale(imageScale);
      setCurrentPaths(scalePaths(paths, imageScale));
      setCurrentTexts(scaleTexts(texts, imageScale));
      setDrawMode(CanvasMode.pen);
    },
    clearCanvas: (): void => {
      setResetStack([...currentPaths]);
      setCurrentPaths([]);
      setCurrentTexts([]);
    },
    undo: (): void => {
      // If there was a last reset then
      if (resetStack.length !== 0) {
        setCurrentPaths([...resetStack]);
        setResetStack([]);

        return;
      }

      setUndoStack((undoStack) => [...undoStack, ...currentPaths.slice(-1)]);
      setCurrentPaths((currentPaths) => currentPaths.slice(0, -1));
    },
    redo: (): void => {
      // Nothing to Redo
      if (undoStack.length === 0) return;

      setCurrentPaths((currentPaths) => [
        ...currentPaths,
        ...undoStack.slice(-1),
      ]);
      setUndoStack((undoStack) => undoStack.slice(0, -1));
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
          resolve(scalePaths(currentPaths, 1.0 / imageScale));
        } catch (e) {
          reject(e);
        }
      });
    },
    exportTexts: (): Promise<CanvasText[]> => {
      return new Promise<CanvasText[]>((resolve, reject) => {
        try {
          resolve(scaleTexts(currentTexts, 1.0 / imageScale));
        } catch (e) {
          reject(e);
        }
      });
    },
    loadPaths: (paths: CanvasPath[]): void => {
      setCurrentPaths((currentPaths) => [
        ...currentPaths,
        ...scalePaths(paths, imageScale),
      ]);
    },
    loadTexts: (texts: CanvasText[]): void => {
      setCurrentTexts((currentTexts) => [
        ...currentTexts,
        ...scaleTexts(texts, imageScale),
      ]);
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

    if (!isDrawingMode()) {
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
      return;
    }

    setIsDrawing(true);
    setUndoStack([]);

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
      paths={currentPaths}
      texts={currentTexts}
      isDrawing={isDrawingMode()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onTextChange={handleTextChange}
    />
  );
});
