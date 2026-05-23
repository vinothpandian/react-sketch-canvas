---
editUrl: false
next: false
prev: false
title: "CanvasRef"
---

Defined in: [Canvas/types.ts:207](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L207)

Imperative ref API exposed by the low-level [Canvas](/api/variables/canvas/) component.

## Extended by

- [`ReactSketchCanvasRef`](/api/interfaces/reactsketchcanvasref/)

## Properties

### exportImage

> **exportImage**: (`imageType`, `options?`) => `Promise`\<`string`\>

Defined in: [Canvas/types.ts:219](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L219)

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

***

### exportSvg

> **exportSvg**: () => `Promise`\<`string`\>

Defined in: [Canvas/types.ts:232](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/Canvas/types.ts#L232)

Export the current canvas as SVG markup.

#### Returns

`Promise`\<`string`\>

Promise that resolves to SVG markup.

#### Remarks

The returned string contains the cloned SVG element after export-specific
background handling has been applied.
