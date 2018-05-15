import React from "react";
import { List, Map } from "immutable";
import PropTypes from "prop-types";
import SvgElement from "./SvgElement";

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
    return (
      <div
        role="none"
        ref={element => {
          this.svgCanvas = element;
        }}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
      >
        <SvgElement {...this.props} paths={this.state.paths} />
      </div>
    );
  }
};

SvgSketchCanvas.defaultProps = {
  width: 600,
  height: 400,
  strokeColor: "red",
  strokeWidth: 8
};

SvgSketchCanvas.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  strokeColor: PropTypes.string,
  strokeWidth: PropTypes.number
};

export default SvgSketchCanvas;
