import React from "react";

import { produce } from "immer";
import { Canvas } from "./Canvas";
import { Point, CanvasPath, ExportImageType } from "./typings";

/* Default settings */

const defaultProps = {
  width: "100%",
  height: "100%",
  className: "",
  canvasColor: "white",
  strokeColor: "red",
  background: "",
  strokeWidth: 4,
  eraserWidth: 8,
  allowOnlyPointerType: "pen",
  style: {
    border: "0.0625rem solid #9c9c9c",
    borderRadius: "0.25rem",
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onUpdate: (_: CanvasPath[]): void => {},
};

/* Props validation */

export type ReactSketchCanvasProps = {
  width: string;
  height: string;
  className: string;
  strokeColor: string;
  canvasColor: string;
  background: string;
  strokeWidth: number;
  eraserWidth: number;
  allowOnlyPointerType: string;
  onUpdate: (updatedPaths: CanvasPath[]) => void;
  style: React.CSSProperties;
};

export type ReactSketchCanvasStates = {
  drawMode: boolean;
  isDrawing: boolean;
  resetStack: CanvasPath[];
  undoStack: CanvasPath[];
  currentPaths: CanvasPath[];
};

export class ReactSketchCanvas extends React.Component<
  ReactSketchCanvasProps,
  ReactSketchCanvasStates
> {
  static defaultProps = defaultProps;

  svgCanvas: React.RefObject<Canvas>;

  constructor(props: ReactSketchCanvasProps) {
    super(props);

    this.state = {
      // eslint-disable-next-line react/no-unused-state
      drawMode: true,
      isDrawing: false,
      // eslint-disable-next-line react/no-unused-state
      resetStack: [],
      undoStack: [],
      currentPaths: [],
    };

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);

    this.exportImage = this.exportImage.bind(this);
    this.exportSvg = this.exportSvg.bind(this);
    this.exportPaths = this.exportPaths.bind(this);
    this.loadPaths = this.loadPaths.bind(this);

    this.eraseMode = this.eraseMode.bind(this);
    this.clearCanvas = this.clearCanvas.bind(this);
    this.undo = this.undo.bind(this);
    this.redo = this.redo.bind(this);

    this.liftPathsUp = this.liftPathsUp.bind(this);

    this.svgCanvas = React.createRef();
  }

  liftPathsUp(): void {
    const { currentPaths } = this.state;
    const { onUpdate } = this.props;

    onUpdate(currentPaths);
  }

  /* Mouse Handlers - Mouse down, move and up */

  handlePointerDown(point: Point): void {
    const { strokeColor, strokeWidth, canvasColor, eraserWidth } = this.props;

    this.setState(
      produce((draft: ReactSketchCanvasStates) => {
        draft.isDrawing = true;
        draft.undoStack = [];

        draft.currentPaths.push({
          drawMode: draft.drawMode,
          strokeColor: draft.drawMode ? strokeColor : canvasColor,
          strokeWidth: draft.drawMode ? strokeWidth : eraserWidth,
          paths: [point],
        });
      }),
      this.liftPathsUp
    );
  }

  handlePointerMove(point: Point): void {
    const { isDrawing } = this.state;

    if (!isDrawing) return;

    this.setState(
      produce((state: ReactSketchCanvasStates) => {
        state.currentPaths[state.currentPaths.length - 1].paths.push(point);
      }),
      this.liftPathsUp
    );
  }

  handlePointerUp(): void {
    this.setState(
      produce((draft: ReactSketchCanvasStates) => {
        draft.isDrawing = false;
      }),
      this.liftPathsUp
    );
  }

  /* Mouse Handlers ends */

  /* Canvas operations */

  eraseMode(erase: boolean): void {
    this.setState(
      produce((draft: ReactSketchCanvasStates) => {
        draft.drawMode = !erase;
      }),
      this.liftPathsUp
    );
  }

  clearCanvas(): void {
    this.setState(
      produce((draft: ReactSketchCanvasStates) => {
        draft.resetStack = draft.currentPaths;
        draft.currentPaths = [];
      }),
      this.liftPathsUp
    );
  }

  undo(): void {
    const { resetStack } = this.state;

    // If there was a last reset then
    if (resetStack.length !== 0) {
      this.setState(
        produce((draft: ReactSketchCanvasStates) => {
          draft.currentPaths = draft.resetStack;
          draft.resetStack = [];
        }),
        () => {
          const { currentPaths } = this.state;
          const { onUpdate } = this.props;

          onUpdate(currentPaths);
        }
      );

      return;
    }

    this.setState(
      produce((draft: ReactSketchCanvasStates) => {
        const lastSketchPath = draft.currentPaths.pop();

        if (lastSketchPath) {
          draft.undoStack.push(lastSketchPath);
        }
      }),
      this.liftPathsUp
    );
  }

  redo(): void {
    const { undoStack } = this.state;

    // Nothing to Redo
    if (undoStack.length === 0) return;

    this.setState(
      produce((draft: ReactSketchCanvasStates) => {
        const lastUndoPath = draft.undoStack.pop();

        if (lastUndoPath) {
          draft.currentPaths.push(lastUndoPath);
        }
      }),
      this.liftPathsUp
    );
  }

  /* Exporting options */

  // Creates a image from SVG and renders it on canvas, then exports the canvas as image
  exportImage(imageType: ExportImageType): Promise<string> {
    const exportImage = this.svgCanvas.current?.exportImage;

    if (!exportImage) {
      throw Error("Export function called before canvas loaded");
    } else {
      return exportImage(imageType);
    }
  }

  exportSvg(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const exportSvg = this.svgCanvas.current?.exportSvg;

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
  }

  exportPaths(): Promise<CanvasPath[]> {
    const { currentPaths } = this.state;

    return new Promise<CanvasPath[]>((resolve, reject) => {
      try {
        resolve(currentPaths);
      } catch (e) {
        reject(e);
      }
    });
  }

  loadPaths(paths: CanvasPath[]): void {
    this.setState(
      produce((draft: ReactSketchCanvasStates) => {
        draft.currentPaths = draft.currentPaths.concat(paths);
      }),
      this.liftPathsUp
    );
  }

  /* Finally!!! Render method */

  render(): JSX.Element {
    const {
      width,
      height,
      className,
      canvasColor,
      background,
      style,
      allowOnlyPointerType,
    } = this.props;

    const { currentPaths, isDrawing } = this.state;

    return (
      <Canvas
        ref={this.svgCanvas}
        width={width}
        height={height}
        className={className}
        canvasColor={canvasColor}
        background={background}
        allowOnlyPointerType={allowOnlyPointerType}
        style={style}
        paths={currentPaths}
        isDrawing={isDrawing}
        onPointerDown={this.handlePointerDown}
        onPointerMove={this.handlePointerMove}
        onPointerUp={this.handlePointerUp}
      />
    );
  }
}
