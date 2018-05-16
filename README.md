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

## Example

Common usage example

```javascript
import React from "react";

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

const styles = {
  border: "0.0625rem solid #9c9c9c",
  borderRadius: "0.25rem"
};

const Canvas = class extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
    this.canvas = null;
  }

  handleClick(event) {
    const dataUrl = this.canvas.exportDataUri();

    // To check data url value
    console.log(dataUrl);
  }

  render() {
    return (
      <div>
        <SvgSketchCanvas
          ref={element => {
            this.canvas = element;
          }}
          style={styles}
          width={600}
          height={400}
          strokeWidth={4}
          strokeColor="red"
        />
        <button onClick={this.handleClick}>Export Image</button>
      </div>
    );
  }
};
```

---

### Thanks to

---

Based on Philipp Spiess' [tutorial][based-on]

Smooth curves - thanks to François Romain's [tutorial][smooth-curve-tutorial]

---

[build-badge]: https://img.shields.io/travis/user/repo/master.png?style=flat-square
[build]: https://travis-ci.org/user/repo
[npm-badge]: https://img.shields.io/npm/v/npm-package.png?style=flat-square
[npm]: https://www.npmjs.org/package/npm-package
[coveralls-badge]: https://img.shields.io/coveralls/user/repo/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/user/repo
[based-on]: https://pspdfkit.com/blog/2017/how-to-build-free-hand-drawing-using-react/
[smooth-curve-tutorial]: https://medium.com/@francoisromain/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74
