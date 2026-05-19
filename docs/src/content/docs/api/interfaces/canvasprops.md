---
editUrl: false
next: false
prev: false
title: "CanvasProps"
---

Defined in: [Canvas/types.ts:31](https://github.com/vinothpandian/blob/7c5b4d644c5810dcd5234a943bda7bb63012b362/packages/src/Canvas/types.ts#L31)

Props for the low-level [Canvas](/api/variables/canvas/) component.

## Remarks

These props are primarily useful for composing a custom state manager around
the low-level SVG canvas. Application code normally uses
[ReactSketchCanvasProps](/api/interfaces/reactsketchcanvasprops/).

## Properties

### allowOnlyPointerType

> **allowOnlyPointerType**: [`AllowOnlyPointerType`](/api/type-aliases/allowonlypointertype/)

Defined in: [Canvas/types.ts:84](https://github.com/vinothpandian/blob/7c5b4d644c5810dcd5234a943bda7bb63012b362/packages/src/Canvas/types.ts#L84)

Pointer device class allowed to draw on the canvas.

#### Remarks

Other pointer devices can still interact with the page, but their drawing
events are ignored by the canvas.

#### Default Value

`"all"`

***

### backgroundImage

> **backgroundImage**: `string`

Defined in: [Canvas/types.ts:95](https://github.com/vinothpandian/blob/7c5b4d644c5810dcd5234a943bda7bb63012b362/packages/src/Canvas/types.ts#L95)

Background image shown behind all strokes.

#### Remarks

Accepts any SVG `<image>` `href` value, including a URL or data URI. When
exporting with the background image enabled, remote images must allow
cross-origin access.

#### Default Value

`""`

***

### canvasColor

> **canvasColor**: `string`

Defined in: [Canvas/types.ts:105](https://github.com/vinothpandian/blob/7c5b4d644c5810dcd5234a943bda7bb63012b362/packages/src/Canvas/types.ts#L105)

Background color shown when no background image is configured.

#### Remarks

This color is also used behind JPEG exports when the background image is
not included.

#### Default Value

`"white"`

***

### className?

> `optional` **className?**: `string`

Defined in: [Canvas/types.ts:111](https://github.com/vinothpandian/blob/7c5b4d644c5810dcd5234a943bda7bb63012b362/packages/src/Canvas/types.ts#L111)

CSS class name applied to the outer canvas wrapper.

#### Default Value

`"react-sketch-canvas"`

***

### exportWithBackgroundImage

> **exportWithBackgroundImage**: `boolean`

Defined in: [Canvas/types.ts:121](https://github.com/vinothpandian/blob/7c5b4d644c5810dcd5234a943bda7bb63012b362/packages/src/Canvas/types.ts#L121)

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

Defined in: [Canvas/types.ts:131](https://github.com/vinothpandian/blob/7c5b4d644c5810dcd5234a943bda7bb63012b362/packages/src/Canvas/types.ts#L131)

CSS height of the canvas wrapper.

#### Remarks

Accepts any valid CSS height value, such as `"400px"`, `"60vh"`, or
`"100%"`.

#### Default Value

`"100%"`

***

### id?

> `optional` **id?**: `string`

Defined in: [Canvas/types.ts:140](https://github.com/vinothpandian/blob/7c5b4d644c5810dcd5234a943bda7bb63012b362/packages/src/Canvas/types.ts#L140)

Base DOM id used for the SVG canvas and generated SVG definitions.

#### Remarks

Use a unique id when rendering more than one canvas on the same page.

#### Default Value

`"react-sketch-canvas"`

***

### isDrawing

> **isDrawing**: `boolean`

Defined in: [Canvas/types.ts:45](https://github.com/vinothpandian/blob/7c5b4d644c5810dcd5234a943bda7bb63012b362/packages/src/Canvas/types.ts#L45)

Whether a pointer stroke is currently active.

#### Remarks

While this is `true`, pointer movement is forwarded to `onPointerMove`.

***

### onPointerDown

> **onPointerDown**: (`point`, `isEraser?`) => `void`

Defined in: [Canvas/types.ts:57](https://github.com/vinothpandian/blob/7c5b4d644c5810dcd5234a943bda7bb63012b362/packages/src/Canvas/types.ts#L57)

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

Defined in: [Canvas/types.ts:64](https://github.com/vinothpandian/blob/7c5b4d644c5810dcd5234a943bda7bb63012b362/packages/src/Canvas/types.ts#L64)

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

Defined in: [Canvas/types.ts:74](https://github.com/vinothpandian/blob/7c5b4d644c5810dcd5234a943bda7bb63012b362/packages/src/Canvas/types.ts#L74)

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

Defined in: [Canvas/types.ts:38](https://github.com/vinothpandian/blob/7c5b4d644c5810dcd5234a943bda7bb63012b362/packages/src/Canvas/types.ts#L38)

Paths rendered on the SVG canvas.

#### Remarks

`Canvas` is controlled. Pass the complete path list for each render.

***

### preserveBackgroundImageAspectRatio?

> `optional` **preserveBackgroundImageAspectRatio?**: `string`

Defined in: [Canvas/types.ts:150](https://github.com/vinothpandian/blob/7c5b4d644c5810dcd5234a943bda7bb63012b362/packages/src/Canvas/types.ts#L150)

SVG `preserveAspectRatio` value used for `backgroundImage`.

#### Remarks

See the MDN reference for accepted values:
[https://developer.mozilla.org/docs/Web/SVG/Attribute/preserveAspectRatio](https://developer.mozilla.org/docs/Web/SVG/Attribute/preserveAspectRatio).

#### Default Value

`"none"`

***

### readOnly?

> `optional` **readOnly?**: `boolean`

Defined in: [Canvas/types.ts:196](https://github.com/vinothpandian/blob/7c5b4d644c5810dcd5234a943bda7bb63012b362/packages/src/Canvas/types.ts#L196)

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

Defined in: [Canvas/types.ts:160](https://github.com/vinothpandian/blob/7c5b4d644c5810dcd5234a943bda7bb63012b362/packages/src/Canvas/types.ts#L160)

Inline styles applied to the outer canvas wrapper.

#### Remarks

The component always sets `touchAction: "none"` to keep touch and pen
drawing from scrolling the page.

#### Default Value

```ts
The package default canvas border style.
```

***

### svgStyle

> **svgStyle**: `CSSProperties`

Defined in: [Canvas/types.ts:166](https://github.com/vinothpandian/blob/7c5b4d644c5810dcd5234a943bda7bb63012b362/packages/src/Canvas/types.ts#L166)

Inline styles applied to the internal SVG element.

#### Default Value

`{}`

***

### width

> **width**: `string`

Defined in: [Canvas/types.ts:187](https://github.com/vinothpandian/blob/7c5b4d644c5810dcd5234a943bda7bb63012b362/packages/src/Canvas/types.ts#L187)

CSS width of the canvas wrapper.

#### Remarks

Accepts any valid CSS width value, such as `"600px"`, `"100%"`, or
`"80vw"`.

#### Default Value

`"100%"`

***

### withViewBox?

> `optional` **withViewBox?**: `boolean`

Defined in: [Canvas/types.ts:177](https://github.com/vinothpandian/blob/7c5b4d644c5810dcd5234a943bda7bb63012b362/packages/src/Canvas/types.ts#L177)

Whether the internal SVG should include a viewBox based on the latest
measured canvas size.

#### Remarks

Enable this when you need SVG output that scales predictably with the
rendered canvas dimensions.

#### Default Value

```ts
false
```
