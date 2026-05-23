---
editUrl: false
next: false
prev: false
title: "EraserMode"
---

> **EraserMode** = `"mask"` \| `"stroke"`

Defined in: [ReactSketchCanvas/types.ts:14](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/ReactSketchCanvas/types.ts#L14)

Eraser behavior used for pointer erasing.

## Remarks

`"mask"` stores eraser gestures as mask paths, preserving the historical
export and undo/redo behavior. `"stroke"` removes whole drawing strokes
touched by the eraser gesture instead of storing the gesture path.
