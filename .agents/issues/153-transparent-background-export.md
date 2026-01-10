# Issue #153: Exported image's background color is always transparent

**GitHub:** https://github.com/vinothpandian/react-sketch-canvas/issues/153
**Created:** 2024-02-20
**Labels:** None
**Type:** Bug

## Description

Even with `canvasColor="#FFFFFFFF"` set in props, the exported image has a transparent background instead of the specified color.

## Root Cause Analysis (from reporter)

There appears to be a conflict between `canvasColor` and `backgroundImage` props:
- When `backgroundImage` is updated, the background color becomes transparent
- After that, any change to `canvasColor` won't take effect

## Expected Behavior

The exported image should respect the `canvasColor` prop when `exportWithBackgroundImage` is false.

## Related Issues

- #155 - Exported image with custom background isn't working as expected
- #137 - Canvas exports broken background image
- #105 - exportWithBackgroundImage does not work when background image is set using datauri
