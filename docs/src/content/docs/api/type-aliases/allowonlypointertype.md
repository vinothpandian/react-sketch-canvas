---
editUrl: false
next: false
prev: false
title: "AllowOnlyPointerType"
---

> **AllowOnlyPointerType** = `"all"` \| `"pen"` \| `"mouse"` \| `"touch"`

Defined in: [Canvas/types.ts:19](https://github.com/vinothpandian/blob/7c5b4d644c5810dcd5234a943bda7bb63012b362/packages/src/Canvas/types.ts#L19)

Pointer device class accepted by the drawing surface.

## Remarks

Use `"all"` to accept mouse, pen, and touch input. Use a specific pointer
type when the canvas should ignore other input devices, for example a
pen-only signing flow.
