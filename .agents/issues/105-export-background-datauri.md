# Issue #105: exportWithBackgroundImage does not work when background image is set using datauri

**GitHub:** https://github.com/vinothpandian/react-sketch-canvas/issues/105
**Created:** 2022-12-29
**Labels:** bug, good first issue
**Type:** Bug

## Description

When adding a background image from a dataURI and then attempting to export the image **without** the background image (by unchecking `exportWithBackgroundImage`), the image is still exported **with** the background image.

**Note:** The SVG export works correctly without the background image.

## Steps to Reproduce

1. Go to the demo
2. Add a background image from a dataURI
3. Add some strokes
4. Uncheck `exportWithBackgroundImage`
5. Export Image

## Actual Behavior

Image is exported **with** the background image included.

## Expected Behavior

Image should be exported **without** the background image when `exportWithBackgroundImage` is false.

## Environment

- OS: Mac OS
- Browser: Chrome

## Related Issues

- #155 - Exported image with custom background isn't working as expected
- #153 - Exported image's background color is always transparent
- #137 - Canvas exports broken background image
