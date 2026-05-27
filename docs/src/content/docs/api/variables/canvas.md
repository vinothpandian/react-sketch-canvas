---
editUrl: false
next: false
prev: false
title: "Canvas"
---

> `const` **Canvas**: `ForwardRefExoticComponent`\<[`CanvasProps`](/api/interfaces/canvasprops/) & `RefAttributes`\<[`CanvasRef`](/api/interfaces/canvasref/)\>\>

Defined in: [Canvas/index.tsx:24](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/index.tsx#L24)

Low-level SVG drawing canvas.

## Remarks

`Canvas` renders the SVG surface, handles pointer normalization, and exposes
export methods through its forwarded ref. Most consumers should use
`ReactSketchCanvas` instead, which manages drawing state and undo/redo.

Use `Canvas` directly when you need full control over path state, custom
history behavior, or integration with an external drawing state machine.

## Param

Rendering, pointer, and export options for the canvas.

## Param

Ref exposing [CanvasRef](/api/interfaces/canvasref/) export methods.

## Returns

The low-level canvas element.
