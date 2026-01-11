# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React Sketch Canvas is a freehand vector drawing React component library using SVG as canvas. It supports mouse, touch, and pen input on desktop and mobile platforms.

## Monorepo Structure

This is a Bun workspace monorepo:

- `packages/react-sketch-canvas/` - Main library (published to npm)
- `packages/tests/` - Playwright component tests
- `packages/tsconfig/` - Shared TypeScript configurations
- `apps/docs/` - Astro-based documentation site

## Common Commands

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Development mode
bun run dev

# Run all tests (builds first, then runs Playwright tests)
bun run test

# Run unit tests only (Bun test runner)
bun run unit:test

# Lint all packages (Biome)
bun run lint

# Lint and auto-fix
bun run lint:fix

# Format code (Biome)
bun run format

# Run a single Playwright test file
bun run --filter tests test src/actions/undo-redo.spec.tsx

# Run Playwright tests with UI mode (interactive debugging)
bun run --filter tests dev:test

# Build library with size check
bun run ci:build
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

- **Unit tests**: Bun test runner in `packages/react-sketch-canvas/src/__test__/`
- **Integration tests**: Playwright component tests in `packages/tests/src/`
  - `props/` - Property validation tests
  - `actions/` - Feature tests (erase, export, import, undo/redo)
  - `canvas/` - Canvas rendering tests
  - `events/` - Event handling tests

## Code Quality

- **Linting**: Biome (`biome.json` at root)
- **Formatting**: Biome (2 spaces, double quotes, semicolons)

## Build Output

The library builds to three formats:
- CommonJS: `dist/index.js`
- ESM: `dist/index.mjs`
- TypeScript declarations: `dist/index.d.ts`

Bundle size limit: 15 KB per format (enforced by size-limit).
