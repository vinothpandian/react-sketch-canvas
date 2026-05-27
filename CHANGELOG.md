# Changelog

## 8.0.0

### Major Changes

- c3ce015: v8 release — modernized internals, new stroke-eraser mode, hi-DPI export, and a large pointer/rendering fix sweep.

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

- 4361d6c: - Add option to use Windows surface pen button as eraser
  - Memoize functions to reduce re-rendering

### Patch Changes

- 98200c3: - Add option to disable canvas (readOnly prop)
  - Remove cypress tests
  - Add playwright component tests
- 90ddaa0: Fix undo/redo behavior:
  - Fix timing issues by moving history update logic into mouse-down/redo/undo/clear functions
  - Prevent extra strokes from being recorded during history updates
  - Fix bug where canvas couldn't undo to empty state
  - Improve loadPath function to properly handle history state
  - Add proper history handling when using loadPaths
  - Fix reset canvas history logic
  - Implement event queue for undo/redo operations
  - Fix order of operations in history management
  - Add tests for undo behavior after clear and with loadPaths
- 70d45ed: Fix blank white space bug by allowing developers to set viewBox
- 77dd734: Fix: remove invalid mask attribute from stroke groups without eraser
- f85461f: Add xlinkHref fallback for SVG mask `<use>` references to improve Firefox compatibility
- 4daea40: - Add option to customize export image size
  - Upgrade packages
- 549e8ed: Fix unused eraser masks - firefox and random gaps

## 7.0.0-next.8

### Major Changes

- c3ce015: v8 release — modernized internals, new stroke-eraser mode, hi-DPI export, and a large pointer/rendering fix sweep.

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

## 7.0.0-next.7

### Patch Changes

- Add xlinkHref fallback for SVG mask `<use>` references to improve Firefox compatibility

## 7.0.0-next.6

### Patch Changes

- Fix: remove invalid mask attribute from stroke groups without eraser

## 7.0.0-next.5

### Patch Changes

- Fix undo/redo behavior:
  - Fix timing issues by moving history update logic into mouse-down/redo/undo/clear functions
  - Prevent extra strokes from being recorded during history updates
  - Fix bug where canvas couldn't undo to empty state
  - Improve loadPath function to properly handle history state
  - Add proper history handling when using loadPaths
  - Fix reset canvas history logic
  - Implement event queue for undo/redo operations
  - Fix order of operations in history management
  - Add tests for undo behavior after clear and with loadPaths

## 7.0.0-next.4

### Patch Changes

- Add option to disable canvas (readOnly prop)
- Remove cypress tests
- Add playwright component tests

## 7.0.0-next.3

### Patch Changes

- Add option to customize export image size
- Upgrade packages

## 7.0.0-next.2

### Patch Changes

- Fix blank white space bug by allowing developers to set viewBox

## 7.0.0-next.1

### Patch Changes

- Fix unused eraser masks - firefox and random gaps

## 7.0.0-next.0

### Major Changes

- - Add option to use Windows surface pen button as eraser
  - Memoize functions to reduce re-rendering

# [6.1.0]

### Added

- Added optional id props to uniquely identify a sketch canvas
- Upgraded dependencies

### Changed

- Updated tests to use the id props

### Fixed

- Fix multiple ReactSketchCanvas in one page causes issues due to id="background" #52
- Fix ReactSketchCanvas doesn't work on safari. #53

## [6.0.3]

### Fixed

- Fix Package cannot be installed via npm #51
- update contributing.md
- update github actions

## [6.0.2]

### Added

- Added cypress tests for all props and events
- Added `onStroke` prop to get last stroke on pointer up
- Adds a point on click (without moving) #45

### Changed

- Upgraded all dependencies
- Moved to DTS (tsdx fork) instead of nx
- Switched codebase to hook based implementation (support react >= 16.8)
- Removed immer dependency

### Fixed

- Changed React import to \* from React #40
- Export image fails when the background is not an image [beta] #46
- Fix partial transparent erase (eraser stroke color changed to black for masking, add maskUnits) #44

### Breaking changes

- Renamed `onUpdate` to `onChange`

## [6.0.1-beta]

### Added

- Upgraded all dependencies
- Updated directory structure
- Added background image rendering directly in SVG
- Added option to export background image while exporting the canvas as image or SVG
- Added background image aspect ratio control
- Updated erase option to use mask instead of canvas color
- Add github action for deployment of storybook and package

### Breaking changes

- Removed background option to set background image using CSS-in-JS (instead check feature-filled backgroundImage prop)

## [5.3.5]

## Changed

- Changed import react as `import * as React from 'react'`

## [5.3.4]

### Added

- Switched to Nx
- Updated documentation

### Changed

- Removed pepjs. Can be polyfilled by the web app directly instead

## [5.3.3]

### Fixed

- add support any version above react 16.4

## [5.3.2]

### Fixed

- Bump dependency versions

## [5.3.1]

### Fixed

- Set default value of `allowOnlyPointerType` as `'all'` again

## [5.3.0]

### Added

- Reset canvas option to reset internal state and clean undo/redo stack

### Fixed

- Fix exportImage function to export png in Firefox and Safari

## [5.2.0]

### Added

- Add `withTimestamp` prop and `getSketchingTime` function to measure the sketching time of the user

## [5.1.2] & [5.1.1] (Both are same - Sorry)

### Added

- Add index.d.ts to npm registry
- Add Github as registry
- Update example

## [5.1.0]

### Added

- Added defaultProps to onUpdate in ReactSketchCanvas
- Added touch-action="none" to allow pepjs polyfill pointer events
- Update README.md

### Fixed

- Removed the annoying console.log from Canvas

## [5.0.1]

### Added

Added README :)

## [5.0.0]

### Added

- Rewrote codebase in typescript
- Added pepjs to support more browsers
- Added onUpdate feature to get current paths in `CanvasPath` type

### Fixed

- Fixed sketch offset issue when the canvas is scrolled

### Changed

- Updated undo/redo/reset strategy
- Updated demo in storybook

## [4.0.0]

### Added

- Renamed SvgSketchCanvas to ReactSketchCanvas to keep naming convention
- Added className property to set class names for CSS selectors

### Deprecated

- Removed SvgSketchCanvas

## [3.0.1]

### Changed

- Moved immutable dependency from Canvas file

## [3.0.0]

### Changed

Removed onUpdate feature and made the system modular

### Added

- Made Canvas as a separate module. Now event handlers can be hooked with Canvas
  class to update paths from server. (For Collaboration use case)

### Deprecated

- Removed onUpdate feature and instead made Canvas module

## [2.3.0]

### Added

- Added onUpdate property to get the current sketch paths after every update

## [2.2.0]

allowOnlyPointerType

### Added

- Added "allowOnlyPointerType" use-case. Now single pointer type can be targetted

## [2.1.0]

### Added

- Switched to pointer events

## [2.0.1]

### Added

- Add SVG background using CSS

## [2.0.0]

### Added

- Export and load paths
- Erase mode and eraser width

### Changed

- Rename exportAsImage() to exportImage() for naming consistency

### Deprecated

- Rename exportAsImage()
