---
editUrl: false
next: false
prev: false
title: "ExportImageType"
---

> **ExportImageType** = `"jpeg"` \| `"png"`

Defined in: [types/canvas.ts:11](https://github.com/vinothpandian/react-sketch-canvas/blob/main/packages/react-sketch-canvas/src/types/canvas.ts#L11)

Raster image format used by [ReactSketchCanvasRef.exportImage](/api/interfaces/reactsketchcanvasref/#exportimage) and
[CanvasRef.exportImage](/api/interfaces/canvasref/#exportimage).

## Remarks

Use `"png"` when you need transparency. Use `"jpeg"` for smaller files or
when the exported image should always include a solid background color.
