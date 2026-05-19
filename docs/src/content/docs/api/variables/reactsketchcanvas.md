---
editUrl: false
next: false
prev: false
title: "ReactSketchCanvas"
---

> `const` **ReactSketchCanvas**: `ReactSketchCanvasComponent`

Defined in: [ReactSketchCanvas/index.tsx:37](https://github.com/vinothpandian/blob/7c5b4d644c5810dcd5234a943bda7bb63012b362/packages/src/ReactSketchCanvas/index.tsx#L37)

Stateful sketch canvas component for freehand SVG drawing.

## Remarks

`ReactSketchCanvas` manages paths, draw/erase mode, undo/redo history,
timestamp capture, and public imperative methods. It is the primary component
intended for application use.

Use a ref when you need to export images or paths, toggle erasing from a
toolbar, or control history from parent UI.

## Param

Public drawing, styling, export, and callback options.

## Param

Ref exposing [ReactSketchCanvasRef](/api/interfaces/reactsketchcanvasref/) methods.

## Returns

The sketch canvas component.
