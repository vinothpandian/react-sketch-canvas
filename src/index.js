import React from 'react';
import { List, Map } from 'immutable';
import PropTypes from 'prop-types';
import Paths from './Paths';

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

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.getCoordinates = this.getCoordinates.bind(this);

    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchUp = this.handleTouchUp.bind(this);
    this.getTouchCoordinates = this.getTouchCoordinates.bind(this);

    this.exportImage = this.exportImage.bind(this);
    this.exportSvg = this.exportSvg.bind(this);
    this.exportPaths = this.exportPaths.bind(this);

    this.eraseMode = this.eraseMode.bind(this);
    this.clearCanvas = this.clearCanvas.bind(this);
    this.undo = this.undo.bind(this);
    this.redo = this.redo.bind(this);

    this.svgCanvas = null;
  }

  /* Add event listener to Mouse up and Touch up to
      release drawing even when point goes out of canvas */
  componentDidMount() {
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('touchup', this.handleTouchUp);
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('touchup', this.handleTouchUp);
  }

  // Converts mouse coordinates to relative coordinate based on the absolute position of svg
  getCoordinates(mouseEvent) {
    const boundingArea = this.svgCanvas.getBoundingClientRect();
    return new Map({
      x: mouseEvent.clientX - boundingArea.left,
      y: mouseEvent.clientY - boundingArea.top,
    });
  }

  // Converts touch coordinates to relative coordinate based on the absolute position of svg
  getTouchCoordinates(touchEvent) {
    const boundingArea = this.svgCanvas.getBoundingClientRect();
    return new Map({
      x: touchEvent.touches[0].clientX - boundingArea.left,
      y: touchEvent.touches[0].clientY - boundingArea.top,
    });
  }

  /* Mouse Handlers - Mouse down, move and up */

  handleMouseDown(mouseEvent) {
    if (mouseEvent.button !== 0) return;

    const mousePoint = this.getCoordinates(mouseEvent);

    this.setState(state => ({
      isDrawing: true,
      redoStore: new List(),
      // currentPaths: state.currentPaths.push(new List([mousePoint])),
      currentPaths: state.currentPaths.push(new Map({
        drawMode: this.state.drawMode,
        paths: new List([mousePoint]),
      })),
    }));
  }

  handleMouseMove(mouseEvent) {
    if (!this.state.isDrawing) return;

    const mousePoint = this.getCoordinates(mouseEvent);

    this.setState(state => ({
      currentPaths: state.currentPaths.updateIn([state.currentPaths.size - 1], pathMap =>
        pathMap.updateIn(['paths'], list => list.push(mousePoint))),
    }));
  }

  handleMouseUp(mouseEvent) {
    if (mouseEvent.button !== 0) return;

    this.setState({
      isDrawing: false,
    });
  }

  /* Mouse Handlers ends */

  /* Touch handler for touch screen devices - touch start, move and up */

  handleTouchStart(touchEvent) {
    const mousePoint = this.getTouchCoordinates(touchEvent);

    this.setState(state => ({
      isDrawing: true,
      redoStore: new List(),
      currentPaths: state.currentPaths.push(new List([mousePoint])),
    }));
  }

  handleTouchMove(touchEvent) {
    if (!this.state.isDrawing) return;

    const mousePoint = this.getTouchCoordinates(touchEvent);

    this.setState(state => ({
      currentPaths: state.currentPaths.updateIn([state.currentPaths.size - 1], path =>
        path.push(mousePoint)),
    }));
  }

  handleTouchUp() {
    this.setState({
      isDrawing: false,
    });
  }

  /* Touch handler ends */

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
    if (this.state.reset) {
      this.setState(state => ({
        reset: false,
        resetStore: new List(),
        currentPaths: state.resetStore,
      }));
      return;
    }

    if (this.state.currentPaths.isEmpty()) return;

    this.setState(state => ({
      redoStore: state.redoStore.push(state.currentPaths.get(-1)),
      currentPaths: state.currentPaths.pop(),
    }));
  }

  redo() {
    if (this.state.redoStore.isEmpty()) return;

    this.setState(state => ({
      redoStore: state.redoStore.pop(),
      currentPaths: state.currentPaths.push(state.redoStore.get(-1)),
    }));
  }

  /* Exporting options */

  // Creates a image from SVG and renders it on canvas, then exports the canvas as image
  exportImage(imageType) {
    return new Promise((resolve, reject) => {
      try {
        const img = document.createElement('img');
        img.src = `data:image/svg+xml;base64,${btoa(this.svgCanvas.innerHTML)}`;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.setAttribute('width', this.svgCanvas.offsetWidth);
          canvas.setAttribute('height', this.svgCanvas.offsetHeight);
          canvas.getContext('2d').drawImage(img, 0, 0);

          resolve(canvas.toDataURL(`image/${imageType}`));
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  exportSvg() {
    return new Promise((resolve, reject) => {
      try {
        resolve(this.svgCanvas.innerHTML);
      } catch (e) {
        reject(e);
      }
    });
  }

  exportPaths() {
    return new Promise((resolve, reject) => {
      try {
        resolve(this.state.currentPaths);
      } catch (e) {
        reject(e);
      }
    });
  }

  /* Finally!!! Render method */

  render() {
    const {
      width, height, canvasColor, strokeColor, strokeWidth, style,
    } = this.props;

    return (
      <div
        role="presentation"
        ref={(element) => {
          this.svgCanvas = element;
        }}
        style={{ width, height, ...style }}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onTouchStart={this.handleTouchStart}
        onTouchMove={this.handleTouchMove}
      >
        <svg
          version="1.1"
          baseProfile="full"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          <g id="svgCanvasBackground">
            <rect width="100%" height="100%" fill={canvasColor} />
          </g>

          <g id="svgCanvasPenStrokes">
            <Paths
              strokeWidth={strokeWidth}
              strokeColor={strokeColor}
              paths={this.state.currentPaths
                .filter(pathMap => pathMap.get('drawMode'))
                .map(pathMap => pathMap.get('paths'))}
            />
          </g>

          <g id="svgCanvasEraserStrokes">
            <Paths
              strokeWidth={strokeWidth * 1.5}
              strokeColor={canvasColor}
              paths={this.state.currentPaths
                .filter(pathMap => !pathMap.get('drawMode'))
                .map(pathMap => pathMap.get('paths'))}
            />
          </g>
        </svg>
      </div>
    );
  }
};

/* Default settings */

SvgSketchCanvas.defaultProps = {
  width: '100%',
  height: '100%',
  canvasColor: 'white',
  strokeColor: 'black',
  strokeWidth: 4,
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
  strokeWidth: PropTypes.number,
  style: PropTypes.objectOf(PropTypes.string),
};

export default SvgSketchCanvas;
