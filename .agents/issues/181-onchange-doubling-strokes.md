# Issue #181: onChange keeps doubling up the strokes

**GitHub:** https://github.com/vinothpandian/react-sketch-canvas/issues/181
**Created:** 2024-12-23
**Labels:** None
**Type:** Bug

## Description

When using the `onChange` callback in a multi-user whiteboard application, the strokes are being duplicated. The onChange event appears to be firing multiple times or the paths are being doubled.

## Steps to Reproduce

1. Go to a page with ReactSketchCanvas using onChange callback
2. Open browser console
3. Draw a few lines on the canvas
4. Observe that strokes are being doubled up in the onChange output

## Expected Behavior

The onChange callback should return the current sketch paths without duplication.

## Context

This issue was discovered while developing a collaborative whiteboard for a multi-user application. The doubling of strokes creates synchronization problems in real-time collaborative scenarios.
