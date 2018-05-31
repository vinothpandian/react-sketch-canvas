import React from 'react';
import { render } from 'react-dom';

import SvgSketchCanvas from '../../src';

const Demo = class extends React.Component {
  constructor(props) {
    super(props);

    this.canvas = null;
  }

  render() {
    return (
      <div>
        <h1>React SVG Sketch Demo</h1>
        <SvgSketchCanvas
          ref={(element) => {
            this.canvas = element;
          }}
          width="600px"
          height="400px"
          strokeWidth={4}
          strokeColor="red"
        />
        <button
          onClick={() => {
            this.canvas.undo();
          }}
        >
          Undo
        </button>
        <button
          onClick={() => {
            this.canvas.eraseMode(true);
          }}
        >
          Erase
        </button>
        <button
          onClick={() => {
            this.canvas.redo();
          }}
        >
          Redo
        </button>
        <button
          onClick={() => {
            this.canvas.clearCanvas();
          }}
        >
          Reset canvas
        </button>
        <button
          onClick={() => {
            this.canvas
              .exportImage('png')
              .then((data) => {
                console.log(data);
              })
              .catch((e) => {
                console.log(e);
              });
          }}
        >
          Get Image
        </button>
        <button
          onClick={() => {
            this.canvas
              .exportPaths()
              .then((data) => {
                console.log(data);
              })
              .catch((e) => {
                console.log(e);
              });
          }}
        >
          Get Paths
        </button>
      </div>
    );
  }
};

render(<Demo />, document.querySelector('#demo'));
