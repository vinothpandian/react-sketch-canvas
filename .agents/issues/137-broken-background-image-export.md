# Issue #137: Canvas exports broken background image

**GitHub:** https://github.com/vinothpandian/react-sketch-canvas/issues/137
**Created:** 2023-09-06
**Labels:** None
**Type:** Bug

## Description

When using and exporting with a background image, the exported result is corrupted/broken. The exported image does not match what is displayed while drawing.

## Evidence

Screenshots in the GitHub issue show:
- What the canvas looks like while drawing (correct)
- What the exported result looks like (broken/corrupted)

The issue includes a base64 encoded example of the broken export.

## Related Issues

- #155 - Exported image with custom background isn't working as expected
- #153 - Exported image's background color is always transparent
- #105 - exportWithBackgroundImage does not work when background image is set using datauri
