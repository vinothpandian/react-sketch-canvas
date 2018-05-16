import React, { Component } from "react";
import { render } from "react-dom";

import SvgSketchCanvas from "../../src";

const Demo = class extends React.Component {
  constructor(props) {
    super(props);

    this.canvas = null;
  }

  render() {
    return (
      <div>
        <h1>react-svg-sketch Demo</h1>
        <SvgSketchCanvas
          ref={element => {
            this.canvas = element;
          }}
          strokeWidth={4}
          strokeColor="red"
        />
        <button
          onClick={event => {
            console.log(this.canvas.exportDataUri());
          }}
        >
          Get Image
        </button>
      </div>
    );
  }
};
render(<Demo />, document.querySelector("#demo"));
