# Issue #128: Allow parent element to scroll with touch

**GitHub:** https://github.com/vinothpandian/react-sketch-canvas/issues/128
**Created:** 2023-07-13
**Labels:** None
**Type:** Feature Request

## Description

When ReactSketchCanvas is inside a scrollable container, the canvas component prevents touch events from reaching the parent element for scrolling.

## Current Behavior

With `allowOnlyPointerType='all'`, all touch events are consumed by the canvas for drawing, which is expected.

However, with `allowOnlyPointerType='pen'`, touch events that are not being used for drawing could potentially be passed through to allow scrolling the parent container.

## Desired Behavior

When `allowOnlyPointerType` is set to 'pen', touch and mouse events should be allowed to propagate to the parent element for scrolling purposes.

## Related Issues

- #146 - Require 2 finger horizontal scroll for Mobile use
