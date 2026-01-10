# Issue #143: Custom paths

**GitHub:** https://github.com/vinothpandian/react-sketch-canvas/issues/143
**Created:** 2023-11-17
**Labels:** None
**Type:** Feature Request

## Description

Request to allow custom path generator scripts to be passed to react-sketch-canvas. This would enable different brush types similar to what tldraw.com offers.

## Desired Behavior

Allow users to provide a callback that receives the current path as an array of points and returns a custom SVG path string.

## Proposed API

```tsx
<ReactSketchCanvas
  style={styles}
  width="600"
  height="400"
  strokeWidth={4}
  strokeColor="red"
  getSvgPathFromPoints={(points: Vec2d[]) => `M${points.map(getPoint)}`}
/>
```

## Use Cases

- Custom brush effects
- Different stroke styles (calligraphy, pencil, marker, etc.)
- Artistic effects similar to other drawing applications
