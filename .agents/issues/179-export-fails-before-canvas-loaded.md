# Issue #179: exportImage(), exportSvg() fails with "Export function called before canvas loaded"

**GitHub:** https://github.com/vinothpandian/react-sketch-canvas/issues/179
**Created:** 2024-12-05
**Labels:** None
**Type:** Bug

## Description

`exportSvg()` and `exportImage()` sometimes throw with the error message "Export function called before canvas loaded" because `svgCanvas.current` is `null`.

## Root Cause Analysis

The issue is due to the usage of `createRef` which creates a new ref every time the component is rendered, causing the ref to be `null` at unexpected times.

## Location in Code

`packages/react-sketch-canvas/src/ReactSketchCanvas/index.tsx` (around line 50)

## Suggested Fix (from reporter)

Replace `createRef` with `useRef` to maintain ref stability across renders.
