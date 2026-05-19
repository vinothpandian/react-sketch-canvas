---
editUrl: false
next: false
prev: false
title: "ExportImageType"
---

> **ExportImageType** = `"jpeg"` \| `"png"`

Defined in: [types/canvas.ts:11](https://github.com/vinothpandian/blob/7c5b4d644c5810dcd5234a943bda7bb63012b362/packages/src/types/canvas.ts#L11)

Raster image format used by [ReactSketchCanvasRef.exportImage](/api/interfaces/reactsketchcanvasref/#exportimage) and
[CanvasRef.exportImage](/api/interfaces/canvasref/#exportimage).

## Remarks

Use `"png"` when you need transparency. Use `"jpeg"` for smaller files or
when the exported image should always include a solid background color.
