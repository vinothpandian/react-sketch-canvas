import React from "react";

import { produce } from "immer";
import { Canvas } from "./Canvas";
import { Point, CanvasPath, ExportImageType } from "./typings";

/* Default settings */

const defaultProps = {
  width: "100%",
  height: "100%",
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
};

/* Props validation */

export type SvgSketchCanvasProps = {
  width: string;
  height: string;
  strokeColor: string;
  canvasColor: string;
  background: string;
  strokeWidth: number;
  eraserWidth: number;
  allowOnlyPointerType: string;
  style: React.CSSProperties;
};

export type SvgSketchCanvasStates = {
  drawMode: boolean;
  isDrawing: boolean;
  resetStack: CanvasPath[];
  undoStack: CanvasPath[];
  currentPaths: CanvasPath[];
};

export class SvgSketchCanvas extends React.Component<
  SvgSketchCanvasProps,
  SvgSketchCanvasStates
> {
  static defaultProps = defaultProps;

  svgCanvas: React.RefObject<Canvas>;

  constructor(props: SvgSketchCanvasProps) {
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
    this.resetCanvas = this.resetCanvas.bind(this);
    this.undo = this.undo.bind(this);
    this.redo = this.redo.bind(this);

    this.svgCanvas = React.createRef();
  }

  /* Mouse Handlers - Mouse down, move and up */

  handlePointerDown(point: Point) {
    const { strokeColor, strokeWidth, canvasColor, eraserWidth } = this.props;

    this.setState(
      produce((draft: SvgSketchCanvasStates) => {
        draft.isDrawing = true;
        draft.undoStack = [];

        draft.currentPaths.push({
          drawMode: draft.drawMode,
          strokeColor: draft.drawMode ? strokeColor : canvasColor,
          strokeWidth: draft.drawMode ? strokeWidth : eraserWidth,
          paths: [point],
        });
      })
    );
  }

  handlePointerMove(point: Point) {
    const { isDrawing } = this.state;

    if (!isDrawing) return;

    this.setState(
      produce((state: SvgSketchCanvasStates) => {
        state.currentPaths[state.currentPaths.length - 1].paths.push(point);
      })
    );
  }

  handlePointerUp() {
    this.setState(
      produce((draft: SvgSketchCanvasStates) => {
        draft.isDrawing = false;
      })
    );
  }

  /* Mouse Handlers ends */

  /* Canvas operations */

  eraseMode(erase: boolean) {
    this.setState(
      produce((draft: SvgSketchCanvasStates) => {
        draft.drawMode = !erase;
      })
    );
  }

  resetCanvas() {
    this.setState(
      produce((draft: SvgSketchCanvasStates) => {
        draft.resetStack = draft.currentPaths;
        draft.currentPaths = [];
      })
    );
  }

  undo() {
    const { resetStack } = this.state;

    // If there was a last reset then
    if (resetStack.length !== 0) {
      this.setState(
        produce((draft: SvgSketchCanvasStates) => {
          draft.currentPaths = draft.resetStack;
          draft.resetStack = [];
        })
      );

      return;
    }

    this.setState(
      produce((draft: SvgSketchCanvasStates) => {
        const lastSketchPath = draft.currentPaths.pop();

        if (lastSketchPath) {
          draft.undoStack.push(lastSketchPath);
        }
      })
    );
  }

  redo() {
    const { undoStack } = this.state;

    // Nothing to Redo
    if (undoStack.length === 0) return;

    this.setState(
      produce((draft: SvgSketchCanvasStates) => {
        const lastUndoPath = draft.undoStack.pop();

        if (lastUndoPath) {
          draft.currentPaths.push(lastUndoPath);
        }
      })
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

  exportSvg() {
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

  exportPaths() {
    const { currentPaths } = this.state;

    return new Promise((resolve, reject) => {
      try {
        resolve(currentPaths);
      } catch (e) {
        reject(e);
      }
    });
  }

  loadPaths(paths: CanvasPath[]) {
    this.setState(
      produce((draft: SvgSketchCanvasStates) => {
        draft.currentPaths = draft.currentPaths.concat(paths);
      })
    );
  }

  /* Finally!!! Render method */

  render() {
    const {
      width,
      height,
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
