---
editUrl: false
next: false
prev: false
title: "ExportImageOptions"
---

Defined in: [types/canvas.ts:23](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/types/canvas.ts#L23)

Size options for raster image exports.

## Remarks

When omitted, the exported image uses the rendered canvas element's current
width and height. Provide both values to export a fixed-size image regardless
of the on-screen canvas size.

## Properties

### height?

> `readonly` `optional` **height?**: `number`

Defined in: [types/canvas.ts:35](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/types/canvas.ts#L35)

Height of the exported image in pixels.

#### Default Value

```ts
The current rendered canvas height.
```

***

### width?

> `readonly` `optional` **width?**: `number`

Defined in: [types/canvas.ts:29](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/types/canvas.ts#L29)

Width of the exported image in pixels.

#### Default Value

```ts
The current rendered canvas width.
```
