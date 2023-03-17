import * as React from 'react';
import { Canvas, CanvasRef } from '../Canvas';
import {
  CanvasMode,
  CanvasPath,
  CanvasText,
  ExportImageType,
  getId,
  Point,
  Size,
} from '../types';
import UniqueId from '../types/uniqueId';

export interface ReactSketchCanvasProps {
  id?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  strokeColor?: string;
  canvasColor?: string;
  backgroundImage?: string;
  exportWithBackgroundImage?: boolean;
  preserveBackgroundImageAspectRatio: string;
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
  size?: Size;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  addText: (text: string, position: Point) => void;
  addPath: (points: Point[], width: number, color: string) => void;
  exportImage: (imageType: ExportImageType) => Promise<string>;
  exportSvg: () => Promise<string>;
  exportPaths: () => CanvasPath[];
  exportTexts: () => CanvasText[];
  exportPathsPromise: () => Promise<CanvasPath[]>;
  exportTextsPromise: () => Promise<CanvasText[]>;
  loadPaths: (paths: CanvasPath[], size?: Size) => void;
  loadTexts: (paths: CanvasText[], size?: Size) => void;
  getSketchingTime: () => Promise<number>;
  resetCanvas: () => void;
}

function scale<T>(
  from: Size,
  to: Size,
  callback: (change?: { x: number; y: number }) => T
) {
  if (to.width === from.width && to.height === from.height) {
    return callback();
  }

  return callback({
    x: to.width / from.width,
    y: to.height / from.height,
  });
}

function scalePaths(
  paths: CanvasPath[],
  currentSize: Size,
  newSize: Size
): CanvasPath[] {
  return scale(currentSize, newSize, (change): CanvasPath[] => {
    if (change) {
      return paths.map((path) => ({
        ...path,
        paths: path.paths.map((pt: Point) => ({
          x: pt.x * change.x,
          y: pt.y * change.y,
        })),
      }));
    }
    return paths;
  });
}

function scaleTexts(
  texts: CanvasText[],
  currentSize: Size,
  newSize: Size
): CanvasText[] {
  return scale(currentSize, newSize, (change): CanvasText[] => {
    if (change) {
      return texts.map((item: CanvasText) => ({
        ...item,
        position: {
          x: item.position.x * change.x,
          y: item.position.y * change.y,
        },
      }));
    }
    return texts;
  });
}

export const ReactSketchCanvas = React.forwardRef<
  ReactSketchCanvasRef,
  ReactSketchCanvasProps
>((props, ref) => {
  const uniqueIdRef = React.useRef(new UniqueId());

  const {
    id = uniqueIdRef.current.get('react-sketch-canvas'),
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
    keepScale = false,
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

  const keepScaleRef = React.useRef(keepScale);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawing]);

  const resetCanvas = () => {
    setResetStack([]);
    setUndoStack([]);
    setCurrentPaths([]);
    setCurrentTexts([]);
    onChange(currentPaths, currentTexts);
  };

  const currentSizeRef = React.useRef<Size | undefined>();

  const handleResize = (newSize: Size) => {
    const currentSize = currentSizeRef.current;
    if (!currentSize) {
      currentSizeRef.current = newSize;
      return;
    }

    if (!keepScaleRef.current) {
      return;
    }

    if (
      newSize.width === currentSize.width &&
      newSize.height === currentSize.height
    ) {
      return;
    }

    currentSizeRef.current = newSize;

    setCurrentPaths((paths) => scalePaths(paths, currentSize, newSize));
    setCurrentTexts((texts) => scaleTexts(texts, currentSize, newSize));
  };

  const loadPaths = (paths: CanvasPath[], size?: Size): void => {
    if (size) {
      let newSize = currentSizeRef.current ?? svgCanvas.current?.size;
      if (newSize) {
        paths = scalePaths(paths, size, newSize);
        currentSizeRef.current = newSize;
      } else {
        console.error('Cannot determine new size.');
        return;
      }
    }
    setCurrentPaths((currentPaths) => [
      ...currentPaths,
      ...paths.map((p) => ({
        ...p,
        id: p.id || getId(),
      })),
    ]);
  };

  const createText = (text: string, point: Point): CanvasText => {
    return {
      id: getId(),
      text: text,
      position: point,
    };
  };

  const loadTexts = (texts: CanvasText[], size?: Size): void => {
    if (size) {
      let newSize = currentSizeRef.current ?? svgCanvas.current?.size;
      if (newSize) {
        texts = scaleTexts(texts, size, newSize);
      } else {
        console.error('Cannot determine new size.');
        return;
      }
    }
    setCurrentTexts((currentTexts) => [...currentTexts, ...texts]);
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
    get size(): Size | undefined {
      return currentSizeRef.current;
    },
    set size(newSize) {
      if (newSize) {
        handleResize(newSize);
      }
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
    addText: (text, position) => {
      const texts: CanvasText[] = [createText(text, position)];
      loadTexts(texts, svgCanvas.current?.backgroundImageSize);
      onChange(currentPaths, currentTexts);
    },
    addPath: (points, width, color) => {
      let paths: CanvasPath[] = [
        {
          paths: points,
          drawMode: CanvasMode.pen,
          strokeColor: color,
          strokeWidth: width,
          id: getId(),
        },
      ];
      loadPaths(paths, svgCanvas.current?.backgroundImageSize);
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
    loadPaths: (paths: CanvasPath[], size?: Size): void => {
      loadPaths(paths, size);
      onChange(currentPaths, currentTexts);
    },
    loadTexts: (texts: CanvasText[], size?: Size): void => {
      loadTexts(texts, size);
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

  const onPathClicked = (id: string) => {
    if (drawMode != CanvasMode.remove) {
      return;
    }
    const path = currentPaths.filter((p) => String(p.id) == id)[0];
    if (!path) {
      return;
    }
    setUndoStack((undoStack) => [...undoStack, path]);
    setCurrentPaths((paths) => paths.filter((p) => p.id !== path.id));
    onChange(currentPaths, currentTexts);
  };

  const handlePointerDown = (point: Point): void => {
    if (drawMode === CanvasMode.none) {
      return;
    }

    if (drawMode === CanvasMode.remove) {
      return;
    }

    if (drawMode === CanvasMode.text) {
      // handle text label insertion
      setIsDrawing(false);
      setUndoStack([]);
      loadTexts([createText('Text', point)]);
      return;
    }

    setIsDrawing(true);
    setUndoStack([]);

    let stroke: CanvasPath = {
      id: getId(),
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
      onPathClicked={onPathClicked}
      onResize={handleResize}
    />
  );
});
