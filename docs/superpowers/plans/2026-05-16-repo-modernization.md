# React Sketch Canvas Repo Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernize the repo into one library package plus one Astro docs app, with tests colocated in the library, Vitest added for fast unit coverage, Biome replacing ESLint/Prettier, Turbo removed, and npm package contents constrained to production files.

**Architecture:** Phase 1 moves all test ownership into `packages/react-sketch-canvas` and proves both Vitest and Playwright CT work from that package. Phase 2 removes the old monorepo support packages, adopts Biome defaults, rewires root/CI scripts without Turbo, and verifies the publish artifact with a dry-run package inspection.

**Tech Stack:** pnpm workspaces, React 18, TypeScript, tsup, Vitest, happy-dom, Testing Library React, Playwright Component Testing, Biome, Astro/Starlight, Changesets, size-limit.

---

## Scope Check

This spec spans two coordinated phases, but they share one end state and one validation path. Keep them in one plan because Phase 2 depends on Phase 1's relocated package boundaries. Do not redesign public React component behavior, drawing semantics, export semantics, or docs content while executing this plan.

## File Structure

Create:

- `packages/react-sketch-canvas/tests/`: Playwright CT specs, helpers, stories, and fixtures moved from `packages/tests/src/`.
- `packages/react-sketch-canvas/playwright/`: Playwright CT browser entry files moved from `packages/tests/playwright/`.
- `packages/react-sketch-canvas/playwright-ct.config.ts`: Playwright CT config owned by the library.
- `packages/react-sketch-canvas/vitest.config.ts`: Vitest config for fast unit/render tests.
- `packages/react-sketch-canvas/tests/unit/react-sketch-canvas.spec.tsx`: initial Vitest smoke coverage.
- `biome.json`: repo-wide Biome defaults with explicit generated-output ignores.

Modify:

- `package.json`: remove Turbo/Prettier scripts and deps, add direct root orchestration scripts and Biome dependency.
- `pnpm-workspace.yaml`: explicitly include `apps/docs` and `packages/react-sketch-canvas`.
- `packages/react-sketch-canvas/package.json`: own all build/test/package scripts and test dependencies; update peer/engine/files/size target.
- `packages/react-sketch-canvas/tsconfig.json`: inline library TypeScript settings and include colocated test configs where needed.
- `packages/react-sketch-canvas/tsup.config.ts`: ensure production builds only emit `dist` artifacts.
- `apps/docs/package.json`: remove shared ESLint config dependency.
- `apps/docs/astro.config.mjs`: keep API docs pointed at the library source entry.
- `.gitignore`: ignore package-local Playwright reports and test results.
- `.github/workflows/test.yml`: use new lint/build/test commands and report path.
- `.github/workflows/deploy.yml`: build without Turbo.
- `.changeset/pre.json` and `.changeset/*.md`: remove stale internal package references while preserving real `react-sketch-canvas` notes.

Delete:

- `packages/tests/`
- `packages/eslint-config-custom/`
- `packages/tsconfig/`
- `turbo.json`
- `.eslintrc.js`
- `.npmignore`
- `packages/react-sketch-canvas/README.md`; the package `prepack` script will copy the canonical root README into the package only while packing.

## Task 1: Record The Baseline

**Files:**

- Read: `package.json`
- Read: `packages/react-sketch-canvas/package.json`
- Read: `packages/tests/package.json`
- Read: `.github/workflows/test.yml`
- Read: `packages/react-sketch-canvas/tsup.config.ts`

- [ ] **Step 1: Confirm the worktree is clean except plan docs**

Run:

```bash
git status --short
```

Expected: either no output, or only uncommitted plan-document changes if this plan has not been committed yet.

- [ ] **Step 2: Capture current package scripts**

Run:

```bash
pnpm --filter react-sketch-canvas exec node -e "const pkg=require('./package.json'); console.log(JSON.stringify(pkg.scripts,null,2));"
pnpm --filter tests exec node -e "const pkg=require('./package.json'); console.log(JSON.stringify(pkg.scripts,null,2));"
```

Expected: library scripts include `build`, `ci:build`, `dev`, `lint`, and `size`; tests scripts include `dev:test`, `test`, and `ci:test`.

- [ ] **Step 3: Run the current library build**

Run:

```bash
pnpm --filter react-sketch-canvas build
```

Expected: PASS, with `packages/react-sketch-canvas/dist/` generated.

- [ ] **Step 4: Run the current Playwright CT suite**

Run:

```bash
pnpm --filter tests test
```

Expected: PASS. If browsers are missing, run `pnpm --filter tests exec playwright install chromium`, then rerun the same command.

- [ ] **Step 5: Commit only if baseline output required a repo change**

Run:

```bash
git status --short
```

Expected: no source changes. Do not commit generated reports, `dist`, or test output.

## Task 2: Move Playwright CT Into The Library Package

**Files:**

- Move: `packages/tests/src/` to `packages/react-sketch-canvas/tests/`
- Move: `packages/tests/playwright/` to `packages/react-sketch-canvas/playwright/`
- Move: `packages/tests/playwright-ct.config.ts` to `packages/react-sketch-canvas/playwright-ct.config.ts`
- Delete: `packages/tests/package.json`
- Delete: `packages/tests/tsconfig.json`
- Delete: `packages/tests/.gitignore`

- [ ] **Step 1: Move the test directories with git history**

Run:

```bash
git mv packages/tests/src packages/react-sketch-canvas/tests
git mv packages/tests/playwright packages/react-sketch-canvas/playwright
git mv packages/tests/playwright-ct.config.ts packages/react-sketch-canvas/playwright-ct.config.ts
```

Expected: moved files appear under `packages/react-sketch-canvas/`.

- [ ] **Step 2: Remove the emptied tests package files**

Run:

```bash
git rm packages/tests/package.json packages/tests/tsconfig.json packages/tests/.gitignore
rmdir packages/tests
```

Expected: `packages/tests` no longer exists.

- [ ] **Step 3: Update Playwright imports to library-local source**

Replace every runtime/type import from `"react-sketch-canvas"` in `packages/react-sketch-canvas/tests/**/*.tsx` with `"../../src"`.

Example final imports:

```tsx
import { ReactSketchCanvas } from "../../src";
import type { CanvasPath } from "../../src";
import {
  ReactSketchCanvas,
  type ReactSketchCanvasProps,
  type ReactSketchCanvasRef,
} from "../../src";
```

Run:

```bash
rg -n 'from "react-sketch-canvas"' packages/react-sketch-canvas/tests
```

Expected: no output.

- [ ] **Step 4: Keep helper imports relative within tests**

Inspect imports under `packages/react-sketch-canvas/tests/`. Relative imports like `../commands`, `../fixtures/penStroke.json`, and `../stories/WithEraserButton.story` should remain unchanged.

Run:

```bash
rg -n 'from "\\.\\./commands"|from "\\.\\./fixtures|from "\\.\\./stories' packages/react-sketch-canvas/tests
```

Expected: existing helper/story/fixture imports still resolve from test subdirectories.

- [ ] **Step 5: Commit the file move**

Run:

```bash
git add packages/react-sketch-canvas/tests packages/react-sketch-canvas/playwright packages/react-sketch-canvas/playwright-ct.config.ts
git add -A packages/tests
git commit -m "test: colocate playwright component tests"
```

Expected: conventional commit succeeds.

## Task 3: Rehome Playwright CT Dependencies And Scripts

**Files:**

- Modify: `packages/react-sketch-canvas/package.json`
- Modify: `packages/react-sketch-canvas/playwright-ct.config.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Update package-local Playwright scripts**

In `packages/react-sketch-canvas/package.json`, set the `scripts` object to include these entries while preserving existing build scripts:

```json
{
  "clean": "rimraf dist",
  "build": "pnpm clean && tsup src/index.tsx --env.NODE_ENV production",
  "ci:build": "pnpm clean && tsup src/index.tsx --env.NODE_ENV production && pnpm size",
  "dev": "tsup src/index.tsx --env.NODE_ENV development",
  "lint": "biome check .",
  "format": "biome format --write .",
  "test:ct": "playwright test -c playwright-ct.config.ts",
  "test:ct:ui": "playwright test -c playwright-ct.config.ts --ui",
  "test:unit": "vitest run",
  "test:watch": "vitest",
  "test": "pnpm test:unit && pnpm test:ct",
  "size": "size-limit"
}
```

- [ ] **Step 2: Move Playwright dependencies into the library**

In `packages/react-sketch-canvas/package.json`, add these `devDependencies` if they are missing:

```json
{
  "@playwright/experimental-ct-react": "^1.41.2",
  "@types/node": "^20.11.17",
  "playwright": "^1.41.2",
  "react-dom": "^18.2.0",
  "vite": "^5.1.2"
}
```

Keep existing React, TypeScript, tsup, size-limit, and rimraf dev dependencies.

- [ ] **Step 3: Update Playwright CT output paths**

Replace `packages/react-sketch-canvas/playwright-ct.config.ts` with:

```ts
import { defineConfig, devices } from "@playwright/experimental-ct-react";

export default defineConfig({
  testDir: "./tests",
  snapshotDir: "./tests/__snapshots__",
  outputDir: "./test-results",
  timeout: 10 * 1000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { outputFolder: "playwright-report" }]],
  use: {
    trace: "on-first-retry",
    ctPort: 3100,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

- [ ] **Step 4: Update ignored Playwright output**

Ensure `.gitignore` contains these entries:

```gitignore
playwright-report/
test-results/
packages/react-sketch-canvas/playwright-report/
packages/react-sketch-canvas/test-results/
```

Remove obsolete `packages/tests/cypress/*` ignore entries when Task 9 removes old test package references.

- [ ] **Step 5: Install dependency graph changes**

Run:

```bash
pnpm install
```

Expected: `pnpm-lock.yaml` updates and there is no `packages/tests` workspace package in the lockfile.

- [ ] **Step 6: Run relocated Playwright CT**

Run:

```bash
pnpm --filter react-sketch-canvas exec playwright install chromium
pnpm --filter react-sketch-canvas test:ct
```

Expected: PASS from `packages/react-sketch-canvas/playwright-ct.config.ts`.

- [ ] **Step 7: Commit Playwright package ownership**

Run:

```bash
git add packages/react-sketch-canvas/package.json packages/react-sketch-canvas/playwright-ct.config.ts .gitignore pnpm-lock.yaml
git commit -m "test: run playwright from library package"
```

Expected: conventional commit succeeds.

## Task 4: Add Vitest Unit Test Wiring

**Files:**

- Create: `packages/react-sketch-canvas/vitest.config.ts`
- Create: `packages/react-sketch-canvas/tests/unit/react-sketch-canvas.spec.tsx`
- Modify: `packages/react-sketch-canvas/package.json`
- Modify: `packages/react-sketch-canvas/tsconfig.json`

- [ ] **Step 1: Add Vitest dependencies**

Run:

```bash
pnpm --filter react-sketch-canvas add -D vitest happy-dom @testing-library/react
```

Expected: `packages/react-sketch-canvas/package.json` contains `vitest`, `happy-dom`, and `@testing-library/react` in `devDependencies`, and `pnpm-lock.yaml` is updated.

- [ ] **Step 2: Create Vitest config**

Create `packages/react-sketch-canvas/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["tests/unit/**/*.spec.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
    },
  },
});
```

- [ ] **Step 3: Add initial render smoke test**

Create `packages/react-sketch-canvas/tests/unit/react-sketch-canvas.spec.tsx`:

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReactSketchCanvas } from "../../src";

describe("ReactSketchCanvas", () => {
  it("renders an svg canvas with the provided id", () => {
    render(<ReactSketchCanvas id="unit-canvas" width="320px" height="180px" />);

    const canvas = document.querySelector("svg#unit-canvas");

    expect(canvas).toBeInstanceOf(SVGElement);
    expect(canvas?.getAttribute("style")).toContain("width: 320px");
    expect(canvas?.getAttribute("style")).toContain("height: 180px");
  });
});
```

- [ ] **Step 4: Include test configs in TypeScript project**

Replace `packages/react-sketch-canvas/tsconfig.json` with:

```json
{
  "extends": "tsconfig/react-library.json",
  "include": ["src", "tests", "playwright", "playwright-ct.config.ts", "vitest.config.ts"],
  "exclude": ["dist", "build", "node_modules", "playwright-report", "test-results", "coverage"],
  "compilerOptions": {
    "rootDir": ".",
    "types": ["node", "vitest/globals"]
  }
}
```

This still references the shared tsconfig package until Phase 2.

- [ ] **Step 5: Install and run Vitest**

Run:

```bash
pnpm install
pnpm --filter react-sketch-canvas test:unit
```

Expected: PASS with one unit test.

- [ ] **Step 6: Run the full package test command**

Run:

```bash
pnpm --filter react-sketch-canvas test
```

Expected: Vitest passes first, then Playwright CT passes.

- [ ] **Step 7: Commit Vitest setup**

Run:

```bash
git add packages/react-sketch-canvas/package.json packages/react-sketch-canvas/vitest.config.ts packages/react-sketch-canvas/tests/unit/react-sketch-canvas.spec.tsx packages/react-sketch-canvas/tsconfig.json pnpm-lock.yaml
git commit -m "test: add vitest unit test setup"
```

Expected: conventional commit succeeds.

## Task 5: Replace Turbo Root Orchestration

**Files:**

- Modify: `package.json`
- Delete: `turbo.json`

- [ ] **Step 1: Replace root package scripts**

In root `package.json`, use these scripts:

```json
{
  "build": "pnpm --filter react-sketch-canvas build && pnpm --filter documentation build",
  "dev": "pnpm --filter documentation dev",
  "preview": "pnpm --filter documentation preview",
  "lint": "biome check .",
  "format": "biome format --write .",
  "test:unit": "pnpm --filter react-sketch-canvas test:unit",
  "test:watch": "pnpm --filter react-sketch-canvas test:watch",
  "test:ct": "pnpm --filter react-sketch-canvas test:ct",
  "test": "pnpm --filter react-sketch-canvas test",
  "ci:test": "pnpm lint && pnpm build && pnpm test",
  "ci:build": "pnpm --filter react-sketch-canvas ci:build",
  "release": "pnpm ci:test && pnpm ci:build && changeset version && changeset publish",
  "pre-release": "pnpm ci:test && pnpm ci:build && changeset && changeset publish"
}
```

- [ ] **Step 2: Update root dependencies**

In root `package.json`:

Remove:

```json
{
  "eslint-config-custom": "workspace:*",
  "prettier": "^3.2.5",
  "turbo": "^1.12.4"
}
```

Add:

```json
{
  "@biomejs/biome": "^1.9.4"
}
```

Keep:

```json
{
  "@changesets/cli": "^2.27.1"
}
```

- [ ] **Step 3: Delete Turbo config**

Run:

```bash
git rm turbo.json
pnpm install
```

Expected: `turbo` is removed from `pnpm-lock.yaml`.

- [ ] **Step 4: Verify root test routing**

Run:

```bash
pnpm test:unit
pnpm test:ct
pnpm test
```

Expected: all commands route to `packages/react-sketch-canvas` and pass.

- [ ] **Step 5: Commit root orchestration**

Run:

```bash
git add package.json pnpm-lock.yaml turbo.json
git commit -m "chore: replace turbo workspace orchestration"
```

Expected: conventional commit succeeds.

## Task 6: Adopt Biome Defaults

**Files:**

- Create: `biome.json`
- Delete: `.eslintrc.js`
- Modify: `packages/react-sketch-canvas/package.json`
- Modify: `apps/docs/package.json`
- Modify: all source, test, config, and docs files touched by Biome formatting/safe fixes

- [ ] **Step 1: Create Biome config**

Create `biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignore": [
      "node_modules",
      "dist",
      "coverage",
      "playwright-report",
      "test-results",
      "packages/react-sketch-canvas/dist",
      "packages/react-sketch-canvas/playwright-report",
      "packages/react-sketch-canvas/test-results",
      "apps/docs/src/content/docs/api"
    ]
  },
  "formatter": {
    "enabled": true
  },
  "linter": {
    "enabled": true
  },
  "organizeImports": {
    "enabled": true
  }
}
```

- [ ] **Step 2: Remove ESLint config**

Run:

```bash
git rm .eslintrc.js
```

Expected: `.eslintrc.js` deleted.

- [ ] **Step 3: Remove shared ESLint dependency from docs**

In `apps/docs/package.json`, remove the `devDependencies` block if it only contains:

```json
{
  "eslint-config-custom": "workspace:*"
}
```

If the block becomes empty, delete `devDependencies` entirely.

- [ ] **Step 4: Remove package-local ESLint dependencies**

In `packages/react-sketch-canvas/package.json`, remove:

```json
{
  "eslint": "^8.56.0",
  "eslint-config-custom": "workspace:*"
}
```

Keep the package `lint` script as:

```json
{
  "lint": "biome check ."
}
```

- [ ] **Step 5: Install dependency graph changes**

Run:

```bash
pnpm install
```

Expected: ESLint/Prettier shared stack is removed from the lockfile except transitive dependencies required by unrelated packages.

- [ ] **Step 6: Run Biome safe fixes and formatting**

Run:

```bash
pnpm exec biome check --write .
```

Expected: Biome rewrites formatting/imports and applies safe fixes across the repo.

- [ ] **Step 7: Convert remaining intentional suppressions**

Run:

```bash
rg -n "<legacy ESLint suppression tokens>" .
```

For each remaining meaningful suppression, replace with a Biome suppression comment on the smallest possible node. Example conversions:

```ts
// biome-ignore lint/suspicious/noConsole: export failures are surfaced to developers during manual canvas export debugging.
console.error(error);
```

```tsx
{/* biome-ignore lint/suspicious/noArrayIndexKey: stroke path order is stable and has no domain id. */}
<path key={index} />
```

Run the `rg` command again.

Expected: no ESLint suppression comments remain.

- [ ] **Step 8: Run Biome check**

Run:

```bash
pnpm lint
```

Expected: PASS. If Biome reports non-safe fixes, apply the smallest code change that preserves behavior, then rerun `pnpm lint`.

- [ ] **Step 9: Commit Biome migration**

Run:

```bash
git add biome.json package.json packages/react-sketch-canvas/package.json apps/docs/package.json pnpm-lock.yaml .eslintrc.js .
git commit -m "chore: adopt biome defaults"
```

Expected: conventional commit succeeds. Review this commit carefully because it intentionally contains mechanical formatting churn.

## Task 7: Inline TypeScript Config And Remove Internal Config Packages

**Files:**

- Modify: `packages/react-sketch-canvas/tsconfig.json`
- Modify: `pnpm-workspace.yaml`
- Delete: `packages/tsconfig/`
- Delete: `packages/eslint-config-custom/`

- [ ] **Step 1: Inline the library TypeScript config**

Replace `packages/react-sketch-canvas/tsconfig.json` with:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES6",
    "module": "ESNext",
    "lib": ["DOM", "ESNext"],
    "importHelpers": true,
    "declaration": true,
    "sourceMap": true,
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "moduleResolution": "Node",
    "jsx": "react",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "resolveJsonModule": true,
    "types": ["node", "vitest/globals"]
  },
  "include": ["src", "tests", "playwright", "playwright-ct.config.ts", "vitest.config.ts"],
  "exclude": ["dist", "build", "node_modules", "coverage", "playwright-report", "test-results"]
}
```

- [ ] **Step 2: Remove shared config packages**

Run:

```bash
git rm -r packages/tsconfig packages/eslint-config-custom
pnpm install
```

Expected: workspace packages `tsconfig` and `eslint-config-custom` are gone from `pnpm-lock.yaml` importers.

- [ ] **Step 3: Narrow workspace globs to live packages**

Set `pnpm-workspace.yaml` to:

```yaml
packages:
  - "apps/docs"
  - "packages/react-sketch-canvas"
```

Run:

```bash
pnpm install
```

Expected: `pnpm-lock.yaml` has importers only for `.`, `apps/docs`, and `packages/react-sketch-canvas`.

- [ ] **Step 4: Check for stale shared config references**

Run:

```bash
rg -n '"tsconfig|eslint-config-custom|extends": "tsconfig|packages/tsconfig|packages/eslint-config-custom' .
```

Expected: no references except historical text in committed design/plan docs. If code/config references remain, remove them.

- [ ] **Step 5: Run type/build validation**

Run:

```bash
pnpm --filter react-sketch-canvas build
pnpm --filter documentation build
```

Expected: both builds pass.

- [ ] **Step 6: Commit config package removal**

Run:

```bash
git add packages/react-sketch-canvas/tsconfig.json pnpm-workspace.yaml packages/tsconfig packages/eslint-config-custom pnpm-lock.yaml
git commit -m "chore: inline package typescript config"
```

Expected: conventional commit succeeds.

## Task 8: Tighten Package Metadata And Publish Contents

**Files:**

- Modify: `packages/react-sketch-canvas/package.json`
- Modify: `packages/react-sketch-canvas/tsup.config.ts`
- Modify: `package.json`
- Delete: `packages/react-sketch-canvas/README.md`
- Delete: `.npmignore`

- [ ] **Step 1: Update library package metadata**

In `packages/react-sketch-canvas/package.json`, set:

```json
{
  "engines": {
    "node": ">=18.0.0"
  },
  "peerDependencies": {
    "react": ">=18.0.0"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ],
  "size-limit": [
    {
      "path": "dist/index.js",
      "limit": "5 KB"
    },
    {
      "path": "dist/index.mjs",
      "limit": "5 KB"
    }
  ]
}
```

Keep existing `name`, `version`, `description`, `author`, `homepage`, `license`, `repository`, `keywords`, `main`, `typings`, `module`, and `publishConfig`.

- [ ] **Step 2: Ensure root README is copied for package builds**

In `packages/react-sketch-canvas/package.json`, add these scripts to copy the canonical root README only during package creation:

```json
{
  "prepack": "cp ../../README.md README.md",
  "postpack": "rm -f README.md"
}
```

In root `package.json`, set `ci:build` to:

```json
{
  "ci:build": "pnpm --filter react-sketch-canvas ci:build"
}
```

This keeps the root README canonical while ensuring `npm pack` and `npm publish` receive a package-local README at pack time.

- [ ] **Step 3: Keep tsup output production-only**

Ensure `packages/react-sketch-canvas/tsup.config.ts` contains:

```ts
import { defineConfig } from "tsup";

export default defineConfig((options) => {
  const isProdEnv = options.env?.NODE_ENV === "production";

  return {
    entry: ["src/index.tsx"],
    sourcemap: !isProdEnv,
    format: isProdEnv ? ["esm", "cjs", "iife"] : ["esm"],
    dts: true,
    minify: isProdEnv,
    watch: !isProdEnv,
    clean: true,
  };
});
```

- [ ] **Step 4: Remove root npmignore**

Run:

```bash
git rm .npmignore packages/react-sketch-canvas/README.md
```

Expected: package contents are controlled by `packages/react-sketch-canvas/package.json` `files` and `prepack`, not the root ignore file or a tracked duplicate README.

- [ ] **Step 5: Run package build and size check**

Run:

```bash
pnpm ci:build
```

Expected: PASS if both `dist/index.js` and `dist/index.mjs` are under 5 KB. If size-limit fails, keep the 5 KB target and record the actual measured size in the task notes before deciding whether code-level bundle reduction belongs in a follow-up.

- [ ] **Step 6: Inspect package dry-run contents**

Run:

```bash
cd packages/react-sketch-canvas
npm pack --dry-run
test ! -f README.md
```

Expected package contents include:

```text
dist/index.d.mts
dist/index.d.ts
dist/index.global.js
dist/index.js
dist/index.mjs
README.md
LICENSE
CHANGELOG.md
package.json
```

Expected package contents do not include:

```text
src/
tests/
playwright/
playwright-ct.config.ts
vitest.config.ts
playwright-report/
test-results/
coverage/
```

- [ ] **Step 7: Commit package metadata cleanup**

Run:

```bash
git add package.json packages/react-sketch-canvas/package.json packages/react-sketch-canvas/tsup.config.ts packages/react-sketch-canvas/README.md .npmignore pnpm-lock.yaml
git commit -m "chore: tighten package publish contents"
```

Expected: conventional commit succeeds.

## Task 9: Clean Changesets And Stale Workspace References

**Files:**

- Modify: `.changeset/pre.json`
- Modify/delete: `.changeset/*.md`
- Modify: `.gitignore`
- Search: entire repo

- [ ] **Step 1: Remove deleted internal packages from pre mode**

Edit `.changeset/pre.json` so `initialVersions` contains only live publishable packages. Final shape should not include `eslint-config-custom`, `tests`, or `tsconfig`.

Example:

```json
{
  "mode": "pre",
  "tag": "next",
  "initialVersions": {
    "react-sketch-canvas": "7.0.0-next.7"
  },
  "changesets": []
}
```

If `changesets` already contains valid entries, preserve that array exactly and only remove deleted package names from `initialVersions`.

- [ ] **Step 2: Remove obsolete ignore entries**

In `.gitignore`, remove these obsolete entries if present:

```gitignore
packages/tests/cypress/screenshots/
packages/tests/cypress/videos/
packages/tests/.nyc_output/
packages/tests/coverage/
packages/tests/cypress/downloads/
.turbo/
```

Keep current package-local report ignores:

```gitignore
packages/react-sketch-canvas/playwright-report/
packages/react-sketch-canvas/test-results/
```

- [ ] **Step 3: Search for stale workspace package names**

Run:

```bash
rg -n "packages/tests|eslint-config-custom|packages/eslint-config-custom|packages/tsconfig|\"tsconfig\"|turbo|\\.turbo" .
```

Expected: no active config/code references. References inside `docs/superpowers/specs/` and `docs/superpowers/plans/` are acceptable because they describe the migration.

- [ ] **Step 4: Commit stale reference cleanup**

Run:

```bash
git add .changeset .gitignore
git commit -m "chore: remove stale workspace references"
```

Expected: conventional commit succeeds.

## Task 10: Update CI And Deploy Workflows

**Files:**

- Modify: `.github/workflows/test.yml`
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Update CI workflow**

Replace `.github/workflows/test.yml` with:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    name: Build, lint, and test on Node ${{ matrix.node }} and ${{ matrix.os }}
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        node: ["20.x"]
        os: [ubuntu-latest]

    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Use Node ${{ matrix.node }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}

      - uses: pnpm/action-setup@v4
        name: Install pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm --filter react-sketch-canvas exec playwright install chromium

      - name: Lint
        run: pnpm lint

      - name: Build
        run: pnpm build

      - name: Test
        run: pnpm test

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: packages/react-sketch-canvas/playwright-report/
          retention-days: 30
```

- [ ] **Step 2: Update deploy workflow build commands**

In `.github/workflows/deploy.yml`, keep GitHub Pages permissions/deploy behavior unchanged and ensure the build step remains:

```yaml
      - name: Build packages
        run: pnpm build
```

Because root `pnpm build` no longer uses Turbo, no workflow-specific Turbo references should remain.

- [ ] **Step 3: Check workflow references**

Run:

```bash
rg -n "tests|turbo|playwright-report" .github/workflows
```

Expected:

```text
.github/workflows/test.yml:... run: pnpm --filter react-sketch-canvas exec playwright install chromium
.github/workflows/test.yml:... path: packages/react-sketch-canvas/playwright-report/
```

No `--filter tests` or `turbo` references should remain.

- [ ] **Step 4: Commit workflow update**

Run:

```bash
git add .github/workflows/test.yml .github/workflows/deploy.yml
git commit -m "ci: update workflows for lean workspace"
```

Expected: conventional commit succeeds.

## Task 11: Final Verification And Package Audit

**Files:**

- Verify: all changed files
- Verify: `packages/react-sketch-canvas/package.json`
- Verify: `pnpm-lock.yaml`

- [ ] **Step 1: Install from lockfile**

Run:

```bash
pnpm install --frozen-lockfile
```

Expected: PASS.

- [ ] **Step 2: Run lint**

Run:

```bash
pnpm lint
```

Expected: PASS.

- [ ] **Step 3: Run build**

Run:

```bash
pnpm build
```

Expected: PASS for library and docs.

- [ ] **Step 4: Run unit tests**

Run:

```bash
pnpm test:unit
```

Expected: PASS.

- [ ] **Step 5: Run Playwright CT**

Run:

```bash
pnpm test:ct
```

Expected: PASS.

- [ ] **Step 6: Run full test command**

Run:

```bash
pnpm test
```

Expected: PASS.

- [ ] **Step 7: Run package build and size check**

Run:

```bash
pnpm ci:build
```

Expected: PASS if package artifacts are under 5 KB. If this fails only on size, capture the exact size-limit output and stop before weakening the threshold.

- [ ] **Step 8: Audit dry-run package contents**

Run:

```bash
cd packages/react-sketch-canvas
npm pack --dry-run > /tmp/react-sketch-canvas-pack.txt
cat /tmp/react-sketch-canvas-pack.txt
```

Expected: output lists README, LICENSE, CHANGELOG, package.json, and `dist/*`; output does not list `src`, `tests`, `playwright`, `coverage`, `playwright-report`, or `test-results`.

- [ ] **Step 9: Check final repo shape**

Run:

```bash
find packages -maxdepth 2 -type d | sort
```

Expected package directories:

```text
packages
packages/react-sketch-canvas
packages/react-sketch-canvas/dist
packages/react-sketch-canvas/playwright
packages/react-sketch-canvas/tests
packages/react-sketch-canvas/src
```

No `packages/tests`, `packages/tsconfig`, or `packages/eslint-config-custom`.

- [ ] **Step 10: Commit final verification notes only if files changed**

Run:

```bash
git status --short
```

Expected: clean. If verification changed generated files that should stay ignored, remove ignored outputs with:

```bash
rm -rf packages/react-sketch-canvas/playwright-report packages/react-sketch-canvas/test-results packages/react-sketch-canvas/coverage
```

Then rerun `git status --short`.

## Self-Review Checklist

- Spec coverage: Phase 1 test colocation, Vitest setup, Playwright ownership, Phase 2 Turbo removal, Biome defaults, TypeScript config cleanup, README/package contents, React 18 peer dependency, changeset cleanup, CI updates, package dry-run, and 5 KB size target all map to tasks above.
- Placeholder scan: the plan contains no unresolved markers or undefined follow-up steps.
- Type consistency: test imports use `../../src` from files under `packages/react-sketch-canvas/tests/*`; root scripts use `react-sketch-canvas` and `documentation` package filters; package-local scripts use `vitest` and `playwright` from the library package.
