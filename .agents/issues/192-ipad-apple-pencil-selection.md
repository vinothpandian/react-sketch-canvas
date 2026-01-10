# Issue #192: iPad/Apple Pencil Selection Issue: Blue Highlight Appears During Drawing

**GitHub:** https://github.com/vinothpandian/react-sketch-canvas/issues/192
**Created:** 2025-11-24
**Labels:** None
**Type:** Bug

## Description

When using iPad with Apple Pencil (or similar stylus devices), a blue text selection highlight appears during drawing. This creates a poor user experience as the selection overlay interferes with the drawing interface.

## Steps to Reproduce

1. Open a page with `ReactSketchCanvas` component
2. Start drawing with Apple Pencil on iPad
3. While drawing, occasionally the pen may stop registering strokes
4. At this point, a blue selection highlight appears (similar to text selection)
5. This happens even when the pen is still in contact with the screen

## Expected Behavior

- No text selection should occur during drawing
- The canvas should handle all pen/stylus input without triggering browser selection behavior
- Drawing should work smoothly without visual interference from selection highlights

## Environment

- **Device:** iPad (tested with Apple Pencil)
- **Browser:** Safari and Chrome

## Related Issues

- #171 - Writing on the drawing board with the iPad pen will lose focus and a selection box will pop up
