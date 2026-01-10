# Issue #142: Abnormal stroke after exporting SVG and cleaning: the eraser trace cannot be removed

**GitHub:** https://github.com/vinothpandian/react-sketch-canvas/issues/142
**Created:** 2023-10-02
**Labels:** None
**Type:** Bug

## Description

After exporting as SVG, the drawing function behaves abnormally. The brush cannot cover areas that were previously erased (before the SVG export). The eraser traces remain visible even after clearing/resetting the canvas.

**Important:** This issue does NOT occur when exporting as an image - only with SVG export.

## Steps to Reproduce

1. Draw freely and use the eraser to remove some traces
2. Export as SVG (e.g., using the export button)
3. Clear/reset the entire canvas
4. Use the brush to draw again, especially touching areas where the eraser was used before
5. Observe that the previous eraser traces are still visible

## Expected Behavior

After clearing/resetting the canvas and drawing again, there should be no visible traces of previous eraser strokes.

## Workaround

Tapping the screen with the eraser after the export restores normal functionality.

## Environment

- OS: Mac Pro M1
- Browser: Chrome

## Additional Context

The reporter also noted a related bug where rapidly double-clicking and then clicking again while using the eraser causes all content to be removed when the canvas has percentage-based dimensions (width: 100%, height: 100%) instead of fixed pixel values.
