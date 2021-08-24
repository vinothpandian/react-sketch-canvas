import React from 'react';
import Paths from '../Paths';
import { CanvasPath, ExportImageType, Point } from '../types';

/* Default settings */

const defaultProps = {
  width: '100%',
  height: '100%',
  className: '',
  canvasColor: 'red',
  backgroundImage: '',
  preserveBackgroundImageAspectRatio: 'none',
  allowOnlyPointerType: 'all',
  style: {
    border: '0.0625rem solid #9c9c9c',
    borderRadius: '0.25rem',
  },
  withTimeStamp: true,
};

function getCanvasWithViewBox(canvas: HTMLDivElement) {
  const svgCanvas = canvas.firstChild?.cloneNode(true) as SVGElement;

  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;

  svgCanvas.setAttribute('viewBox', `0 0 ${width} ${height}`);

  svgCanvas.setAttribute('width', width.toString());
  svgCanvas.setAttribute('height', height.toString());
  return { svgCanvas, width, height };
}

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
  backgroundImage: string;
  preserveBackgroundImageAspectRatio: string;
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
  componentDidMount(): void {
    document.addEventListener('pointerup', this.handlePointerUp);
  }

  componentWillUnmount(): void {
    document.removeEventListener('pointerup', this.handlePointerUp);
  }

  // Converts mouse coordinates to relative coordinate based on the absolute position of svg
  getCoordinates(pointerEvent: React.PointerEvent<HTMLDivElement>): Point {
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

  handlePointerDown(event: React.PointerEvent<HTMLDivElement>): void {
    // Allow only chosen pointer type

    const { allowOnlyPointerType, onPointerDown } = this.props;
    if (
      allowOnlyPointerType !== 'all' &&
      event.pointerType !== allowOnlyPointerType
    ) {
      return;
    }

    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const point = this.getCoordinates(event);

    onPointerDown(point);
  }

  handlePointerMove(event: React.PointerEvent<HTMLDivElement>): void {
    const { isDrawing, allowOnlyPointerType, onPointerMove } = this.props;

    if (!isDrawing) return;

    // Allow only chosen pointer type
    if (
      allowOnlyPointerType !== 'all' &&
      event.pointerType !== allowOnlyPointerType
    ) {
      return;
    }

    const point = this.getCoordinates(event);

    onPointerMove(point);
  }

  handlePointerUp(
    event: React.PointerEvent<HTMLDivElement> | PointerEvent
  ): void {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    // Allow only chosen pointer type
    const { allowOnlyPointerType, onPointerUp } = this.props;
    if (
      allowOnlyPointerType !== 'all' &&
      event.pointerType !== allowOnlyPointerType
    ) {
      return;
    }

    onPointerUp();
  }

  /* Mouse Handlers ends */

  // Creates a image from SVG and renders it on canvas, then exports the canvas as image
  exportImage(imageType: ExportImageType): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        const canvas = this.canvas.current;

        if (!canvas) {
          throw Error('Canvas not rendered yet');
        }

        const img = document.createElement('img');
        const { svgCanvas, width, height } = getCanvasWithViewBox(canvas);

        img.src = `data:image/svg+xml;base64,${btoa(svgCanvas.outerHTML)}`;

        img.onload = () => {
          const renderCanvas = document.createElement('canvas');
          renderCanvas.setAttribute('width', width.toString());
          renderCanvas.setAttribute('height', height.toString());
          const context = renderCanvas.getContext('2d');

          if (!context) {
            throw Error('Canvas not rendered yet');
          }

          context.drawImage(img, 0, 0);

          resolve(renderCanvas.toDataURL(`image/${imageType}`));
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  exportSvg(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        const canvas = this.canvas?.current ?? null;

        if (canvas !== null) {
          const { svgCanvas } = getCanvasWithViewBox(canvas);
          resolve(svgCanvas.outerHTML);
        }

        reject(new Error('Canvas not loaded'));
      } catch (e) {
        reject(e);
      }
    });
  }

  /* Finally!!! Render method */

  render(): JSX.Element {
    const {
      width,
      height,
      className,
      canvasColor,
      backgroundImage,
      style,
      paths,
      preserveBackgroundImageAspectRatio,
    } = this.props;

    return (
      <div
        role="presentation"
        ref={this.canvas}
        className={className}
        style={{
          touchAction: 'none',
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
          xmlnsXlink="http://www.w3.org/1999/xlink"
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          {backgroundImage && (
            <pattern
              id="background"
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
              ></image>
            </pattern>
          )}
          <g id="canvas-background">
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill={backgroundImage ? 'url(#background)' : canvasColor}
            />
          </g>
          <g id="canvasPenStrokes">
            <Paths paths={paths} />
          </g>
        </svg>
      </div>
    );
  }
}
