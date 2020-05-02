# React Sketch canvas

## Freehand vector drawing tool for React using SVG as canvas

### Supports Desktop and Mobile.

### Accepts input from Mouse, touch, and graphic tablets

#### <span style="color:red">**Requires React 16.4**</span>

#### Depends on [Immer] and [pepjs]

[![npm version](https://badge.fury.io/js/react-sketch-canvas.svg)](https://badge.fury.io/js/react-sketch-canvas)

---

### Demo at [https://vinoth.info/react-sketch-canvas](https://vinoth.info/react-sketch-canvas)

## Installation

If you use npm

```sh
npm i react-sketch-canvas
```

or with yarn

```sh
yarn add react-sketch-canvas
```

For Javascript Script tag use

```html
<script
  type="text/javascript"
  src="https://unpkg.com/react-sketch-canvas@5.0.0/umd/react-sketch-canvas.min.js"
></script>
```

## Example

Common usage example

```javascript
import React from "react";
import ReactSketchCanvas from "react-sketch-canvas";

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
import React from "react";
import ReactSketchCanvas from "react-sketch-canvas";

const styles = {
  border: "0.0625rem solid #9c9c9c",
  borderRadius: "0.25rem"
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
            this.canvas.current.
              .exportImage("png")
              .then(data => {
                console.log(data);
              })
              .catch(e => {
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

| Props                | Expected datatype | Default value | Description                                                          |
| -------------------- | ----------------- | ------------- | -------------------------------------------------------------------- |
| className            | PropTypes.string  | ""            | Class for using with CSS selectors                                   |
| width                | PropTypes.string  | 100%          | canvas width (em/rem/px)                                             |
| height               | PropTypes.string  | 100%          | canvas width (em/rem/px)                                             |
| canvasColor          | PropTypes.string  | white         | canvas color (HTML colors)                                           |
| background           | PropTypes.string  | ''            | Set SVG background using CSS [background][css-bg] value              |
| strokeColor          | PropTypes.string  | black         | Pen color                                                            |
| strokeWidth          | PropTypes.number  | 4             | Pen stroke size                                                      |
| eraserWidth          | PropTypes.number  | 8             | Erase size                                                           |
| allowOnlyPointerType | PropTypes.string  | all           | allow pointer type ("all"/"mouse"/"pen"/"touch")                     |
| onUpdate             | PropTypes.func    | all           | Returns the current sketch path in `CanvasPath` type on every update |

Set SVG background using CSS [background][css-bg] value

You can specify width and height values in em or rem. It fills the parent element space if width and height are not set

Example

```javascript
<ReactSketchCanvas width="25em" height="10rem" />
```

## Styling

You can pass a CSS in JS style object to style the element. By default it has a border with following properties

```css
canvas {
  border: 0.0625rem solid #9c9c9c;
  border-radius: 0.25rem;
}
```

Example

```javascript
<ReactSketchCanvas
  style={{
    border: "0.0625rem solid #9c9c9c",
  }}
/>
```

## Functions

You can export the sketch as an image or as a svg

_Use ref to access the element and call the following functions to export image_

| Props                        | Expected datatype                                                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| eraseMode(boolean)           | Switch to eraser mode by passing true. You can switch back to pen mode by passing false                                      |
| clearCanvas()                | Clears the canvas.                                                                                                           |
| undo()                       | Undo the last action.                                                                                                        |
| redo()                       | Redo the previous action.                                                                                                    |
| exportImage(imageTypeString) | Accepts an image type as argument (`ExportImageType`) and returns a Promise which resolves to base64 data url of the sketch. |
| exportSvg()                  | returns a Promise which resolves to an inline SVG element.                                                                   |
| exportPaths()                | returns a Promise which resolves to an instance of `CanvasPath`.                                                             |
| loadPaths(CanvasPath)        | Accepts an `CanvasPath` exported from exportPaths() and loads it on the canvas.                                              |

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
}
```

## Changelog

### Version 5.0.1

Added README :)

### Version 5.0.0

#### Added features

- Rewrote codebase in typescript
- Added pepjs to support more browsers
- Added onUpdate feature to get current paths in `CanvasPath` type
- Fixed sketch offset issue when the canvas is scrolled
- Updated undo/redo/reset strategy
- Updated demo in storybook

### Version 4.0.0

#### Breaking change

- Renamed SvgSketchCanvas to ReactSketchCanvas to keep naming convention

#### Added features

- Added className property to set class names for CSS selectors

### Version 3.0.1

Bugfix: Moved immutable dependency from Canvas file

### Version 3.0.0

Removed onUpdate feature and made the system modular

#### Added features

- Made Canvas as a separate module. Now event handlers can be hooked with Canvas
  class to update paths from server. (For Collaboration use case)

#### Breaking changes

- Removed onUpdate feature and instead made Canvas module

### Version 2.3.0

onUpdate feature

#### Added features

- Added onUpdate property to get the current sketch paths after every update

### Version 2.2.0

allowOnlyPointerType

#### Added features

- Added "allowOnlyPointerType" use-case. Now single pointer type can be targetted

### Version 2.1.0

#### Added features

- Switched to pointer events

### Version 2.0.1

#### Added features

- Add SVG background using CSS

### Version 2.0.0

#### Breaking change

- Rename exportAsImage() to exportImage() for naming consistency

#### Added features

- Export and load paths
- Erase mode and eraser width

---

## Thanks to

- Philipp Spiess' [tutorial][based-on]
- Draws smooth curves, thanks to François Romain's [tutorial][smooth-curve-tutorial]
- Immer [link][immer]
- Pepjs [link][pepjs]

---

[based-on]: https://pspdfkit.com/blog/2017/how-to-build-free-hand-drawing-using-react/
[smooth-curve-tutorial]: https://medium.com/@francoisromain/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74
[css-bg]: https://developer.mozilla.org/en-US/docs/Web/CSS/background
[immer]: https://immerjs.github.io/immer/docs/introduction
[pepjs]: https://github.com/jquery/PEP#readme
