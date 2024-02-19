---
title: Methods
description: List of methods to access from the `ref` of the `ReactSketchCanvas` component
---

Use ref to access the element and call the following functions to export the image.

## Usage
```tsx
import { useRef } from 'react';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';

function App() {
  const ref = useRef<ReactSketchCanvasRef>(null);

  const undo = () => {
    ref.current?.undo();
  };

  return (
    <>
      <ReactSketchCanvas ref={ref} />
      <button onClick={undo}> Undo</button>
    </>
  );
}
```

## Methods

### eraseMode(mode)

Switch to eraser mode by passing `true`. Switch back to pen mode by passing `false`.

### clearCanvas()

Clears the canvas.

### resetCanvas()

Resets the canvas and clears the undo/redo stack.

### undo()

Undo the last action.

### redo()

Redo the previous action.

### exportImage(imageType, options?)

Returns a Promise resolving to a base64 data URL of the sketch. Accepts an image type as the first argument and an optional options object as the second argument.
Image type can be one of the following:
- png
- jpeg

The options is an optional object that can contain the following properties:
- width: number
- height: number

### exportSvg()

Returns a Promise which resolves to an inline SVG element.

### exportPaths()

Returns a Promise resolving to an instance of `CanvasPath`.

### loadPaths(paths)

Loads a `CanvasPath` exported from `exportPaths()` onto the canvas.

The [CanvasPath](/api/interfaces/canvaspath/) type is an array of strokes.

### getSketchingTime()

Returns a Promise resolving the time the user spent sketching on the canvas. Considers only the time when strokes were made or erased.
