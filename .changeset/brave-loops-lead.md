---
"react-sketch-canvas": major
---

v8 release — modernized internals, new stroke-eraser mode, hi-DPI export, and a large pointer/rendering fix sweep.

### Breaking changes
- Rewrote the package as a layered architecture: `ReactSketchCanvas` (stateful) is now built on top of a new low-level `Canvas` component you can use directly for custom state/history.
- Default raster `exportImage()` size now matches the rendered SVG dimensions and scales by `window.devicePixelRatio` for crisp hi-DPI output. Passing explicit `width`/`height` opts out of DPR scaling (caller owns the pixel count).
- Export functions (`exportImage`, `exportSvg`) now reject with descriptive errors instead of silently failing.
- New `touchAction` prop changes default touch behavior: touch-drawing modes still default to `"none"`, but pen/mouse-only canvases now allow native pan/pinch.
- Dropped Cypress; tests are now Vitest + Playwright (CT + E2E).
- Bumped `engines.node` to `>=22.13.0`.

### Features
- **Stroke eraser mode** — new `eraserMode: "mask" | "stroke"` prop (fixes #200).
- **`readOnly` prop** to disable drawing.
- **`viewBox` prop** to fix blank-space rendering.
- **`touchAction` prop** so parent containers can scroll while drawing still works.
- **Customizable export size** via `ExportImageOptions`.
- Windows Surface pen barrel-button can be used as an eraser.
- New React Router + Fumadocs documentation site with LLM-friendly text endpoints.

### Fixes

Pointer & touch (#205, #213):
- #192 — iPad/Apple Pencil blue selection highlight during drawing
- #181 — `onChange` doubling up strokes
- #180 — double-tap needed for buttons after drawing
- #146 — two-finger horizontal scroll on mobile
- #128 — allow parent element to scroll with touch
- #208 — multi-touch / parent-container gesture handling

Rendering & geometry (#206):
- #127 — slow performance with heavy strokes
- #126 — vector glitches while drawing
- #121 — stroke artifacts from duplicate points
- #114 — viewBox not set when paths are loaded

Export (#203, #213):
- #105 — `exportWithBackgroundImage={false}` with data-URI backgrounds
- #137 — broken background image in canvas exports
- #145 — blurry exported PNG edges (now DPR-aware, #207)
- #153 — exported image background always transparent
- #155 — custom background images not exporting correctly
- #179 — `exportImage()` / `exportSvg()` failing with "Export function called before canvas loaded"

SVG / Firefox compatibility (#199, #204):
- #142 — eraser trace persisting after SVG export + clear
- #177 — multiple canvases sharing/cross-referencing masks
- #194 — Firefox eraser mask rendering
- partially addresses #54 and #141 (Firefox stroke rendering)

### Known follow-ups
Some milestone issues were only partially resolved in v8 and have been split into new tracking issues.
