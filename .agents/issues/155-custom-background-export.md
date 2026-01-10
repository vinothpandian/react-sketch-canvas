# Issue #155: Exported image with custom background isn't working as expected

**GitHub:** https://github.com/vinothpandian/react-sketch-canvas/issues/155
**Created:** 2024-04-08
**Labels:** None
**Type:** Bug

## Description

When using a custom background image in the canvas, the exported image is:
- Blurred in the area of the custom background image
- Contains extra/unexpected SVG elements

## Steps to Reproduce

See the [Sandbox link](https://codesandbox.io/p/sandbox/serene-shannon-hs35gs?file=%2FApp.tsx) in the issue.

## Expected Behavior

Exported image should contain the drawn strokes and custom background image cleanly in one frame, without blurring or artifacts.

## Environment

- OS: macOS 10.15.7
- Browser: Chrome
- Version: 123.0.6312.107 (Official Build) (x86_64)

## Related Issues

- #153 - Exported image's background color is always transparent
- #137 - Canvas exports broken background image
- #105 - exportWithBackgroundImage does not work when background image is set using datauri
