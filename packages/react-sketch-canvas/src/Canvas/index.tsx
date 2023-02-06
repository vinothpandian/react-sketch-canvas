/* eslint-disable react/no-array-index-key */
import * as React from "react";
import { useCallback } from "react";
import Paths, { SvgPath } from "../Paths";
import { CanvasPath, ExportImageType, Point } from "../types";

const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => {
      if (img.width > 0) {
        resolve(img);
      }
      reject(new Error("Image not found"));
    });
    img.addEventListener("error", (err) => reject(err));
    img.src = url;
    img.setAttribute("crossorigin", "anonymous");
  });

function getCanvasWithViewBox(canvas: HTMLDivElement) {
  const svgCanvas = canvas.firstChild?.cloneNode(true) as SVGElement;

  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;

  svgCanvas.setAttribute("viewBox", `0 0 ${width} ${height}`);

  svgCanvas.setAttribute("width", width.toString());
  svgCanvas.setAttribute("height", height.toString());
  return { svgCanvas, width, height };
}

export interface CanvasProps {
  paths: CanvasPath[];
  isDrawing: boolean;
  onPointerDown: (point: Point, isEraser?: boolean) => void;
  onPointerMove: (point: Point) => void;
  onPointerUp: () => void;
  allowOnlyPointerType: string;
  backgroundImage: string;
  canvasColor: string;
  className?: string;
  exportWithBackgroundImage: boolean;
  height: string;
  id?: string;
  preserveBackgroundImageAspectRatio: string;
  style: React.CSSProperties;
  svgStyle: React.CSSProperties;
  withViewBox?: boolean;
  width: string;
}

export interface CanvasRef {
  exportImage: (imageType: ExportImageType) => Promise<string>;
  exportSvg: () => Promise<string>;
}

export const Canvas = React.forwardRef<CanvasRef, CanvasProps>((props, ref) => {
  const {
    paths,
    isDrawing,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    id = "react-sketch-canvas",
    width = "100%",
    height = "100%",
    className = "react-sketch-canvas",
    canvasColor = "red",
    backgroundImage = "",
    exportWithBackgroundImage = false,
    preserveBackgroundImageAspectRatio = "none",
    allowOnlyPointerType = "all",
    style = {
      border: "0.0625rem solid #9c9c9c",
      borderRadius: "0.25rem",
    },
    svgStyle = {},
    withViewBox = false,
  } = props;

  const canvasRef = React.useRef<HTMLDivElement>(null);
  const canvasSizeRef = React.useRef<{ width: number; height: number } | null>(
    null
  );

  // Converts mouse coordinates to relative coordinate based on the absolute position of svg
  const getCoordinates = useCallback(
    (pointerEvent: React.PointerEvent<HTMLDivElement>): Point => {
      const boundingArea = canvasRef.current?.getBoundingClientRect();
      canvasSizeRef.current = boundingArea
        ? {
            width: boundingArea.width,
            height: boundingArea.height,
          }
        : null;

      const scrollLeft = window.scrollX ?? 0;
      const scrollTop = window.scrollY ?? 0;

      if (!boundingArea) {
        return { x: 0, y: 0 };
      }

      return {
        x: pointerEvent.pageX - boundingArea.left - scrollLeft,
        y: pointerEvent.pageY - boundingArea.top - scrollTop,
      };
    },
    []
  );

  /* Mouse Handlers - Mouse down, move and up */

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>): void => {
      // Allow only chosen pointer type

      if (
        allowOnlyPointerType !== "all" &&
        event.pointerType !== allowOnlyPointerType
      ) {
        return;
      }

      if (event.pointerType === "mouse" && event.button !== 0) return;

      const isEraser =
        // eslint-disable-next-line no-bitwise
        event.pointerType === "pen" && (event.buttons & 32) === 32;
      const point = getCoordinates(event);

      onPointerDown(point, isEraser);
    },
    [allowOnlyPointerType, getCoordinates, onPointerDown]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>): void => {
      if (!isDrawing) return;

      // Allow only chosen pointer type
      if (
        allowOnlyPointerType !== "all" &&
        event.pointerType !== allowOnlyPointerType
      ) {
        return;
      }

      const point = getCoordinates(event);

      onPointerMove(point);
    },
    [allowOnlyPointerType, getCoordinates, isDrawing, onPointerMove]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement> | PointerEvent): void => {
      if (event.pointerType === "mouse" && event.button !== 0) return;

      // Allow only chosen pointer type
      if (
        allowOnlyPointerType !== "all" &&
        event.pointerType !== allowOnlyPointerType
      ) {
        return;
      }

      onPointerUp();
    },
    [allowOnlyPointerType, onPointerUp]
  );

  /* Mouse Handlers ends */

  React.useImperativeHandle(ref, () => ({
    exportImage: (imageType: ExportImageType): Promise<string> => {
      return new Promise<string>((resolve, reject) => {
        try {
          const canvas = canvasRef.current;

          if (!canvas) {
            throw Error("Canvas not rendered yet");
          }

          const {
            svgCanvas,
            width: svgWidth,
            height: svgHeight,
          } = getCanvasWithViewBox(canvas);
          const canvasSketch = `data:image/svg+xml;base64,${btoa(
            svgCanvas.outerHTML
          )}`;

          const loadImagePromises = [loadImage(canvasSketch)];

          if (exportWithBackgroundImage && backgroundImage) {
            try {
              const img = loadImage(backgroundImage);
              loadImagePromises.push(img);
            } catch (error) {
              // eslint-disable-next-line no-console
              console.warn(
                "exportWithBackgroundImage props is set without a valid background image URL. This option is ignored"
              );
            }
          }

          Promise.all(loadImagePromises)
            .then((images) => {
              const renderCanvas = document.createElement("canvas");
              renderCanvas.setAttribute("width", svgWidth.toString());
              renderCanvas.setAttribute("height", svgHeight.toString());
              const context = renderCanvas.getContext("2d");

              if (!context) {
                throw Error("Canvas not rendered yet");
              }

              if (imageType === "jpeg" && !exportWithBackgroundImage) {
                context.fillStyle = canvasColor;
                context.fillRect(0, 0, svgWidth, svgHeight);
              }

              images.reverse().forEach((image) => {
                context.drawImage(image, 0, 0);
              });

              resolve(renderCanvas.toDataURL(`image/${imageType}`));
            })
            .catch((e) => {
              reject(e);
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
              ?.setAttribute("fill", canvasColor);

            resolve(svgCanvas.outerHTML);
          }

          reject(new Error("Canvas not loaded"));
        } catch (e) {
          reject(e);
        }
      });
    },
  }));

  /* Add event listener to Mouse up and Touch up to
release drawing even when point goes out of canvas */
  React.useEffect(() => {
    document.addEventListener("pointerup", handlePointerUp);
    return () => {
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerUp]);

  const eraserPaths = React.useMemo(
    () => paths.filter((path) => !path.drawMode),
    [paths]
  );

  const pathGroups = React.useMemo(() => {
    let currentGroup = 0;

    return paths.reduce<CanvasPath[][]>(
      (arrayGroup, path) => {
        if (!path.drawMode) {
          currentGroup += 1;
          return arrayGroup;
        }

        if (arrayGroup[currentGroup] === undefined) {
          // eslint-disable-next-line no-param-reassign
          arrayGroup[currentGroup] = [];
        }

        arrayGroup[currentGroup].push(path);
        return arrayGroup;
      },
      [[]]
    );
  }, [paths]);

  return (
    <div
      role="presentation"
      ref={canvasRef}
      className={className}
      style={{
        touchAction: "none",
        width,
        height,
        ...style,
      }}
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
          width: "100%",
          height: "100%",
          ...svgStyle,
        }}
        id={id}
        viewBox={
          // eslint-disable-next-line no-nested-ternary
          withViewBox
            ? canvasSizeRef.current === null
              ? undefined
              : `0 0 ${canvasSizeRef.current.width} ${canvasSizeRef.current.height}`
            : undefined
        }
      >
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
        <defs>
          {backgroundImage && (
            <pattern
              id={`${id}__background`}
              x="0"
              y="0"
              width="100%"
              height="100%"
              patternUnits="userSpaceOnUse"
            >
              <image
                x="0"
                y="0"
                width="100%"
                height="100%"
                xlinkHref={backgroundImage}
                preserveAspectRatio={preserveBackgroundImageAspectRatio}
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
                (_i, j) => j + i
              ).map((k) => (
                <use
                  key={k.toString()}
                  href={`#${id}__eraser-${k.toString()}`}
                />
              ))}
            </mask>
          ))}
        </defs>
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
            mask={`${eraserPaths[i] && `url(#${id}__eraser-mask-${i})`}`}
          >
            <Paths id={`${id}__stroke-group-${i}__paths`} paths={pathGroup} />
          </g>
        ))}
      </svg>
    </div>
  );
});
