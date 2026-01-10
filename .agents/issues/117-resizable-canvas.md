# Issue #117: Add resizable canvas option

**GitHub:** https://github.com/vinothpandian/react-sketch-canvas/issues/117
**Created:** 2023-02-20
**Labels:** None
**Type:** Feature Request / Bug

## Description

The `withViewBox` property works to scale strokes up/down on resize. However, when adding a new stroke to the canvas after resizing, all existing strokes "shift" and get cut off.

## Current Behavior

1. Canvas has strokes
2. Canvas is resized (withViewBox scales existing strokes)
3. New stroke is added
4. All strokes shift and some get cut off

## Expected Behavior

After resizing the canvas, adding new strokes should not affect the position of existing strokes.
