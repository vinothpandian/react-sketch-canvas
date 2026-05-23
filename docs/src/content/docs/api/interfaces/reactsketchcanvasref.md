---
editUrl: false
next: false
prev: false
title: "ReactSketchCanvasRef"
---

Defined in: [ReactSketchCanvas/types.ts:97](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/ReactSketchCanvas/types.ts#L97)

Imperative ref API exposed by [ReactSketchCanvas](/api/variables/reactsketchcanvas/).

## Remarks

Use this ref to control drawing mode, history, exports, and path loading
from parent components.

## Extends

- [`CanvasRef`](/api/interfaces/canvasref/)

## Properties

### clearCanvas

> **clearCanvas**: () => `void`

Defined in: [ReactSketchCanvas/types.ts:119](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/ReactSketchCanvas/types.ts#L119)

Remove all paths from the canvas while preserving history.

#### Returns

`void`

Nothing.

#### Remarks

Users can still undo back to the previous drawing after `clearCanvas()`.
Use `resetCanvas()` when you want to remove paths and clear undo/redo
history.

***

### eraseMode

> **eraseMode**: (`erase`) => `void`

Defined in: [ReactSketchCanvas/types.ts:108](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/ReactSketchCanvas/types.ts#L108)

Switch between drawing and erasing.

#### Parameters

##### erase

`boolean`

Whether future pointer strokes should erase.

#### Returns

`void`

Nothing.

#### Remarks

Passing `true` enables erasing for future strokes. Passing `false` returns
to normal drawing mode. Existing paths are not changed.

***

### exportImage

> **exportImage**: (`imageType`, `options?`) => `Promise`\<`string`\>

Defined in: [Canvas/types.ts:216](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L216)

Export the current canvas as a raster image data URL.

#### Parameters

##### imageType

[`ExportImageType`](/api/type-aliases/exportimagetype/)

Image format to create.

##### options?

[`ExportImageOptions`](/api/interfaces/exportimageoptions/)

Optional export dimensions.

#### Returns

`Promise`\<`string`\>

Promise that resolves to a `data:image/*` URL.

#### Remarks

The output includes the currently rendered strokes. Background image export
depends on the `exportWithBackgroundImage` prop.

#### Inherited from

[`CanvasRef`](/api/interfaces/canvasref/).[`exportImage`](/api/interfaces/canvasref/#exportimage)

***

### exportPaths

> **exportPaths**: () => `Promise`\<[`CanvasPath`](/api/interfaces/canvaspath/)[]\>

Defined in: [ReactSketchCanvas/types.ts:148](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/ReactSketchCanvas/types.ts#L148)

Export the current path data.

#### Returns

`Promise`\<[`CanvasPath`](/api/interfaces/canvaspath/)[]\>

Promise that resolves with the current path list.

#### Remarks

The returned paths can be stored and later passed to `loadPaths()`.

***

### exportSvg

> **exportSvg**: () => `Promise`\<`string`\>

Defined in: [Canvas/types.ts:229](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L229)

Export the current canvas as SVG markup.

#### Returns

`Promise`\<`string`\>

Promise that resolves to SVG markup.

#### Remarks

The returned string contains the cloned SVG element after export-specific
background handling has been applied.

#### Inherited from

[`CanvasRef`](/api/interfaces/canvasref/).[`exportSvg`](/api/interfaces/canvasref/#exportsvg)

***

### getSketchingTime

> **getSketchingTime**: () => `Promise`\<`number`\>

Defined in: [ReactSketchCanvas/types.ts:169](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/ReactSketchCanvas/types.ts#L169)

Get the total active drawing time in milliseconds.

#### Returns

`Promise`\<`number`\>

Promise that resolves with the total sketching time.

#### Remarks

This only works when `withTimestamp` is enabled before drawing. Idle time
between strokes is not included.

***

### loadPaths

> **loadPaths**: (`paths`) => `void`

Defined in: [ReactSketchCanvas/types.ts:159](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/ReactSketchCanvas/types.ts#L159)

Append paths to the canvas.

#### Parameters

##### paths

[`CanvasPath`](/api/interfaces/canvaspath/)[]

Paths to append to the current drawing.

#### Returns

`void`

Nothing.

#### Remarks

Existing paths are preserved. The provided paths are appended to the end
of the current path list and become part of undo/redo history.

***

### redo

> **redo**: () => `void`

Defined in: [ReactSketchCanvas/types.ts:139](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/ReactSketchCanvas/types.ts#L139)

Restore the next history entry after an undo.

#### Returns

`void`

Nothing.

#### Remarks

Calling `redo()` when there is no later history entry leaves the canvas
unchanged.

***

### resetCanvas

> **resetCanvas**: () => `void`

Defined in: [ReactSketchCanvas/types.ts:179](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/ReactSketchCanvas/types.ts#L179)

Remove all paths and clear undo/redo history.

#### Returns

`void`

Nothing.

#### Remarks

Use `clearCanvas()` instead when the user should be able to undo the
clearing action.

***

### undo

> **undo**: () => `void`

Defined in: [ReactSketchCanvas/types.ts:129](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/ReactSketchCanvas/types.ts#L129)

Restore the previous history entry.

#### Returns

`void`

Nothing.

#### Remarks

Calling `undo()` when there is no earlier history entry leaves the canvas
unchanged.
