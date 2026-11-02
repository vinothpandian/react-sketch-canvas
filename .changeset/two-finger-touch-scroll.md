---
"react-sketch-canvas": minor
---

Let two-finger touch gestures scroll or pinch-zoom the page while one finger keeps drawing (#208).

Touch-drawing canvases now default to `touch-action: pinch-zoom` instead of `none`. A second finger ends the active stroke and hands the gesture to the browser. Pen and mouse behavior is unchanged. Add the `allowMultiTouchScroll` prop (default `true`); set it to `false` to restore the previous behavior, or pass `touchAction` for full control.
