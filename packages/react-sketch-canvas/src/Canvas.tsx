import React from "react";
import { ExportImageType, Point, CanvasPath } from "./typings";
import Paths from "./Paths";
import "pepjs";

/* Default settings */

const defaultProps = {
  width: "100%",
  height: "100%",
  className: "",
  canvasColor: "red",
  background: "",
  allowOnlyPointerType: "all",
  style: {
    border: "0.0625rem solid #9c9c9c",
    borderRadius: "0.25rem",
  },
};

/* Props validation */

export type CanvasProps = {
  paths: CanvasPath[];
  isDrawing: boolean;
  className: string;
  onPointerDown: (point: Point) => void;
  onPointerMove: (point: Point) => void;
  onPointerUp: () => void;
  width: string;
  height: string;
  canvasColor: string;
  background: string;
  allowOnlyPointerType: string;
  style: React.CSSProperties;
};

export class Canvas extends React.Component<CanvasProps> {
  canvas: React.RefObject<HTMLDivElement>;

  static defaultProps = defaultProps;

  constructor(props: CanvasProps) {
    super(props);

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.getCoordinates = this.getCoordinates.bind(this);
    this.exportImage = this.exportImage.bind(this);
    this.exportSvg = this.exportSvg.bind(this);

    this.canvas = React.createRef<HTMLDivElement>();
  }

  /* Add event listener to Mouse up and Touch up to
  release drawing even when point goes out of canvas */
  componentDidMount() {
    document.addEventListener("pointerup", this.handlePointerUp);
  }

  componentWillUnmount() {
    document.removeEventListener("pointerup", this.handlePointerUp);
  }

  // Converts mouse coordinates to relative coordinate based on the absolute position of svg
  getCoordinates(pointerEvent: React.PointerEvent<HTMLDivElement>) {
    const boundingArea = this.canvas.current?.getBoundingClientRect();

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
  }

  /* Mouse Handlers - Mouse down, move and up */

  handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    // Allow only chosen pointer type

    const { allowOnlyPointerType, onPointerDown } = this.props;
    if (
      allowOnlyPointerType !== "all" &&
      event.pointerType !== allowOnlyPointerType
    ) {
      return;
    }

    if (event.pointerType === "mouse" && event.button !== 0) return;

    const point = this.getCoordinates(event);

    onPointerDown(point);
  }

  handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const { isDrawing, allowOnlyPointerType, onPointerMove } = this.props;

    if (!isDrawing) return;

    // Allow only chosen pointer type
    if (
      allowOnlyPointerType !== "all" &&
      event.pointerType !== allowOnlyPointerType
    ) {
      return;
    }

    const point = this.getCoordinates(event);

    onPointerMove(point);
  }

  handlePointerUp(event: React.PointerEvent<HTMLDivElement> | PointerEvent) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    // Allow only chosen pointer type
    const { allowOnlyPointerType, onPointerUp } = this.props;
    if (
      allowOnlyPointerType !== "all" &&
      event.pointerType !== allowOnlyPointerType
    ) {
      return;
    }

    onPointerUp();
  }

  /* Mouse Handlers ends */

  // Creates a image from SVG and renders it on canvas, then exports the canvas as image
  exportImage(imageType: ExportImageType) {
    return new Promise<string>((resolve, reject) => {
      try {
        const canvas = this.canvas.current;

        if (!canvas) {
          throw Error("Canvas not rendered yet");
        }

        const img = document.createElement("img");
        img.src = `data:image/svg+xml;base64,${btoa(canvas?.innerHTML)}`;

        img.onload = () => {
          const renderCanvas = document.createElement("canvas");
          renderCanvas.setAttribute("width", canvas.offsetWidth.toString());
          renderCanvas.setAttribute("height", canvas.offsetHeight.toString());
          const context = renderCanvas.getContext("2d");

          if (!context) {
            throw Error("Canvas not rendered yet");
          }

          context.drawImage(img, 0, 0);

          resolve(renderCanvas.toDataURL(`image/${imageType}`));
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  exportSvg() {
    return new Promise<string>((resolve, reject) => {
      try {
        resolve(this.canvas.current?.innerHTML);
      } catch (e) {
        reject(e);
      }
    });
  }

  /* Finally!!! Render method */

  render() {
    const {
      width,
      height,
      className,
      canvasColor,
      background,
      style,
      paths,
    } = this.props;

    return (
      <div
        role="presentation"
        ref={this.canvas}
        className={className}
        style={{
          touchAction: "none",
          width,
          height,
          ...style,
        }}
        touch-action="none"
        onPointerDown={this.handlePointerDown}
        onPointerMove={this.handlePointerMove}
        onPointerUp={this.handlePointerUp}
      >
        <svg
          version="1.1"
          baseProfile="full"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: "100%",
            height: "100%",
            background: `${background} ${canvasColor}`,
          }}
        >
          <g id="canvasPenStrokes">
            <Paths paths={paths} />
          </g>
        </svg>
      </div>
    );
  }
}
