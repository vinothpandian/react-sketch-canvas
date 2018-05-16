import React from "react";
import { List, Map } from "immutable";
import PropTypes from "prop-types";
import Paths from "./Paths";

const SvgSketchCanvas = class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isDrawing: false,
      paths: new List()
    };

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.getCoordinates = this.getCoordinates.bind(this);
    this.exportAsImage = this.exportAsImage.bind(this);
    this.exportSvg = this.exportSvg.bind(this);
    this.svgCanvas = null;
    this.rawCanvas = null;
  }

  componentDidMount() {
    document.addEventListener("mouseup", this.handleMouseUp);
  }

  componentWillUnmount() {
    document.removeEventListener("mouseup", this.handleMouseUp);
  }

  // Converts mouse coordinates to relative coordinate based on the absolute position of svg
  getCoordinates(mouseEvent) {
    const boundingArea = this.svgCanvas.getBoundingClientRect();
    return new Map({
      x: mouseEvent.clientX - boundingArea.left,
      y: mouseEvent.clientY - boundingArea.top
    });
  }

  handleMouseDown(mouseEvent) {
    if (mouseEvent.button !== 0) return;

    const mousePoint = this.getCoordinates(mouseEvent);

    this.setState(prevState => ({
      isDrawing: true,
      paths: prevState.paths.push(new List([mousePoint]))
    }));
  }

  // Creates a image from SVG and renders it on canvas, then exports the canvas as image
  exportAsImage(imageType) {
    return new Promise((resolve, reject) => {
      try {
        const img = document.createElement("img");
        img.src = `data:image/svg+xml;base64,${btoa(this.svgCanvas.innerHTML)}`;

        let pngDataUrl = null;

        img.onload = function() {
          const ctx = this.rawCanvas.getContext("2d");
          ctx.fillStyle = "white";
          ctx.drawImage(img, 0, 0);

          resolve(this.rawCanvas.toDataURL(`image/${imageType}`));
        }.bind(this);
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

  handleMouseMove(mouseEvent) {
    if (!this.state.isDrawing) return;

    const mousePoint = this.getCoordinates(mouseEvent);

    this.setState(prevState => ({
      paths: prevState.paths.updateIn([prevState.paths.size - 1], path =>
        path.push(mousePoint)
      )
    }));
  }

  handleMouseUp(mouseEvent) {
    if (mouseEvent.button !== 0) return;

    this.setState({
      isDrawing: false
    });
  }

  render() {
    const { width, height, strokeColor, strokeWidth, styles } = this.props;

    return (
      <React.Fragment>
        <div
          role="presentation"
          ref={element => {
            this.svgCanvas = element;
          }}
          style={{ width, height, ...styles }}
          onMouseDown={this.handleMouseDown}
          onMouseMove={this.handleMouseMove}
        >
          <svg
            version="1.1"
            baseProfile="full"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            xmlns="http://www.w3.org/2000/svg"
            style={{
              strokeWidth
            }}
          >
            <rect width="100%" height="100%" fill={this.props.canvasColor} />
            <Paths strokeColor={strokeColor} paths={this.state.paths} />
          </svg>
        </div>

        {/* Canvas used for converting svg to image */}
        <canvas
          style={{ display: "none" }}
          width={width}
          height={height}
          ref={element => {
            this.rawCanvas = element;
          }}
        />
      </React.Fragment>
    );
  }
};

SvgSketchCanvas.defaultProps = {
  width: 600,
  height: 400,
  canvasColor: "white",
  strokeColor: "black",
  strokeWidth: 4,
  styles: {
    border: "0.0625rem solid #9c9c9c",
    borderRadius: "0.25rem"
  }
};

SvgSketchCanvas.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  strokeColor: PropTypes.string,
  canvasColor: PropTypes.string,
  strokeWidth: PropTypes.number,
  styles: PropTypes.objectOf(PropTypes.string)
};

export default SvgSketchCanvas;
