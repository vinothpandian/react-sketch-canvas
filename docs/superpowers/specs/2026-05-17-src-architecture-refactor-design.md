# React Sketch Canvas Source Architecture Refactor Design

Date: 2026-05-17

## Goal

Refactor the `packages/react-sketch-canvas/src` implementation so the package internals are easier to read, reason about, and unit test. The current source concentrates drawing state, history behavior, pointer handling, SVG rendering, eraser mask construction, and export behavior inside a few large files. This design splits those responsibilities into focused modules while preserving the existing public API and runtime behavior.

This refactor is architecture-only from a consumer perspective. Public component names, package entrypoints, props, ref methods, drawing semantics, export semantics, and documented usage stay stable. If implementation work exposes a bug or a public behavior conflict, pause and discuss before changing public API or behavior.

## Current Shape

The implementation is concentrated in:

- `src/ReactSketchCanvas/index.tsx`: public component wrapper, draw/erase mode, drawing lifecycle, undo/redo history, operation queueing, timestamp handling, callbacks, and imperative ref methods.
- `src/Canvas/index.tsx`: DOM wrapper, pointer event filtering, coordinate calculation, export image/SVG methods, background rendering, path grouping, eraser mask generation, and SVG rendering.
- `src/Paths/index.tsx`: path geometry helpers and React SVG path rendering.

This makes the code harder to scan and pushes many behaviors into React component tests even when the logic could be tested as pure functions.

## Target Architecture

Keep the package entrypoint stable, but reorganize internals around responsibility boundaries:

```text
src/
  ReactSketchCanvas/
    index.tsx
    types.ts
    hooks/
      useSketchCanvasController.ts
      useSketchCanvasImperativeHandle.ts
    state/
      history.ts
      operations.ts
      strokes.ts
      sketchingTime.ts
  Canvas/
    index.tsx
    types.ts
    hooks/
      useCanvasPointerHandlers.ts
      useCanvasExportHandle.ts
    export/
      image.ts
      svg.ts
      dom.ts
    svg/
      CanvasSvg.tsx
      Background.tsx
      EraserMasks.tsx
      StrokeGroups.tsx
      grouping.ts
  Paths/
    index.tsx
    SvgPath.tsx
    geometry.ts
```

`ReactSketchCanvas/index.tsx` becomes a thin adapter that applies prop defaults, uses the sketch controller, exposes the public imperative ref, and renders `Canvas`.

`Canvas/index.tsx` becomes a thin DOM container that owns the wrapper ref, wires pointer handlers, exposes export methods, and renders `CanvasSvg`.

`Paths/index.tsx` remains the public local barrel for path rendering helpers, but geometry moves into a pure module and `SvgPath` moves into its own component file.

## Responsibility Boundaries

### ReactSketchCanvas State

The `ReactSketchCanvas/state` modules own drawing state transitions and operations:

- `history.ts`: undo, redo, clear, reset, load paths, history position, and history synchronization behavior.
- `operations.ts`: operation types and queue application semantics if the queue abstraction remains necessary.
- `strokes.ts`: create a new stroke, append points to the active stroke, finish a stroke, and apply timestamp fields.
- `sketchingTime.ts`: calculate total sketching duration from timestamped paths.

These modules should be pure functions wherever possible. They should not import React, DOM APIs, or component files.

### ReactSketchCanvas Hooks

The `ReactSketchCanvas/hooks` modules bridge pure state logic into React:

- `useSketchCanvasController.ts`: owns React state, callback timing, drawing lifecycle handlers, and operation dispatching.
- `useSketchCanvasImperativeHandle.ts`: builds the public `ReactSketchCanvasRef` methods from controller state/actions and the lower-level `CanvasRef`.

Hooks may use React state, effects, refs, and callbacks, but should delegate business rules to the pure state modules.

### Canvas Pointer And Export

The `Canvas/hooks` and `Canvas/export` modules own DOM-specific behavior:

- `useCanvasPointerHandlers.ts`: filters pointer type, ignores non-primary mouse buttons, detects pen eraser button state, converts events into canvas-relative points, and connects document-level `pointerup`.
- `useCanvasExportHandle.ts`: exposes the lower-level `CanvasRef` by composing SVG and image export helpers.
- `export/dom.ts`: clone the SVG canvas, apply dimensions/viewBox, and provide DOM utilities needed by export.
- `export/svg.ts`: prepare exported SVG strings, including background removal/fill behavior.
- `export/image.ts`: load images, compose render canvas output, apply JPEG background fill, and honor requested export dimensions.

DOM and browser image behavior may still need Playwright coverage, but option handling and string/DOM transformations should be unit tested where practical.

### Canvas SVG Rendering

The `Canvas/svg` modules own presentational SVG structure:

- `CanvasSvg.tsx`: top-level SVG composition.
- `Background.tsx`: background rect and optional background image pattern.
- `EraserMasks.tsx`: hidden eraser strokes and mask definitions.
- `StrokeGroups.tsx`: grouped draw strokes with mask references.
- `grouping.ts`: pure grouping helpers for draw paths and eraser paths.

The rendering components should stay mostly declarative. Grouping and ID construction rules should be extracted enough to unit test without rendering the full canvas.

### Paths

The `Paths` modules separate geometry from rendering:

- `geometry.ts`: line measurement, control point calculation, and bezier command generation.
- `SvgPath.tsx`: render a circle for single-point strokes and a path for multi-point strokes.
- `index.tsx`: keep existing local exports and default `Paths` component behavior.

## Data Flow

The user-visible drawing flow remains unchanged:

1. `Canvas` receives DOM pointer events.
2. Pointer helpers reject disallowed pointer types, ignore non-primary mouse buttons, detect pen eraser button state, and convert DOM coordinates into canvas-relative points.
3. `ReactSketchCanvas` receives normalized drawing events.
4. The sketch controller creates or updates `CanvasPath` records.
5. The canvas renders current paths through grouped SVG strokes and eraser masks.
6. Imperative methods continue to operate through `ReactSketchCanvasRef` and `CanvasRef`.

Internal state transitions become explicit functions. Examples:

- `beginStroke(state, point, options)` returns the next state with a new stroke.
- `appendPoint(state, point)` returns the next state with the active stroke extended.
- `endStroke(state, now)` returns the next state with drawing stopped and optional timestamp completed.
- `applyOperation(state, operation)` applies undo, redo, clear, load, or reset semantics.

Exact function names can change during implementation if the final names are clearer, but the design goal is stable: pure transitions first, React orchestration second, rendering third.

## Behavior Preservation

Preserve existing behavior unless the user explicitly approves a change. Important behavior to characterize with tests before or during extraction:

- Undo/redo history position and history synchronization.
- `loadPaths` currently appends paths to existing paths even though the type comment says it replaces them. Preserve the implementation behavior for this refactor.
- `onChange` timing after path changes.
- `onStroke` timing after drawing ends.
- Timestamp start and end behavior when `withTimestamp` is enabled.
- Read-only pointer behavior.
- Eraser mode and pen eraser button override.
- Pointer type filtering.
- SVG export behavior with and without background image.
- JPEG canvas fill behavior when exporting without background image.
- Eraser path grouping and mask references.
- Single-point and multi-point path rendering.

If a behavior appears wrong but is currently observable, add a characterization test and discuss before changing it.

## Testing Strategy

Move more coverage into Vitest while keeping Playwright as the browser-visible behavior backstop.

Proposed unit test shape:

```text
tests/unit/
  react-sketch-canvas/
    history.spec.ts
    operations.spec.ts
    strokes.spec.ts
    sketchingTime.spec.ts
    useSketchCanvasController.spec.tsx
    useSketchCanvasImperativeHandle.spec.tsx
  canvas/
    pointer.spec.ts
    grouping.spec.ts
    svgExport.spec.ts
    useCanvasPointerHandlers.spec.tsx
    useCanvasExportHandle.spec.tsx
  paths/
    geometry.spec.ts
    SvgPath.spec.tsx
```

Pure module tests should be table-driven where useful and should avoid React rendering. These tests should cover the detailed state matrix for history, operations, strokes, grouping, geometry, and sketching-time calculation.

Hook tests should use Testing Library with small harness components. They should verify hook inputs, outputs, callback wiring, effect timing, refs, and consumer-visible integration. They should not test private implementation details or duplicate every pure transition case already covered by state module tests.

Existing Playwright component and e2e tests stay in place and should pass unchanged. Playwright remains responsible for pointer physics, browser SVG behavior, canvas image export behavior, and user-visible interaction contracts.

## Implementation Order

The implementation should be staged to preserve reviewability while still completing the full refactor in one cycle:

1. Extract `Paths` geometry and `SvgPath` with unit tests.
2. Extract canvas SVG grouping and presentational SVG components with unit tests.
3. Extract canvas pointer helpers and export helpers with unit and hook tests.
4. Extract `ReactSketchCanvas` pure state modules with characterization unit tests.
5. Introduce `ReactSketchCanvas` hooks and hook tests using Testing Library harnesses.
6. Thin down `ReactSketchCanvas/index.tsx` and `Canvas/index.tsx`.
7. Run full verification and adjust only internal seams needed for stability.

Each step should keep tests passing before moving deeper into the next responsibility area.

## Verification

Run these commands before considering the refactor complete:

```bash
pnpm --filter react-sketch-canvas test:unit
pnpm --filter react-sketch-canvas test:ct
pnpm --filter react-sketch-canvas test:e2e
pnpm --filter react-sketch-canvas build
pnpm lint
```

If one command cannot run in the local environment, document the exact failure and the remaining risk.

## Out Of Scope

- Public API redesign.
- Changing component names, prop names, ref method names, or package exports.
- Changing drawing semantics, eraser semantics, export output semantics, or callback timing intentionally.
- Rewriting the docs app.
- Replacing SVG rendering with canvas or another rendering backend.
- Broad packaging, CI, or repository modernization unrelated to the `src` architecture.

## Success Criteria

- `ReactSketchCanvas/index.tsx`, `Canvas/index.tsx`, and `Paths/index.tsx` become small composition files.
- Drawing state, history, operations, grouping, geometry, and export preparation are testable without rendering full React components.
- Hooks have focused Testing Library coverage through harness components.
- Existing Playwright behavior tests still pass.
- Public API and documented usage remain stable.
- The source layout communicates each module's purpose without needing to read unrelated implementation details.
