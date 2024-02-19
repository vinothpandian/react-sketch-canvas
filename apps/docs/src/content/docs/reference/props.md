---
title: Props
description: List of props for the `ReactSketchCanvas` component
sidebar:
  order: 1
---

## width
`Default value: 100%`

Canvas width. You can specify the value in em, rem or px. It fills the parent element space if value is not set.

## height
`Default value: 100%`

Canvas height. You can specify the value in em, rem or px. It fills the parent element space if value is not set.

## id
`Default value: "react-sketch-canvas"`

Unique identifier for an SVG canvas. Supports multiple canvases on a single page.

## className

Class name for CSS selectors.

## strokeColor
`Default value: black`

Color of the pen stroke.

## canvasColor
`Default value: white`

Background color of the canvas. Accepts HTML color values.

## backgroundImage

Sets the SVG background with an image URL.

## exportWithBackgroundImage
`Default value: false`

Determines whether to keep the background image on image/SVG export. If set to false, `canvasColor` will be used as the background.

## preserveBackgroundImageAspectRatio
`Default value: none`

Sets the aspect ratio of the background image. Refer to [MDN docs](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio) for possible values.

## strokeWidth
`Default value: 4`

Size of the pen stroke.

## eraserWidth
`Default value: 8`

Size of the eraser.

## allowOnlyPointerType
`Default value: all`

Allowed pointer types: `all`, `mouse`, `pen`, `touch`.

## onChange

Callback function that returns the current sketch path in `CanvasPath` type on every path change.

## onStroke

Callback function that returns the last stroke path and whether it is an eraser stroke on every pointer up event.

## style
`Default value: false`

CSS-in-JS styling for the canvas.

## svgStyle

CSS-in-JS styling specifically for the SVG element.

You can setthe SVG background using CSS [background](https://developer.mozilla.org/en-US/docs/Web/CSS/background) value

## withTimestamp
`Default value: false`

Adds timestamp to individual strokes for sketching time measurement.

## readOnly
`Default value: false`

Disables drawing on the canvas. Undo/redo, clear, and reset functionalities will still work.
