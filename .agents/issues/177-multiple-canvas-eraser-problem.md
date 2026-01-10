# Issue #177: Multiple Canvas Eraser Problem

**GitHub:** https://github.com/vinothpandian/react-sketch-canvas/issues/177
**Created:** 2024-09-24
**Labels:** None
**Type:** Bug

## Description

When multiple canvases exist on a page, using the eraser on one canvas causes the same erasing action to happen on all other canvases. Drawing works independently, but erasing is shared across all canvas instances.

## Steps to Reproduce

1. Add multiple ReactSketchCanvas instances on a single page
2. Draw something independently on each canvas
3. Try to erase on one canvas
4. Observe that drawings on all other canvases are also being erased

## Expected Behavior

Erasing should only affect the canvas being interacted with. Each canvas instance should operate independently.

## Environment

- OS: Linux
- Browser: Chrome
- Version: 128.0.6613.119 (Official Build) (64-bit)

## Evidence

Video demonstration available in the GitHub issue.
