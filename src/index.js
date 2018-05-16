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
    this.exportDataUri = this.exportDataUri.bind(this);
    this.svgCanvas = null;
  }

  componentDidMount() {
    document.addEventListener("mouseup", this.handleMouseUp);
  }

  componentWillUnmount() {
    document.removeEventListener("mouseup", this.handleMouseUp);
  }

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

  exportDataUri() {
    const data = `data:image/svg+xml;base64,${btoa(this.svgCanvas.innerHTML)}`;

    return data;
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
          <Paths strokeColor={strokeColor} paths={this.state.paths} />
        </svg>
      </div>
    );
  }
};

SvgSketchCanvas.defaultProps = {
  width: 600,
  height: 400,
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
  strokeWidth: PropTypes.number,
  styles: PropTypes.objectOf(PropTypes.string)
};

export default SvgSketchCanvas;
