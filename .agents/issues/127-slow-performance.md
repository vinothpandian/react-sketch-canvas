# Issue #127: Slow performance

**GitHub:** https://github.com/vinothpandian/react-sketch-canvas/issues/127
**Created:** 2023-07-12
**Labels:** None
**Type:** Bug / Performance

## Description

After writing a few lines on Android devices, the canvas becomes slow and laggy. Performance degrades significantly with continued use.

## Context

The reporter wants to use the library for writing a full A4 page on Android tablets, but performance issues prevent this use case.

## Attempted Solutions

- Using React.memo - no improvement observed

## Sample Code

```jsx
import * as React from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";

const width = window.innerWidth;
const height = window.innerHeight;

const styles = {
  border: "0.0625rem solid #9c9c9c",
  borderRadius: "0.25rem",
  width: width,
  height: height / 4,
  backgroundColor: "#343434"
};

export const DrawingCanvas = () => {
  return (
    <ReactSketchCanvas
      style={styles}
      strokeWidth={3}
      allowOnlyPointerType="pen"
      strokeColor="#343434"
    />
  );
};
```

## Related Issues

- #163 - On pointer move is recording coordinates too frequent (throttling optimization)
- #56 - Optimize data structure and code while keeping backward compatibility
