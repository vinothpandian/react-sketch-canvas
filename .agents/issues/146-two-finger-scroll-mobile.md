# Issue #146: Require 2 finger horizontal scroll for Mobile use

**GitHub:** https://github.com/vinothpandian/react-sketch-canvas/issues/146
**Created:** 2024-02-11
**Labels:** None
**Type:** Feature Request

## Description

When the height of the canvas is more than the display height, users need the ability to scroll up or down with a two-finger gesture. Currently, attempting to scroll with two fingers creates zig-zag lines on the screen instead of scrolling.

## Current Behavior

Two-finger gestures on mobile are interpreted as drawing input, creating unwanted lines instead of scrolling the view.

## Expected Behavior

Two-finger gestures should trigger page/container scrolling rather than drawing.

## Related Issues

- #128 - Allow parent element to scroll with touch
