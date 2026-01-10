# React Sketch Canvas - Open Issues

This directory contains documentation for all open GitHub issues. Last updated: 2026-01-10.

**Total Open Issues:** 27

## Issues by Category

### iPad/Stylus Issues (Critical UX)
| Issue | Title | Priority |
|-------|-------|----------|
| [#192](./192-ipad-apple-pencil-selection.md) | iPad/Apple Pencil Selection Issue: Blue Highlight Appears During Drawing | High |
| [#171](./171-ipad-pen-focus-selection.md) | iPad pen loses focus and selection box appears | High |

### Export Issues
| Issue | Title | Priority |
|-------|-------|----------|
| [#179](./179-export-fails-before-canvas-loaded.md) | exportImage(), exportSvg() fails with "Export function called before canvas loaded" | High |
| [#155](./155-custom-background-export.md) | Exported image with custom background isn't working as expected | Medium |
| [#153](./153-transparent-background-export.md) | Exported image's background color is always transparent | Medium |
| [#145](./145-exported-png-blurry-edges.md) | Exported PNG image edges are blurry | Medium |
| [#142](./142-eraser-trace-after-svg-export.md) | Abnormal stroke after exporting SVG and cleaning | Medium |
| [#137](./137-broken-background-image-export.md) | Canvas exports broken background image | Medium |
| [#105](./105-export-background-datauri.md) | exportWithBackgroundImage does not work with datauri | Low |

### Multi-Canvas / State Issues
| Issue | Title | Priority |
|-------|-------|----------|
| [#181](./181-onchange-doubling-strokes.md) | onChange keeps doubling up the strokes | High |
| [#177](./177-multiple-canvas-eraser-problem.md) | Multiple Canvas Eraser Problem | High |

### Touch/Mobile Issues
| Issue | Title | Priority |
|-------|-------|----------|
| [#180](./180-double-touches-for-buttons.md) | Double touches needed to make buttons respond after drawing | Medium |
| [#146](./146-two-finger-scroll-mobile.md) | Require 2 finger horizontal scroll for Mobile use | Medium |
| [#128](./128-allow-parent-scroll-touch.md) | Allow parent element to scroll with touch | Medium |
| [#121](./121-line-browser-vertical-stroke.md) | Canvas vertical stroke not working in LINE web browser | Low |

### Performance Issues
| Issue | Title | Priority |
|-------|-------|----------|
| [#127](./127-slow-performance.md) | Slow performance on Android devices | High |
| [#163](./163-throttling-optimization.md) | Throttling optimization (may be resolved) | Low |
| [#056](./056-optimize-data-structure.md) | Optimize data structure and code | Medium |

### Browser Compatibility Issues
| Issue | Title | Priority |
|-------|-------|----------|
| [#141](./141-firefox-stroke-issues.md) | Unsupported in latest Firefox | High |
| [#120](./120-eraser-darkreader-conflict.md) | Eraser not working with DarkReader | Low |

### Drawing/Rendering Bugs
| Issue | Title | Priority |
|-------|-------|----------|
| [#126](./126-vector-glitches.md) | Getting some vector glitches when drawing | Medium |
| [#114](./114-viewbox-not-set-loadpaths.md) | Viewbox is not set when paths are loaded | Medium |
| [#117](./117-resizable-canvas.md) | Resizable canvas strokes shift issue | Medium |

### Feature Requests
| Issue | Title | Priority |
|-------|-------|----------|
| [#169](./169-pointer-preview-stroke-width.md) | Preview for the pointer with strokeWidth | Medium |
| [#143](./143-custom-paths.md) | Custom paths / custom brush types | Medium |
| [#085](./085-sketchrnn-export.md) | Add export to SketchRNN format | Low |
| [#025](./025-rotate-canvas.md) | Canvas rotation support | Low |

## Priority Summary

### High Priority (Immediate attention needed)
1. **#192, #171** - iPad/Apple Pencil issues affect core functionality on iOS
2. **#179** - Export fails intermittently (ref stability issue)
3. **#177** - Multiple canvas eraser affects multi-canvas use cases
4. **#181** - onChange doubling affects real-time collaboration
5. **#141** - Firefox compatibility affects all Firefox users
6. **#127** - Performance issues on Android devices

### Medium Priority
- Export-related bugs (#155, #153, #145, #142, #137)
- Touch/mobile UX improvements (#180, #146, #128)
- Drawing/rendering bugs (#126, #114, #117)
- Feature requests with workarounds (#169)

### Low Priority
- Older export bugs with workarounds (#105)
- Browser-specific edge cases (#121, #120)
- Nice-to-have features (#143, #085, #025)
- Potentially resolved (#163)

## Common Themes

1. **Export functionality** - Multiple issues related to background image handling during export
2. **iOS/iPad support** - Browser selection behavior interfering with stylus input
3. **Performance** - Need for optimization, especially on mobile devices
4. **Multi-canvas support** - Shared state issues when multiple canvases exist
5. **Touch event handling** - Conflicts between drawing and scrolling gestures
