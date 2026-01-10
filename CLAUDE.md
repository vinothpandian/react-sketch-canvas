# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React Sketch Canvas is a freehand vector drawing React component library using SVG as canvas. It supports mouse, touch, and pen input on desktop and mobile platforms.

## Monorepo Structure

This is a Turborepo + pnpm workspace monorepo:

- `packages/react-sketch-canvas/` - Main library (published to npm)
- `packages/tests/` - Playwright component tests
- `packages/eslint-config-custom/` - Shared ESLint configuration
- `packages/tsconfig/` - Shared TypeScript configurations
- `apps/docs/` - Astro-based documentation site

## Common Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Development mode (parallel, no cache)
pnpm dev

# Run all tests (builds first, then runs Playwright tests)
pnpm test

# Run unit tests only (Vitest)
pnpm unit:test

# Lint all packages
pnpm lint

# Format code
pnpm format

# Run a single Playwright test file
pnpm --filter tests test src/actions/undo-redo.spec.tsx

# Run Playwright tests with UI mode (interactive debugging)
pnpm --filter tests dev:test

# Build library with size check
pnpm ci:build
```

## Architecture

### Component Hierarchy

**ReactSketchCanvas** (`packages/react-sketch-canvas/src/ReactSketchCanvas.tsx`)
- Top-level wrapper component exposed to users
- Manages state: drawing paths, undo/redo stacks
- Exposes public API via ref: `eraseMode()`, `clearCanvas()`, `undo()`, `redo()`, `exportImage()`, `exportSvg()`, `exportPaths()`, `loadPaths()`, `getSketchingTime()`, `resetCanvas()`

**Canvas** (`packages/react-sketch-canvas/src/Canvas.tsx`)
- Low-level drawing component
- Handles pointer events and coordinate transformation
- Throttles pointer move events (configurable via `useThrottle` hook)
- Renders SVG with background image support

**Paths** (`packages/react-sketch-canvas/src/Paths.tsx`)
- SVG path rendering with cubic Bezier curve smoothing
- Generates smooth curves from raw point data

### Key Types (`packages/react-sketch-canvas/src/core.types.ts`)

```typescript
interface CanvasPath {
  paths: Point[];
  strokeWidth: number;
  strokeColor: string;
  drawMode: boolean;
  startTimestamp?: number;
  endTimestamp?: number;
}

interface Point {
  x: number;
  y: number;
}

type ExportImageType = "jpeg" | "png";
```

## Testing

- **Unit tests**: Vitest in `packages/react-sketch-canvas/src/__test__/`
- **Integration tests**: Playwright component tests in `packages/tests/src/`
  - `props/` - Property validation tests
  - `actions/` - Feature tests (erase, export, import, undo/redo)
  - `canvas/` - Canvas rendering tests
  - `events/` - Event handling tests

## Build Output

The library builds to three formats:
- CommonJS: `dist/index.js`
- ESM: `dist/index.mjs`
- TypeScript declarations: `dist/index.d.ts`

Bundle size limit: 15 KB per format (enforced by size-limit).
