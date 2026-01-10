# Issue #169: Preview for the pointer with strokeWidth

**GitHub:** https://github.com/vinothpandian/react-sketch-canvas/issues/169
**Created:** 2024-08-27
**Labels:** None
**Type:** Feature Request

## Description

Users would like to see a visual preview of where the cursor is positioned and the current stroke width while drawing. This would enhance the user experience by providing visual feedback before making a stroke.

## Desired Behavior

Display a cursor follower that shows:
- Current cursor position
- Visual representation of the stroke width (circle matching pen size)

## User-Provided Workaround

The reporter implemented a custom hook (`useStrokePreview`) that creates a div element following the cursor position. This shows the stroke width as a semi-transparent circle.

Key implementation details from the workaround:
- Uses `mousemove` and `pointermove` event listeners
- Positions a circular div at the cursor location
- Sets the circle size to match `strokeWidth`
- Requires wrapping the canvas in a container with `position: relative`
- Sets canvas `cursor: "none"` to hide the default cursor

## Considerations

The workaround may not fully support all input devices (tablets, mobile phones) as noted by the reporter.
