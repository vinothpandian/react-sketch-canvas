# React SVG Sketch canvas

## Freehand vector drawing tool for React using SVG as canvas

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

---

## Installation

If you use npm

```sh
npm i react-svg-sketch
```

or with yarn

```sh
yarn add react-svg-sketch
```

For Javascript Script tag use

```html
<script type="text/javascript" src="https://unpkg.com/react-svg-sketch@1.0.0/umd/react-svg-sketch.min.js"></script>
```

## Example

Common usage example

```javascript
import React from "react";
import SvgSketchCanvas from "react-svg-sketch";

const styles = {
  border: "0.0625rem solid #9c9c9c",
  borderRadius: "0.25rem"
};

const Canvas = () => {
  return (
    <SvgSketchCanvas
      style={styles}
      width={600}
      height={400}
      strokeWidth={4}
      strokeColor="red"
    />
  );
};
```

To export Data URL of your sketch use ref

```javascript
import React from "react";
import SvgSketchCanvas from "react-svg-sketch";

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
              .exportAsImage("png")
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

| Props       | Expected datatype |
| ----------- | ----------------- |
| width       | PropTypes.number  |
| height      | PropTypes.number  |
| strokeColor | PropTypes.string  |
| canvasColor | PropTypes.string  |
| strokeWidth | PropTypes.number  |

You can pass a CSS in JS style object to style the element

## Functions

You can export the sketch as an image or as a svg

_Use ref to access the element and call the following functions to export image_

* exportSvg() : returns a Promise which resolves to an inline SVG element.
* exportAsImage(imageType) : Accepts an image type as argument (ex. jpeg, png) and returns a Promise which resolves to base64 data url of the sketch.

---

### Thanks to

---

Based on Philipp Spiess' [tutorial][based-on]

Smooth curves - thanks to François Romain's [tutorial][smooth-curve-tutorial]

---

[build-badge]: https://img.shields.io/travis/user/repo/master.png?style=flat-square
[build]: https://travis-ci.org/user/repo
[npm-badge]: https://img.shields.io/npm/v/npm-package.png?style=flat-square
[npm]: https://www.npmjs.com/package/react-svg-sketch
[coveralls-badge]: https://img.shields.io/coveralls/user/repo/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/user/repo
[based-on]: https://pspdfkit.com/blog/2017/how-to-build-free-hand-drawing-using-react/
[smooth-curve-tutorial]: https://medium.com/@francoisromain/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74
