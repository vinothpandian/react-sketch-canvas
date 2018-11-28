import React from 'react';
import { List, Map } from 'immutable';
import PropTypes from 'prop-types';
import Paths from './Paths';

const Canvas = class extends React.Component {
  constructor(props) {
    super(props);

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.getCoordinates = this.getCoordinates.bind(this);

    this.canvas = React.createRef();
  }

  /* Add event listener to Mouse up and Touch up to
  release drawing even when point goes out of canvas */
  componentDidMount() {
    document.addEventListener('pointerup', this.handlePointerUp);
  }

  componentWillUnmount() {
    document.removeEventListener('pointerup', this.handlePointerUp);
  }

  // Converts mouse coordinates to relative coordinate based on the absolute position of svg
  getCoordinates(pointerEvent) {
    const boundingArea = this.canvas.current.getBoundingClientRect();

    return new Map({
      x: pointerEvent.pageX - boundingArea.left,
      y: pointerEvent.pageY - boundingArea.top,
    });
  }

  /* Mouse Handlers - Mouse down, move and up */

  handlePointerDown(pointerEvent) {
    // Allow only chosen pointer type
    const { allowOnlyPointerType, onPointerDown } = this.props;
    if (allowOnlyPointerType !== 'all' && pointerEvent.pointerType !== allowOnlyPointerType) return;

    if (pointerEvent.pointerType === 'mouse' && pointerEvent.button !== 0) return;

    const point = this.getCoordinates(pointerEvent);

    onPointerDown(point);
  }

  handlePointerMove(pointerEvent) {
    const { isDrawing, allowOnlyPointerType, onPointerMove } = this.props;

    if (!isDrawing) return;

    // Allow only chosen pointer type
    if (allowOnlyPointerType !== 'all' && pointerEvent.pointerType !== allowOnlyPointerType) return;

    const point = this.getCoordinates(pointerEvent);

    onPointerMove(point);
  }

  handlePointerUp(pointerEvent) {
    if (pointerEvent.pointerType === 'mouse' && pointerEvent.button !== 0) return;

    // Allow only chosen pointer type
    const { allowOnlyPointerType, onPointerUp } = this.props;
    if (allowOnlyPointerType !== 'all' && pointerEvent.pointerType !== allowOnlyPointerType) return;

    onPointerUp();
  }

  /* Mouse Handlers ends */

  // Creates a image from SVG and renders it on canvas, then exports the canvas as image
  exportImage(imageType) {
    return new Promise((resolve, reject) => {
      try {
        const canvas = this.canvas.current;

        const img = document.createElement('img');
        img.src = `data:image/svg+xml;base64,${btoa(canvas.innerHTML)}`;
        console.log(canvas);

        img.onload = () => {
          const renderCanvas = document.createElement('canvas');
          renderCanvas.setAttribute('width', canvas.offsetWidth);
          renderCanvas.setAttribute('height', canvas.offsetHeight);
          renderCanvas.getContext('2d').drawImage(img, 0, 0);

          resolve(renderCanvas.toDataURL(`image/${imageType}`));
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  exportSvg() {
    return new Promise((resolve, reject) => {
      try {
        resolve(this.canvas.current.innerHTML);
      } catch (e) {
        reject(e);
      }
    });
  }

  /* Finally!!! Render method */

  render() {
    const {
      width, height, canvasColor, background, style, paths,
    } = this.props;

    return (
      <div
        role="presentation"
        ref={this.canvas}
        style={{
          touchAction: 'none',
          width,
          height,
          ...style,
        }}
        onPointerDown={this.handlePointerDown}
        onPointerMove={this.handlePointerMove}
        onPointerUp={this.handlePointerUp}
      >
        <svg
          version="1.1"
          baseProfile="full"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: '100%',
            height: '100%',
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
};

/* Default settings */

Canvas.defaultProps = {
  width: '100%',
  height: '100%',
  canvasColor: 'white',
  background: '',
  allowOnlyPointerType: 'all',
  style: {
    border: '0.0625rem solid #9c9c9c',
    borderRadius: '0.25rem',
  },
};

/* Props validation */

Canvas.propTypes = {
  paths: PropTypes.instanceOf(List).isRequired,
  isDrawing: PropTypes.bool.isRequired,
  onPointerDown: PropTypes.func.isRequired,
  onPointerMove: PropTypes.func.isRequired,
  onPointerUp: PropTypes.func.isRequired,
  width: PropTypes.string,
  height: PropTypes.string,
  canvasColor: PropTypes.string,
  background: PropTypes.string,
  allowOnlyPointerType: PropTypes.string,
  style: PropTypes.objectOf(PropTypes.string),
};

export default Canvas;
