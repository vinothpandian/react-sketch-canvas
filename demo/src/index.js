import React from 'react';
import { render } from 'react-dom';
import './index.css';

import SvgSketchCanvas from '../../src';

const modes = {
  0: 'mouse',
  1: 'touch',
  2: 'pen',
  3: 'all',
};

const Demo = class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      penMode: true,
      exportedPaths: null,
      allowOnlyPointerType: 0,
      strokeColor: '#000000',
      canvasColor: '#FFFFFF',
      strokeWidth: 4,
      eraserWidth: 5,
    };

    this.canvas = React.createRef();
    this.getNextMode = this.getNextMode.bind(this);
  }

  getNextMode() {
    this.setState(prevState => ({
      allowOnlyPointerType: (prevState.allowOnlyPointerType + 1) % 4,
    }));
  }

  render() {
    const {
      exportedPaths,
      allowOnlyPointerType,
      penMode,
      strokeColor,
      canvasColor,
      eraserWidth,
      strokeWidth,
    } = this.state;

    const mode = modes[allowOnlyPointerType];

    return (
      <div id="root">
        <h1 id="header">React SVG Sketch Demo</h1>
        <div id="wrapper">
          <div id="canvasWrapper">
            <SvgSketchCanvas
              ref={this.canvas}
              strokeWidth={strokeWidth}
              strokeColor={strokeColor}
              canvasColor={canvasColor}
              eraserWidth={eraserWidth}
              allowOnlyPointerType={mode}
            />
          </div>
          <div id="buttonPanel">
            <button
              type="button"
              onClick={() => {
                this.canvas.current.undo();
              }}
            >
              Undo
            </button>
            <button
              type="button"
              onClick={() => {
                this.canvas.current.redo();
              }}
            >
              Redo
            </button>
            <hr />
            <span>{`Current sketch mode: ${penMode ? 'Pen' : 'Eraser'}`}</span>
            <div className="colorPanel">
              <span>Pen Color: </span>
              <input
                type="color"
                value={strokeColor}
                onChange={(event) => {
                  this.setState({
                    strokeColor: event.target.value,
                  });
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                this.canvas.current.eraseMode(false);
                this.setState({
                  penMode: true,
                });
              }}
            >
              Pen
            </button>
            <button
              type="button"
              onClick={() => {
                this.canvas.current.eraseMode(true);
                this.setState({
                  penMode: false,
                });
              }}
            >
              Erase
            </button>
            <hr />
            <div className="colorPanel">
              <span>Canvas Color: </span>
              <input
                type="color"
                value={canvasColor}
                onChange={(event) => {
                  this.setState({
                    canvasColor: event.target.value,
                  });
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                this.canvas.current.clearCanvas();
              }}
            >
              Reset canvas
            </button>
            <button
              type="button"
              onClick={() => {
                this.canvas.current
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
              type="button"
              onClick={() => {
                this.canvas.current
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
              type="button"
              disabled={exportedPaths === null}
              onClick={() => {
                this.canvas.current.loadPaths(exportedPaths);
              }}
            >
              Load Paths
            </button>
            <hr />
            <span>{`Current allowed mode: ${mode}`}</span>
            <button type="button" onClick={this.getNextMode}>
              Switch mode
            </button>
          </div>
        </div>
      </div>
    );
  }
};

render(<Demo />, document.querySelector('#demo'));
