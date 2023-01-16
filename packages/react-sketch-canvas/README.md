<p style="text-align: center;">
  <img src="https://i.imgur.com/ajs39FC.png" height="150" alt="React Sketch Canvas" />
</p>
<br/>
<h3 style="text-align: center;">
  Freehand vector drawing component for React using SVG as canvas 🖌
</h3>
<br/>
<br/>
<div style="text-align: center;">

![npm](https://img.shields.io/npm/v/react-sketch-canvas?style=flat-square) &nbsp;&nbsp; ![NPM](https://img.shields.io/npm/l/react-sketch-canvas?style=flat-square) &nbsp;&nbsp; ![npm](https://img.shields.io/npm/dm/react-sketch-canvas?style=flat-square) <br/>
![npm bundle size](https://img.shields.io/bundlephobia/min/react-sketch-canvas?style=flat-square) &nbsp;&nbsp; ![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-sketch-canvas?style=flat-square) <br/>
[![codecov](https://codecov.io/gh/vinothpandian/react-sketch-canvas/branch/master/graph/badge.svg?token=NJcqGRgbSa)](https://codecov.io/gh/vinothpandian/react-sketch-canvas)
<br/>
This project was built using [Turborepo](https://turbo.build/).

</div>

## Overview

### Features

- **Supports Desktop and Mobile.**
- **Accepts input from Mouse, touch, and graphic tablets.**

### Requirements

- **<span style="color:red">**Requires React >= 16.8**</span>**

### Wanna test React Sketch Canvas before using it?

- **Try [here](https://vinoth.info/react-sketch-canvas)**

## Installation

If you use npm

```sh
npm i react-sketch-canvas
```

or with yarn

```sh
yarn add react-sketch-canvas
```

## Example

Common usage example

```javascript
import * as React from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";

const styles = {
  border: "0.0625rem solid #9c9c9c",
  borderRadius: "0.25rem",
};

const Canvas = () => {
  return (
    <ReactSketchCanvas
      style={styles}
      width="600"
      height="400"
      strokeWidth={4}
      strokeColor="red"
    />
  );
};
```

To export Data URL of your sketch use ref

```javascript
import * as React from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";

const styles = {
  border: "0.0625rem solid #9c9c9c",
  borderRadius: "0.25rem",
};

const Canvas = class extends React.Component {
  constructor(props) {
    super(props);

    this.canvas = React.createRef();
  }

  render() {
    return (
      <div>
        <ReactSketchCanvas
          ref={this.canvas}
          strokeWidth={5}
          strokeColor="black"
        />
        <button
          onClick={() => {
            this.canvas.current
              .exportImage("png")
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
      </div>
    );
  }
};
```

## List of Props

| Props                              | Expected datatype | Default value         | Description                                                                                         |
| ---------------------------------- | ----------------- | --------------------- | --------------------------------------------------------------------------------------------------- |
| width                              | PropTypes.string  | 100%                  | canvas width (em/rem/px)                                                                            |
| height                             | PropTypes.string  | 100%                  | canvas width (em/rem/px)                                                                            |
| id                                 | PropTypes.string  | "react-sketch-canvas" | ID field to uniquely identify a SVG canvas (Supports multiple canvases in a single page)            |
| className                          | PropTypes.string  | ""                    | Class for using with CSS selectors                                                                  |
| strokeColor                        | PropTypes.string  | black                 | Pen color                                                                                           |
| canvasColor                        | PropTypes.string  | white                 | canvas color (HTML colors)                                                                          |
| backgroundImage                    | PropTypes.string  | ''                    | Set SVG background with image URL                                                                   |
| exportWithBackgroundImage          | PropTypes.bool    | false                 | Keep background image on image/SVG export (on false, canvasColor will be set as background)         |
| preserveBackgroundImageAspectRatio | PropTypes.string  | none                  | Set aspect ratio of the background image. For possible values check [MDN docs][preserveaspectratio] |
| strokeWidth                        | PropTypes.number  | 4                     | Pen stroke size                                                                                     |
| eraserWidth                        | PropTypes.number  | 8                     | Erase size                                                                                          |
| allowOnlyPointerType               | PropTypes.string  | all                   | allow pointer type ("all"/"mouse"/"pen"/"touch")                                                    |
| onChange                           | PropTypes.func    |                       | Returns the current sketch path in `CanvasPath` type on every path change                           |
| onStroke                           | PropTypes.func    |                       | Returns the the last stroke path and whether it is an eraser stroke on every pointer up event       |
| style                              | PropTypes.object  | false                 | Add CSS styling as CSS-in-JS object                                                                 |
| svgStyle                           | PropTypes.object  | {}                    | Add CSS styling as CSS-in-JS object for the SVG                                                     |
| withTimestamp                      | PropTypes.bool    | false                 | Add timestamp to individual strokes for measuring sketching time                                    |

Set SVG background using CSS [background][css-bg] value

You can specify width and height values in em or rem. It fills the parent element space if width and height are not set

<br />

## Methods

You can export the sketch as an image or as a svg

_Use ref to access the element and call the following functions to export image_

| Props                        | Expected datatype                                                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| eraseMode(boolean)           | Switch to eraser mode by passing true. You can switch back to pen mode by passing false                                                          |
| clearCanvas()                | Clears the canvas.                                                                                                                               |
| resetCanvas()                | Resets the canvas and clears the undo/redo stack along with it.                                                                                  |
| undo()                       | Undo the last action.                                                                                                                            |
| redo()                       | Redo the previous action.                                                                                                                        |
| exportImage(imageTypeString) | Accepts an image type as argument (`ExportImageType`) and returns a Promise which resolves to base64 data url of the sketch.                     |
| exportSvg()                  | returns a Promise which resolves to an inline SVG element.                                                                                       |
| exportPaths()                | returns a Promise which resolves to an instance of `CanvasPath`.                                                                                 |
| loadPaths(CanvasPath)        | Accepts an `CanvasPath` exported from exportPaths() and loads it on the canvas.                                                                  |
| getSketchingTime()           | returns a Promise which resolves the time that user sketched in the canvas (considers only when the user made the strokes or erased the strokes) |

## Types

```ts
type ExportImageType = "jpeg" | "png";

interface Point {
  x: number;
  y: number;
}

interface CanvasPath {
  paths: Point[];
  strokeWidth: number;
  strokeColor: string;
  drawMode: boolean;
  startTimestamp?: number;
  endTimestamp?: number;
}
```

---

## Thanks to

- Philipp Spiess' [tutorial][based-on]
- Draws smooth curves, thanks to François Romain's [tutorial][smooth-curve-tutorial]

---

[based-on]: https://pspdfkit.com/blog/2017/how-to-build-free-hand-drawing-using-react/
[smooth-curve-tutorial]: https://medium.com/@francoisromain/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74
[css-bg]: https://developer.mozilla.org/en-US/docs/Web/CSS/background
[preserveaspectratio]: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio
