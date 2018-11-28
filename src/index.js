import React from 'react';
import { List, Map, mergeDeep } from 'immutable';
import PropTypes from 'prop-types';
import Canvas from './Canvas';

const SvgSketchCanvas = class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      drawMode: true,
      isDrawing: false,
      reset: false,
      resetStore: new List(),
      redoStore: new List(),
      currentPaths: new List(),
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

    this.svgCanvas = React.createRef();
  }

  /* Mouse Handlers - Mouse down, move and up */

  handlePointerDown(point) {
    const {
      strokeColor, strokeWidth, canvasColor, eraserWidth,
    } = this.props;

    this.setState(state => ({
      isDrawing: true,
      redoStore: new List(),
      currentPaths: state.currentPaths.push(
        new Map({
          drawMode: state.drawMode,
          strokeColor: state.drawMode ? strokeColor : canvasColor,
          strokeWidth: state.drawMode ? strokeWidth : eraserWidth,
          paths: new List([point]),
        }),
      ),
    }));
  }

  handlePointerMove(point) {
    const { isDrawing } = this.state;

    if (!isDrawing) return;

    this.setState(state => ({
      currentPaths: state.currentPaths.updateIn([state.currentPaths.size - 1], pathMap => pathMap.updateIn(['paths'], list => list.push(point))),
    }));
  }

  handlePointerUp() {
    this.setState({
      isDrawing: false,
    });
  }

  /* Mouse Handlers ends */

  /* Canvas operations */

  eraseMode(erase) {
    this.setState({
      drawMode: !erase,
    });
  }

  clearCanvas() {
    this.setState(state => ({
      reset: true,
      resetStore: state.currentPaths,
      currentPaths: new List(),
    }));
  }

  undo() {
    const { currentPaths, reset } = this.state;

    if (currentPaths.isEmpty() && !reset) return;

    this.setState((state) => {
      if (state.reset) {
        return {
          reset: false,
          resetStore: new List(),
          redoStore: state.currentPaths,
          currentPaths: state.resetStore,
        };
      }
      return {
        redoStore: state.redoStore.push(state.currentPaths.get(-1)),
        currentPaths: state.currentPaths.pop(),
      };
    });
  }

  redo() {
    const { redoStore } = this.state;

    if (redoStore.isEmpty()) return;

    this.setState(state => ({
      redoStore: state.redoStore.pop(),
      currentPaths: state.currentPaths.push(state.redoStore.get(-1)),
    }));
  }

  /* Exporting options */

  // Creates a image from SVG and renders it on canvas, then exports the canvas as image
  exportImage(imageType) {
    return new Promise((resolve, reject) => {
      this.svgCanvas.current
        .exportImage(imageType)
        .then((data) => {
          resolve(data);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  exportSvg() {
    return new Promise((resolve, reject) => {
      this.svgCanvas.current
        .exportSvg()
        .then((data) => {
          resolve(data);
        })
        .catch((e) => {
          reject(e);
        });
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

  loadPaths(paths) {
    this.setState(prevState => ({
      currentPaths: mergeDeep(prevState.currentPaths, paths),
    }));
  }

  /* Finally!!! Render method */

  render() {
    const {
      width, height, canvasColor, background, style, allowOnlyPointerType,
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
};

/* Default settings */

SvgSketchCanvas.defaultProps = {
  width: '100%',
  height: '100%',
  canvasColor: 'white',
  strokeColor: 'red',
  background: '',
  strokeWidth: 4,
  eraserWidth: 8,
  allowOnlyPointerType: 'pen',
  style: {
    border: '0.0625rem solid #9c9c9c',
    borderRadius: '0.25rem',
  },
};

/* Props validation */

SvgSketchCanvas.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  strokeColor: PropTypes.string,
  canvasColor: PropTypes.string,
  background: PropTypes.string,
  strokeWidth: PropTypes.number,
  eraserWidth: PropTypes.number,
  allowOnlyPointerType: PropTypes.string,
  style: PropTypes.objectOf(PropTypes.string),
};

export default SvgSketchCanvas;
