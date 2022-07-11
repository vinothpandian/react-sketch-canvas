import * as React from 'react';
import { useCallback } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import Paths, { SvgPath } from '../Paths';
import { SVGTexts } from '../Texts';
import {
  CanvasMode,
  CanvasPath,
  CanvasText,
  ExportImageType,
  Point,
  Size,
} from '../types';

const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => {
      if (img.width > 0) {
        resolve(img);
      }
      reject('Image not found');
    });
    img.addEventListener('error', (err) => reject(err));
    img.src = url;
    img.setAttribute('crossorigin', 'anonymous');
  });

function getCanvasWithViewBox(canvas: HTMLDivElement) {
  const svgCanvas = canvas.firstChild?.cloneNode(true) as SVGElement;

  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;

  svgCanvas.setAttribute('viewBox', `0 0 ${width} ${height}`);

  svgCanvas.setAttribute('width', width.toString());
  svgCanvas.setAttribute('height', height.toString());
  return { svgCanvas, width, height };
}

export interface CanvasProps {
  paths: CanvasPath[];
  texts: CanvasText[];
  isDrawing: boolean;
  onPointerDown: (point: Point) => void;
  onPointerMove: (point: Point) => void;
  onPointerUp: () => void;
  onResize?: (size: Size) => void;
  onTextChange: (oldText: CanvasText, newText: CanvasText) => void;
  className?: string;
  id?: string;
  width: string | number;
  height: string | number;
  canvasColor: string;
  backgroundImage: string;
  exportWithBackgroundImage: boolean;
  allowOnlyPointerType: string;
  style: React.CSSProperties;
}

export interface CanvasRef {
  getPathAtCurrentPoint: () => CanvasPath | undefined;
  exportImage: (imageType: ExportImageType) => Promise<string>;
  exportSvg: () => Promise<string>;
  readonly size?: Size;
  readonly backgroundImageSize?: Size;
}

export const Canvas = React.forwardRef<CanvasRef, CanvasProps>((props, ref) => {
  const {
    paths,
    texts,
    isDrawing,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onTextChange,
    onResize,
    id = 'react-sketch-canvas',
    width = '100%',
    height = '100%',
    className = 'react-sketch-canvas',
    canvasColor = 'red',
    backgroundImage = '',
    exportWithBackgroundImage = false,
    allowOnlyPointerType = 'all',
    style = {
      border: '0.0625rem solid #9c9c9c',
      borderRadius: '0.25rem',
    },
  } = props;

  const canvasRef = React.useRef<HTMLDivElement>(null);
  const lastMouseEvent = React.useRef<React.PointerEvent<HTMLDivElement>>();
  const backgroundImageSizeRef = React.useRef<Size>();

  React.useEffect(() => {
    if (backgroundImage) {
      loadImage(backgroundImage).then((img) => {
        backgroundImageSizeRef.current = {
          width: img.width,
          height: img.height,
        };
        return img;
      });
    }
  }, [backgroundImage]);

  // Converts mouse coordinates to relative coordinate based on the absolute position of svg
  const getCoordinates = (
    pointerEvent: React.PointerEvent<HTMLDivElement>
  ): Point => {
    const boundingArea = canvasRef.current?.getBoundingClientRect();

    const scrollLeft = window.scrollX ?? 0;
    const scrollTop = window.scrollY ?? 0;

    if (!boundingArea) {
      return { x: 0, y: 0 };
    }

    const point: Point = {
      x: pointerEvent.pageX - boundingArea.left - scrollLeft,
      y: pointerEvent.pageY - boundingArea.top - scrollTop,
    };

    return point;
  };

  /* Mouse Handlers - Mouse down, move and up */

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>
  ): void => {
    // checks and return if click on some already added text element
    lastMouseEvent.current = event;

    if (!isDrawing) {
      const targetElem: string = (event.target as HTMLElement).nodeName;
      if (targetElem === 'text' || targetElem === 'INPUT') {
        return;
      }
    }

    // Allow only chosen pointer type

    if (
      allowOnlyPointerType !== 'all' &&
      event.pointerType !== allowOnlyPointerType
    ) {
      return;
    }

    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const point = getCoordinates(event);

    onPointerDown(point);
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>
  ): void => {
    lastMouseEvent.current = event;

    if (!isDrawing) return;

    // Allow only chosen pointer type
    if (
      allowOnlyPointerType !== 'all' &&
      event.pointerType !== allowOnlyPointerType
    ) {
      return;
    }

    const point = getCoordinates(event);

    onPointerMove(point);
  };

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement> | PointerEvent): void => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      lastMouseEvent.current = event as React.PointerEvent<HTMLDivElement>;

      // Allow only chosen pointer type
      if (
        allowOnlyPointerType !== 'all' &&
        event.pointerType !== allowOnlyPointerType
      ) {
        return;
      }

      onPointerUp();
    },
    [allowOnlyPointerType, onPointerUp]
  );

  const resizeDetectorOnResize = useCallback(
    (width?: number, height?: number) => {
      if (onResize && width && height) {
        onResize({ width, height });
      }
    },
    [onResize]
  );

  useResizeDetector({
    targetRef: canvasRef,
    onResize: resizeDetectorOnResize,
  });

  /* Mouse Handlers ends */

  React.useImperativeHandle(ref, () => ({
    get size(): Size | undefined {
      if (canvasRef.current) {
        return {
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight,
        };
      }
      return;
    },
    get backgroundImageSize(): Size | undefined {
      return backgroundImageSizeRef.current;
    },
    getPathAtCurrentPoint: (): CanvasPath | undefined => {
      if (lastMouseEvent.current) {
        const event = lastMouseEvent.current!;
        const elem = document.elementFromPoint(event.pageX, event.pageY);
        if (elem?.tagName === 'path') {
          return paths.filter((p) => p.id === parseInt(elem.id, 10))[0];
        }
      }
      return;
    },
    exportImage: (imageType: ExportImageType): Promise<string> => {
      return new Promise<string>(async (resolve, reject) => {
        try {
          const canvas = canvasRef.current;

          if (!canvas) {
            throw Error('Canvas not rendered yet');
          }

          const { svgCanvas, width, height } = getCanvasWithViewBox(canvas);
          const canvasSketch = `data:image/svg+xml;base64,${btoa(
            svgCanvas.outerHTML
          )}`;

          const loadImagePromises = [await loadImage(canvasSketch)];

          if (exportWithBackgroundImage) {
            try {
              const img = await loadImage(backgroundImage);
              loadImagePromises.push(img);
            } catch (error) {
              console.warn(
                'exportWithBackgroundImage props is set without a valid background image URL. This option is ignored'
              );
            }
          }

          Promise.all(loadImagePromises)
            .then((images) => {
              const renderCanvas = document.createElement('canvas');
              renderCanvas.setAttribute('width', width.toString());
              renderCanvas.setAttribute('height', height.toString());
              const context = renderCanvas.getContext('2d');

              if (!context) {
                throw Error('Canvas not rendered yet');
              }

              images.reverse().forEach((image) => {
                context.drawImage(image, 0, 0);
              });

              resolve(renderCanvas.toDataURL(`image/${imageType}`));
            })
            .catch((e) => {
              throw e;
            });
        } catch (e) {
          reject(e);
        }
      });
    },
    exportSvg: (): Promise<string> => {
      return new Promise<string>((resolve, reject) => {
        try {
          const canvas = canvasRef.current ?? null;

          if (canvas !== null) {
            const { svgCanvas } = getCanvasWithViewBox(canvas);

            if (exportWithBackgroundImage) {
              resolve(svgCanvas.outerHTML);
              return;
            }

            svgCanvas.querySelector(`#${id}__background`)?.remove();
            svgCanvas
              .querySelector(`#${id}__canvas-background`)
              ?.setAttribute('fill', canvasColor);

            resolve(svgCanvas.outerHTML);
          }

          reject(new Error('Canvas not loaded'));
        } catch (e) {
          reject(e);
        }
      });
    },
  }));

  /* Add event listener to Mouse up and Touch up to
release drawing even when point goes out of canvas */
  React.useEffect(() => {
    document.addEventListener('pointerup', handlePointerUp);
    return () => {
      document.removeEventListener('pointerup', handlePointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const eraserPaths = paths.filter(
    (path) => path.drawMode === CanvasMode.eraser
  );

  let currentGroup = 0;
  const pathGroups = paths.reduce<CanvasPath[][]>(
    (arrayGroup, path) => {
      if (!path.drawMode) {
        currentGroup += 1;
        return arrayGroup;
      }

      if (arrayGroup[currentGroup] === undefined) {
        arrayGroup[currentGroup] = [];
      }

      arrayGroup[currentGroup].push(path);
      return arrayGroup;
    },
    [[]]
  );

  return (
    <div
      role="presentation"
      aria-label="react-sketch-canvas"
      ref={canvasRef}
      className={className}
      style={{
        touchAction: 'none',
        width,
        height,
        ...style,
      }}
      touch-action="none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <svg
        version="1.1"
        baseProfile="full"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        style={{
          width: '100%',
          height: '100%',
        }}
        id={id}
      >
        <defs>
          {backgroundImage && (
            <pattern
              id={`${id}__background`}
              width="100%"
              height="100%"
              patternContentUnits="objectBoundingBox"
              viewBox="0 0 1 1"
              preserveAspectRatio="xMidYMid meet"
            >
              <image
                xlinkHref={backgroundImage}
                height="1"
                width="1"
                preserveAspectRatio="xMidYMid meet"
              />
            </pattern>
          )}

          {eraserPaths.map((_, i) => (
            <mask
              id={`${id}__eraser-mask-${i}`}
              key={`${id}__eraser-mask-${i}`}
              maskUnits="userSpaceOnUse"
            >
              <use href={`#${id}__mask-background`} />
              {Array.from(
                { length: eraserPaths.length - i },
                (_, j) => j + i
              ).map((k) => (
                <use
                  key={k.toString()}
                  href={`#${id}__eraser-${k.toString()}`}
                />
              ))}
            </mask>
          ))}
        </defs>
        <g id={`${id}__eraser-stroke-group`} display="none">
          <rect
            id={`${id}__mask-background`}
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="white"
          />
          {eraserPaths.map((eraserPath, i) => (
            <SvgPath
              key={`${id}__eraser-${i}`}
              id={`${id}__eraser-${i}`}
              paths={eraserPath.paths}
              strokeColor="#000000"
              strokeWidth={eraserPath.strokeWidth}
            />
          ))}
        </g>
        <g id={`${id}__canvas-background-group`}>
          <rect
            id={`${id}__canvas-background`}
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill={backgroundImage ? `url(#${id}__background)` : canvasColor}
          />
        </g>
        {pathGroups.map((pathGroup, i) => (
          <g
            id={`${id}__stroke-group-${i}`}
            key={`${id}__stroke-group-${i}`}
            mask={`url(#${id}__eraser-mask-${i})`}
          >
            <Paths paths={pathGroup} />
          </g>
        ))}
        <g id={`${id}__canvas-texts`}>
          <SVGTexts
            texts={texts}
            isDrawing={isDrawing}
            onChange={onTextChange}
          />
        </g>
      </svg>
    </div>
  );
});
