---
editUrl: false
next: false
prev: false
title: "ReactSketchCanvasProps"
---

Defined in: [ReactSketchCanvas/types.ts:27](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/ReactSketchCanvas/types.ts#L27)

Props for the stateful [ReactSketchCanvas](/api/variables/reactsketchcanvas/) component.

## Remarks

`ReactSketchCanvas` composes the low-level [CanvasProps](/api/interfaces/canvasprops/) with drawing
state management. You can pass sizing, styling, background, pointer, and
export props from `CanvasProps`; path state and pointer callbacks are managed
internally by the component.

## Extends

- `Partial`\<`Omit`\<[`CanvasProps`](/api/interfaces/canvasprops/), `"paths"` \| `"isDrawing"` \| `"onPointerDown"` \| `"onPointerMove"` \| `"onPointerUp"`\>\>

## Properties

### allowOnlyPointerType?

> `optional` **allowOnlyPointerType?**: [`AllowOnlyPointerType`](/api/type-aliases/allowonlypointertype/)

Defined in: [Canvas/types.ts:84](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L84)

Pointer device class allowed to draw on the canvas.

#### Remarks

Other pointer devices can still interact with the page, but their drawing
events are ignored by the canvas.

#### Default Value

`"all"`

#### Inherited from

[`CanvasProps`](/api/interfaces/canvasprops/).[`allowOnlyPointerType`](/api/interfaces/canvasprops/#allowonlypointertype)

***

### backgroundImage?

> `optional` **backgroundImage?**: `string`

Defined in: [Canvas/types.ts:95](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L95)

Background image shown behind all strokes.

#### Remarks

Accepts any SVG `<image>` `href` value, including a URL or data URI. When
exporting with the background image enabled, remote images must allow
cross-origin access.

#### Default Value

`""`

#### Inherited from

[`CanvasProps`](/api/interfaces/canvasprops/).[`backgroundImage`](/api/interfaces/canvasprops/#backgroundimage)

***

### canvasColor?

> `optional` **canvasColor?**: `string`

Defined in: [Canvas/types.ts:105](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L105)

Background color shown when no background image is configured.

#### Remarks

This color is also used behind JPEG exports when the background image is
not included.

#### Default Value

`"white"`

#### Inherited from

[`CanvasProps`](/api/interfaces/canvasprops/).[`canvasColor`](/api/interfaces/canvasprops/#canvascolor)

***

### className?

> `optional` **className?**: `string`

Defined in: [Canvas/types.ts:111](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L111)

CSS class name applied to the outer canvas wrapper.

#### Default Value

`"react-sketch-canvas"`

#### Inherited from

[`CanvasProps`](/api/interfaces/canvasprops/).[`className`](/api/interfaces/canvasprops/#classname)

***

### eraserMode?

> `optional` **eraserMode?**: [`EraserMode`](/api/type-aliases/erasermode/)

Defined in: [ReactSketchCanvas/types.ts:54](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/ReactSketchCanvas/types.ts#L54)

Eraser behavior used when `eraseMode(true)` is active or a pen eraser
button is detected.

#### Remarks

Use `"mask"` to preserve eraser gestures as SVG mask paths. Use `"stroke"`
when erasing should delete whole drawing strokes touched by the eraser.

#### Default Value

`"mask"`

***

### eraserWidth?

> `optional` **eraserWidth?**: `number`

Defined in: [ReactSketchCanvas/types.ts:43](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/ReactSketchCanvas/types.ts#L43)

Width of eraser strokes in pixels.

#### Remarks

This width is used when `eraseMode(true)` is active or when a pen eraser
button is detected.

#### Default Value

`8`

***

### exportWithBackgroundImage?

> `optional` **exportWithBackgroundImage?**: `boolean`

Defined in: [Canvas/types.ts:121](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L121)

Whether exported images and SVGs include `backgroundImage`.

#### Remarks

Set this to `false` when the background image is only a drawing guide and
should not be part of exported output.

#### Default Value

```ts
false
```

#### Inherited from

[`CanvasProps`](/api/interfaces/canvasprops/).[`exportWithBackgroundImage`](/api/interfaces/canvasprops/#exportwithbackgroundimage)

***

### height?

> `optional` **height?**: `string`

Defined in: [Canvas/types.ts:131](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L131)

CSS height of the canvas wrapper.

#### Remarks

Accepts any valid CSS height value, such as `"400px"`, `"60vh"`, or
`"100%"`.

#### Default Value

`"100%"`

#### Inherited from

[`CanvasProps`](/api/interfaces/canvasprops/).[`height`](/api/interfaces/canvasprops/#height)

***

### id?

> `optional` **id?**: `string`

Defined in: [Canvas/types.ts:143](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L143)

DOM id applied to the rendered SVG canvas.

#### Remarks

Internal SVG definitions such as masks and background patterns are isolated
per canvas instance, so multiple canvases can use the default id without
sharing those internal references. Provide a unique id when application code
needs to select or label a specific canvas element.

#### Default Value

`"react-sketch-canvas"`

#### Inherited from

[`CanvasProps`](/api/interfaces/canvasprops/).[`id`](/api/interfaces/canvasprops/#id)

***

### onChange?

> `optional` **onChange?**: (`updatedPaths`) => `void`

Defined in: [ReactSketchCanvas/types.ts:65](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/ReactSketchCanvas/types.ts#L65)

Called whenever the rendered path list changes.

#### Parameters

##### updatedPaths

[`CanvasPath`](/api/interfaces/canvaspath/)[]

Complete current path list.

#### Returns

`void`

Nothing.

#### Remarks

Use this callback to persist drawings as the user sketches. The callback is
invoked after strokes, undo, redo, clear, reset, and `loadPaths` updates.

***

### onStroke?

> `optional` **onStroke?**: (`path`, `isEraser`) => `void`

Defined in: [ReactSketchCanvas/types.ts:78](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/ReactSketchCanvas/types.ts#L78)

Called when the user completes a stroke.

#### Parameters

##### path

[`CanvasPath`](/api/interfaces/canvaspath/)

Stroke that was just completed.

##### isEraser

`boolean`

Whether the completed stroke erased existing content.

#### Returns

`void`

Nothing.

#### Remarks

This callback fires for both drawing and erasing strokes. It is intended
for event-style handling; use `onChange` when you need the complete drawing
state.

***

### preserveBackgroundImageAspectRatio?

> `optional` **preserveBackgroundImageAspectRatio?**: `string`

Defined in: [Canvas/types.ts:153](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L153)

SVG `preserveAspectRatio` value used for `backgroundImage`.

#### Remarks

See the MDN reference for accepted values:
[https://developer.mozilla.org/docs/Web/SVG/Attribute/preserveAspectRatio](https://developer.mozilla.org/docs/Web/SVG/Attribute/preserveAspectRatio).

#### Default Value

`"none"`

#### Inherited from

[`CanvasProps`](/api/interfaces/canvasprops/).[`preserveBackgroundImageAspectRatio`](/api/interfaces/canvasprops/#preservebackgroundimageaspectratio)

***

### readOnly?

> `optional` **readOnly?**: `boolean`

Defined in: [Canvas/types.ts:201](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L201)

Whether pointer drawing is disabled.

#### Remarks

Existing paths are still rendered and ref export methods still work.

#### Default Value

```ts
false
```

#### Inherited from

[`CanvasProps`](/api/interfaces/canvasprops/).[`readOnly`](/api/interfaces/canvasprops/#readonly)

***

### strokeColor?

> `optional` **strokeColor?**: `string`

Defined in: [ReactSketchCanvas/types.ts:88](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/ReactSketchCanvas/types.ts#L88)

Color used for drawing strokes.

#### Remarks

Accepts any SVG stroke color value, including named colors, hex colors,
RGB values, and CSS variables.

#### Default Value

```ts
"red"
```

***

### strokeWidth?

> `optional` **strokeWidth?**: `number`

Defined in: [ReactSketchCanvas/types.ts:97](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/ReactSketchCanvas/types.ts#L97)

Width of drawing strokes in pixels.

#### Remarks

Eraser strokes use `eraserWidth` instead.

#### Default Value

`4`

***

### style?

> `optional` **style?**: `CSSProperties`

Defined in: [Canvas/types.ts:165](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L165)

Inline styles applied to the outer canvas wrapper.

#### Remarks

The component sets `userSelect: "none"` to avoid browser selection
highlights while drawing. It sets `touchAction: "none"` for touch drawing,
and `touchAction: "pan-x pan-y pinch-zoom"` in pen-only mode so touch can
still scroll parent containers.

#### Default Value

```ts
The package default canvas border style.
```

#### Inherited from

[`CanvasProps`](/api/interfaces/canvasprops/).[`style`](/api/interfaces/canvasprops/#style)

***

### svgStyle?

> `optional` **svgStyle?**: `CSSProperties`

Defined in: [Canvas/types.ts:171](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L171)

Inline styles applied to the internal SVG element.

#### Default Value

`{}`

#### Inherited from

[`CanvasProps`](/api/interfaces/canvasprops/).[`svgStyle`](/api/interfaces/canvasprops/#svgstyle)

***

### touchAction?

> `optional` **touchAction?**: `TouchAction`

Defined in: [Canvas/types.ts:215](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L215)

CSS `touch-action` applied to the canvas wrapper.

#### Remarks

The default is `"none"` when the canvas accepts touch drawing, so single
finger gestures draw rather than scroll. Override this when you need the
surrounding page to remain scrollable; for example, set `"pan-y"` to let
users scroll vertically while still drawing with one finger. The browser
will start a native pan only when the gesture matches the configured
axis, so single-finger drawing continues to work.

#### Default Value

`"none"` for touch-drawing modes; `"pan-x pan-y pinch-zoom"` for pen / mouse only modes.

#### Inherited from

[`CanvasProps`](/api/interfaces/canvasprops/).[`touchAction`](/api/interfaces/canvasprops/#touchaction)

***

### width?

> `optional` **width?**: `string`

Defined in: [Canvas/types.ts:192](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L192)

CSS width of the canvas wrapper.

#### Remarks

Accepts any valid CSS width value, such as `"600px"`, `"100%"`, or
`"80vw"`.

#### Default Value

`"100%"`

#### Inherited from

[`CanvasProps`](/api/interfaces/canvasprops/).[`width`](/api/interfaces/canvasprops/#width)

***

### withTimestamp?

> `optional` **withTimestamp?**: `boolean`

Defined in: [ReactSketchCanvas/types.ts:108](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/ReactSketchCanvas/types.ts#L108)

Whether strokes should include start and end timestamps.

#### Remarks

Enable this before drawing if you want `CanvasPath.startTimestamp`,
`CanvasPath.endTimestamp`, and `getSketchingTime()` to report active
drawing time.

#### Default Value

```ts
false
```

***

### withViewBox?

> `optional` **withViewBox?**: `boolean`

Defined in: [Canvas/types.ts:182](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L182)

Whether the internal SVG should include a viewBox based on the latest
measured canvas size.

#### Remarks

Enable this when you need SVG output that scales predictably with the
rendered canvas dimensions.

#### Default Value

```ts
false
```

#### Inherited from

[`CanvasProps`](/api/interfaces/canvasprops/).[`withViewBox`](/api/interfaces/canvasprops/#withviewbox)
