import React from 'react';
import { render } from 'react-dom';

import SvgSketchCanvas from '../../src';

const Demo = class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      penMode: true,
      exportedPaths: null,
    };

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
            this.canvas.redo();
          }}
        >
          Redo
        </button>
        <button
          onClick={() => {
            this.canvas.eraseMode(false);
          }}
        >
          Pen
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
                this.setState({
                  exportedPaths: data,
                });
              })
              .catch((e) => {
                console.log(e);
              });
          }}
        >
          Get Paths
        </button>
        <button
          disabled={this.state.exportedPaths === null}
          onClick={() => {
            this.canvas.loadPaths(this.state.exportedPaths);
          }}
        >
          Load Paths
        </button>
      </div>
    );
  }
};

render(<Demo />, document.querySelector('#demo'));
