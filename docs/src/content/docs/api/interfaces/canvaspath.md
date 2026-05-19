---
editUrl: false
next: false
prev: false
title: "CanvasPath"
---

Defined in: [types/canvas.ts:74](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/types/canvas.ts#L74)

A single stroke recorded by the sketch canvas.

## Remarks

`CanvasPath` is the persistence format returned by
[ReactSketchCanvasRef.exportPaths](/api/interfaces/reactsketchcanvasref/#exportpaths) and accepted by
[ReactSketchCanvasRef.loadPaths](/api/interfaces/reactsketchcanvasref/#loadpaths). Store this object if you want to save
a drawing and replay it later.

`drawMode` decides whether the stroke paints (`true`) or erases (`false`).
Eraser strokes are stored as paths so exports and undo/redo can preserve the
same visual result.

## Properties

### drawMode

> `readonly` **drawMode**: `boolean`

Defined in: [types/canvas.ts:98](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/types/canvas.ts#L98)

Whether the stroke draws color (`true`) or erases existing strokes
(`false`).

***

### endTimestamp?

> `readonly` `optional` **endTimestamp?**: `number`

Defined in: [types/canvas.ts:114](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/types/canvas.ts#L114)

Timestamp captured when the stroke ends, in milliseconds since the Unix
epoch.

#### Remarks

This is only present when `withTimestamp` is enabled.

***

### paths

> `readonly` **paths**: [`Point`](/api/interfaces/point/)[]

Defined in: [types/canvas.ts:81](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/types/canvas.ts#L81)

Ordered points that make up this stroke.

#### Remarks

A stroke can contain a single point, which is rendered as a dot.

***

### startTimestamp?

> `readonly` `optional` **startTimestamp?**: `number`

Defined in: [types/canvas.ts:106](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/types/canvas.ts#L106)

Timestamp captured when the stroke starts, in milliseconds since the Unix
epoch.

#### Remarks

This is only present when `withTimestamp` is enabled.

***

### strokeColor

> `readonly` **strokeColor**: `string`

Defined in: [types/canvas.ts:93](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/types/canvas.ts#L93)

Stroke color used when `drawMode` is `true`.

#### Remarks

Eraser paths are stored with an internal mask color, but consumers usually
only need to preserve the value returned by `exportPaths`.

***

### strokeWidth

> `readonly` **strokeWidth**: `number`

Defined in: [types/canvas.ts:85](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/types/canvas.ts#L85)

Stroke width in pixels.
