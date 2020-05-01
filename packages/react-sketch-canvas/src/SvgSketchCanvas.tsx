import React from "react";

import Canvas from "./Canvas";
import { Point, CanvasPath } from "./typings";
import { produce } from "immer";

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
} & typeof defaultProps;

export type SvgSketchCanvasStates = {
  drawMode: boolean;
  isDrawing: boolean;
  reset: boolean;
  resetStore: CanvasPath[];
  redoStore: CanvasPath[];
  currentPaths: CanvasPath[];
};

export class SvgSketchCanvas extends React.Component<
  SvgSketchCanvasProps,
  SvgSketchCanvasStates
> {
  static defaultProps = defaultProps;

  constructor(props: SvgSketchCanvasProps) {
    super(props);

    this.state = {
      drawMode: true,
      isDrawing: false,
      reset: false,
      resetStore: [],
      redoStore: [],
      currentPaths: [],
    };

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);

    // this.exportImage = this.exportImage.bind(this);
    // this.exportSvg = this.exportSvg.bind(this);
    this.exportPaths = this.exportPaths.bind(this);
    // this.loadPaths = this.loadPaths.bind(this);

    this.eraseMode = this.eraseMode.bind(this);
    this.clearCanvas = this.clearCanvas.bind(this);
    this.undo = this.undo.bind(this);
    this.redo = this.redo.bind(this);
  }

  /* Mouse Handlers - Mouse down, move and up */

  handlePointerDown(point: Point) {
    const { strokeColor, strokeWidth, canvasColor, eraserWidth } = this.props;

    this.setState(
      produce((draft: SvgSketchCanvasStates) => {
        draft.isDrawing = true;
        draft.redoStore = [];

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
      produce((state: SvgSketchCanvasStates) => {
        state.isDrawing = false;
      })
    );
  }

  /* Mouse Handlers ends */

  /* Canvas operations */

  eraseMode(erase: boolean) {
    this.setState(
      produce((state: SvgSketchCanvasStates) => {
        state.isDrawing = !erase;
      })
    );
  }

  clearCanvas() {
    this.setState(
      produce((state: SvgSketchCanvasStates) => {
        state.reset = true;
        state.resetStore = state.currentPaths;
        state.currentPaths = [];
      })
    );
  }

  undo() {
    const { currentPaths, reset } = this.state;

    if (currentPaths.length === 0 && !reset) return;

    this.setState(
      produce((state: SvgSketchCanvasStates) => {
        if (state.reset) {
          state.reset = false;
          state.resetStore = [];
          state.redoStore = state.currentPaths;
          state.currentPaths = state.resetStore;
        } else {
          state.redoStore.push(
            state.currentPaths[state.currentPaths.length - 1]
          );
          state.currentPaths.pop();
        }
      })
    );
  }

  redo() {
    const { redoStore } = this.state;

    if (redoStore.length === 0) return;

    this.setState(
      produce((state: SvgSketchCanvasStates) => {
        state.redoStore.pop();
        state.currentPaths.push(state.redoStore[state.redoStore.length - 1]);
      })
    );
  }

  /* Exporting options */

  // Creates a image from SVG and renders it on canvas, then exports the canvas as image
  // exportImage(imageType) {
  //   return new Promise((resolve, reject) => {
  //     this.svgCanvas.current
  //       .exportImage(imageType)
  //       .then((data) => {
  //         resolve(data);
  //       })
  //       .catch((e) => {
  //         reject(e);
  //       });
  //   });
  // }

  // exportSvg() {
  //   return new Promise((resolve, reject) => {
  //     this.svgCanvas.current
  //       .exportSvg()
  //       .then((data) => {
  //         resolve(data);
  //       })
  //       .catch((e) => {
  //         reject(e);
  //       });
  //   });
  // }

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

  // loadPaths(paths: List<CanvasPath>) {
  //   this.setState((prevState) => ({
  //     currentPaths: mergeDeep(prevState.currentPaths, paths),
  //   }));
  // }

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

export default SvgSketchCanvas;
