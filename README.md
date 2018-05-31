# React Sketch canvas

## Freehand vector drawing tool for React using SVG as canvas

### Supports Desktop and Mobile browser

#### Depends on [Immutable.js][immutable]

[![npm package][npm-badge]][npm]

---

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
<script type="text/javascript" src="https://unpkg.com/react-sketch-canvas@1.0.0/umd/react-sketch-canvas.min.js"></script>
```

## Example

Common usage example

```javascript
import React from "react";
import SvgSketchCanvas from "react-sketch-canvas";

const styles = {
  border: "0.0625rem solid #9c9c9c",
  borderRadius: "0.25rem"
};

const Canvas = () => {
  return (
    <SvgSketchCanvas
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
import SvgSketchCanvas from "react-sketch-canvas";

const styles = {
  border: "0.0625rem solid #9c9c9c",
  borderRadius: "0.25rem"
};

const Canvas = class extends React.Component {
  constructor(props) {
    super(props);

    this.canvas = null;
  }

  render() {
    return (
      <div>
        <SvgSketchCanvas
          ref={element => {
            this.canvas = element;
          }}
          strokeWidth={5}
          strokeColor="black"
        />
        <button
          onClick={() => {
            this.canvas
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

| Props       | Expected datatype | Default value |
| ----------- | ----------------- | ------------- |
| width       | PropTypes.string  | 100%          |
| height      | PropTypes.string  | 100%          |
| canvasColor | PropTypes.string  | white         |
| strokeColor | PropTypes.string  | black         |
| strokeWidth | PropTypes.number  | 4             |
| eraserWidth | PropTypes.number  | 8             |

You can specify width and height values in em or rem. It fills the parent element space if width and height are not set

Example

```javascript
<SvgSketchCanvas width="25em" height="10rem" />
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
<SvgSketchCanvas
  style={{
    border: "0.0625rem solid #9c9c9c"
  }}
/>
```

## Functions

You can export the sketch as an image or as a svg

_Use ref to access the element and call the following functions to export image_

| Props                        | Expected datatype                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| eraseMode(boolean)           | Switch to eraser mode by passing true. You can switch back to pen mode by passing false                                  |
| clearCanvas()                | Clears the canvas.                                                                                                       |
| undo()                       | Undo the last action.                                                                                                    |
| redo()                       | Redo the previous action.                                                                                                |
| exportImage(imageTypeString) | Accepts an image type as argument (ex. jpeg, png) and returns a Promise which resolves to base64 data url of the sketch. |
| exportSvg()                  | returns a Promise which resolves to an inline SVG element.                                                               |
| exportPaths()                | returns a Promise which resolves to an instance of Immutable.js [List][immutable-list].                                  |
| loadPaths(ImmutableList)     | Accepts an Immutable [List][immutable-list] exported from exportPaths() and loads it on the canvas.                      |

## Changelog

### Version 2.0.0

#### Breaking change

* Rename exportAsImage() to exportImage() for naming consistency

#### Added features

* Export and load paths
* Erase mode and eraser width

---

## Thanks to

* Philipp Spiess' [tutorial][based-on]
* Draws smooth curves, thanks to François Romain's [tutorial][smooth-curve-tutorial]
* Immutable.js [link][immutable]

---

[npm-badge]: https://img.shields.io/npm/v/npm-package.png?style=flat-square
[npm]: https://www.npmjs.com/package/react-sketch-canvas
[based-on]: https://pspdfkit.com/blog/2017/how-to-build-free-hand-drawing-using-react/
[smooth-curve-tutorial]: https://medium.com/@francoisromain/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74
[immutable]: https://facebook.github.io/immutable-js/
[immutable-list]: https://facebook.github.io/immutable-js/docs/#/List
