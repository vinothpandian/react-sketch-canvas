# Tech Stack: React Sketch Canvas

## Current State

### Core
- **Language:** TypeScript
- **Framework:** React (>=16.8 with Hooks support)
- **Rendering:** SVG

### Build & Tooling
- **Monorepo:** Turborepo + pnpm workspaces
- **Bundler:** tsup (outputs CJS, ESM, and TypeScript declarations)
- **Package Manager:** pnpm

### Testing
- **Unit Tests:** Vitest
- **Integration Tests:** Playwright (component testing)

### Code Quality
- **Linting:** ESLint (with custom shared config)
- **Formatting:** Prettier
- **Type Checking:** TypeScript strict mode

### Documentation
- **Framework:** Astro (Starlight theme)

### Release Management
- **Versioning:** Changesets

---

## Target State (Migration Goals)

### Build & Tooling
- **Monorepo:** Bun workspaces
- **Bundler:** Bun build (or tsup with Bun runtime)
- **Package Manager:** Bun

### Testing
- **Unit Tests:** Bun test runner
- **Integration Tests:** Playwright (component testing) - retained

### Code Quality
- **Linting & Formatting:** Biome (replaces ESLint + Prettier)
- **Type Checking:** TypeScript strict mode - retained

---

## Migration Notes

### Bun Migration
- Bun provides built-in workspace support via `workspaces` in package.json
- Bun's test runner is Jest-compatible with built-in assertions
- Bun offers faster package installation and script execution
- Consider compatibility with existing Playwright tests

### Biome Migration
- Biome provides unified linting and formatting
- Offers ESLint and Prettier rule compatibility
- Significantly faster than ESLint + Prettier combination
- Single configuration file (`biome.json`)
