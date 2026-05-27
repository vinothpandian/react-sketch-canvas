---
editUrl: false
next: false
prev: false
title: "CanvasProps"
---

Defined in: [Canvas/types.ts:31](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L31)

Props for the low-level [Canvas](/api/variables/canvas/) component.

## Remarks

These props are primarily useful for composing a custom state manager around
the low-level SVG canvas. Application code normally uses
[ReactSketchCanvasProps](/api/interfaces/reactsketchcanvasprops/).

## Properties

### allowOnlyPointerType

> **allowOnlyPointerType**: [`AllowOnlyPointerType`](/api/type-aliases/allowonlypointertype/)

Defined in: [Canvas/types.ts:84](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L84)

Pointer device class allowed to draw on the canvas.

#### Remarks

Other pointer devices can still interact with the page, but their drawing
events are ignored by the canvas.

#### Default Value

`"all"`

***

### backgroundImage

> **backgroundImage**: `string`

Defined in: [Canvas/types.ts:100](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L100)

Background image shown behind all strokes.

#### Remarks

Accepts any SVG `<image>` `href` value, including a URL or data URI. When
exporting with the background image enabled, remote images must allow
cross-origin access.

The value is treated as trusted: it is loaded directly into an SVG
`<image>` element and, for SVG data URIs, parsed with `DOMParser` to read
its viewBox. Do not pass attacker-controlled strings here without
validating them first.

#### Default Value

`""`

***

### canvasColor

> **canvasColor**: `string`

Defined in: [Canvas/types.ts:113](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L113)

Background color shown when no background image is configured.

#### Remarks

`canvasColor` is also painted underneath every JPEG export, even when a
background image is included, because JPEG cannot represent transparent
pixels. With `preserveBackgroundImageAspectRatio="meet"` (or any value
that letterboxes the image), the letterbox regions of a JPEG export will
be filled with `canvasColor`.

#### Default Value

`"white"`

***

### className?

> `optional` **className?**: `string`

Defined in: [Canvas/types.ts:119](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L119)

CSS class name applied to the outer canvas wrapper.

#### Default Value

`"react-sketch-canvas"`

***

### exportWithBackgroundImage

> **exportWithBackgroundImage**: `boolean`

Defined in: [Canvas/types.ts:129](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L129)

Whether exported images and SVGs include `backgroundImage`.

#### Remarks

Set this to `false` when the background image is only a drawing guide and
should not be part of exported output.

#### Default Value

```ts
false
```

***

### height

> **height**: `string`

Defined in: [Canvas/types.ts:139](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L139)

CSS height of the canvas wrapper.

#### Remarks

Accepts any valid CSS height value, such as `"400px"`, `"60vh"`, or
`"100%"`.

#### Default Value

`"100%"`

***

### id?

> `optional` **id?**: `string`

Defined in: [Canvas/types.ts:151](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L151)

DOM id applied to the rendered SVG canvas.

#### Remarks

Internal SVG definitions such as masks and background patterns are isolated
per canvas instance, so multiple canvases can use the default id without
sharing those internal references. Provide a unique id when application code
needs to select or label a specific canvas element.

#### Default Value

`"react-sketch-canvas"`

***

### isDrawing

> **isDrawing**: `boolean`

Defined in: [Canvas/types.ts:45](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L45)

Whether a pointer stroke is currently active.

#### Remarks

While this is `true`, pointer movement is forwarded to `onPointerMove`.

***

### onPointerDown

> **onPointerDown**: (`point`, `isEraser?`) => `void`

Defined in: [Canvas/types.ts:57](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L57)

Called when the user starts a stroke.

#### Parameters

##### point

[`Point`](/api/interfaces/point/)

Canvas-relative point where the stroke starts.

##### isEraser?

`boolean`

Whether the pointer should create an eraser stroke.

#### Returns

`void`

Nothing.

#### Remarks

The callback receives the pointer coordinate normalized to the canvas and
an eraser flag when a pen eraser button is detected.

***

### onPointerMove

> **onPointerMove**: (`point`) => `void`

Defined in: [Canvas/types.ts:64](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L64)

Called when the active pointer moves while drawing.

#### Parameters

##### point

[`Point`](/api/interfaces/point/)

Canvas-relative point for the current pointer position.

#### Returns

`void`

Nothing.

***

### onPointerUp

> **onPointerUp**: () => `void`

Defined in: [Canvas/types.ts:74](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L74)

Called when the active stroke ends.

#### Returns

`void`

Nothing.

#### Remarks

`Canvas` listens for `pointerup` on the document so a stroke can finish
even when the pointer is released outside the canvas element.

***

### paths

> **paths**: [`CanvasPath`](/api/interfaces/canvaspath/)[]

Defined in: [Canvas/types.ts:38](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L38)

Paths rendered on the SVG canvas.

#### Remarks

`Canvas` is controlled. Pass the complete path list for each render.

***

### preserveBackgroundImageAspectRatio?

> `optional` **preserveBackgroundImageAspectRatio?**: `string`

Defined in: [Canvas/types.ts:161](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L161)

SVG `preserveAspectRatio` value used for `backgroundImage`.

#### Remarks

See the MDN reference for accepted values:
[https://developer.mozilla.org/docs/Web/SVG/Attribute/preserveAspectRatio](https://developer.mozilla.org/docs/Web/SVG/Attribute/preserveAspectRatio).

#### Default Value

`"none"`

***

### readOnly?

> `optional` **readOnly?**: `boolean`

Defined in: [Canvas/types.ts:209](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L209)

Whether pointer drawing is disabled.

#### Remarks

Existing paths are still rendered and ref export methods still work.

#### Default Value

```ts
false
```

***

### style

> **style**: `CSSProperties`

Defined in: [Canvas/types.ts:173](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L173)

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

***

### svgStyle

> **svgStyle**: `CSSProperties`

Defined in: [Canvas/types.ts:179](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L179)

Inline styles applied to the internal SVG element.

#### Default Value

`{}`

***

### touchAction?

> `optional` **touchAction?**: `TouchAction`

Defined in: [Canvas/types.ts:223](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L223)

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

***

### width

> **width**: `string`

Defined in: [Canvas/types.ts:200](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L200)

CSS width of the canvas wrapper.

#### Remarks

Accepts any valid CSS width value, such as `"600px"`, `"100%"`, or
`"80vw"`.

#### Default Value

`"100%"`

***

### withViewBox?

> `optional` **withViewBox?**: `boolean`

Defined in: [Canvas/types.ts:190](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L190)

Whether the internal SVG should include a viewBox based on the latest
measured canvas size.

#### Remarks

Enable this when you need SVG output that scales predictably with the
rendered canvas dimensions.

#### Default Value

```ts
false
```
