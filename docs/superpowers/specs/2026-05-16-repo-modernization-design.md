# React Sketch Canvas Repo Modernization Design

Date: 2026-05-16

## Goal

Modernize the pre-release `react-sketch-canvas` repository from a Turborepo-style multi-package workspace into a lean structure with one library package and one Astro docs app. The migration should reduce contributor friction, colocate tests with the library, add fast Vitest unit testing, move toward Biome for linting and formatting, and make npm package contents explicit.

The implementation will run in two phases so test relocation and toolchain cleanup are easier to validate independently.

## Current Shape

The repo currently contains:

- `packages/react-sketch-canvas`: the publishable React library.
- `packages/tests`: Playwright component tests, fixtures, stories, and test helpers.
- `packages/eslint-config-custom`: shared ESLint configuration.
- `packages/tsconfig`: shared TypeScript configuration.
- `apps/docs`: Astro/Starlight documentation app.
- root Turborepo scripts and `turbo.json`.

Known friction points:

- Playwright tests live in a separate package and import `react-sketch-canvas` as a workspace dependency.
- The library package currently allows `src` into package contents.
- Node engine requirements are inconsistent between root and library.
- ESLint/Prettier/shared-config packages add maintenance weight.
- Stale changesets include internal package entries that will disappear.

## Target Shape

The repo should end at:

- `packages/react-sketch-canvas`: source, package build config, package-local unit tests, package-local Playwright CT tests, and package-local test configs.
- `apps/docs`: Astro docs app consuming the library workspace package for examples and the library source entry for generated API docs.
- root workspace scripts that orchestrate the library and docs directly without Turborepo.

The following packages should be removed by the end of Phase 2:

- `packages/tests`
- `packages/eslint-config-custom`
- `packages/tsconfig`

## Phase 1: Colocate Tests And Add Vitest

Phase 1 moves test ownership into the library package while preserving the existing Playwright component-test dataset.

File moves:

- Move `packages/tests/src/` to `packages/react-sketch-canvas/tests/`.
- Move `packages/tests/playwright/` to `packages/react-sketch-canvas/playwright/`.
- Move `packages/tests/playwright-ct.config.ts` to `packages/react-sketch-canvas/playwright-ct.config.ts`.
- Delete `packages/tests` after its files and package responsibilities have moved.

Playwright CT changes:

- Keep fixtures, stories, command helpers, and behavioral assertions intact.
- Update imports that currently use `react-sketch-canvas` so colocated tests exercise local source through relative imports such as `../src` or a configured package-local alias.
- Keep Playwright CT responsible for pointer physics, SVG rendering behavior, export behavior, eraser masks, undo/redo, and browser-visible component contracts.
- Move Playwright output paths to the library package, and update `.gitignore`/CI artifact paths accordingly.

Vitest changes:

- Add `vitest`, `happy-dom`, and `@testing-library/react` to the library test setup.
- Add `packages/react-sketch-canvas/vitest.config.ts`.
- Add a small initial unit suite under the library package to prove the fast-test path works.
- Prefer Vitest for pure logic, state-batching behavior, hook contracts, and narrow render contracts that do not require real pointer physics or SVG browser behavior.

Scripts:

- Add `test:unit` for one-shot Vitest.
- Add `test:watch` for Vitest watch mode.
- Add `test:ct` for Playwright CT.
- Make `test` run both Vitest and Playwright CT.

Phase 1 validation:

- `pnpm test:unit`
- `pnpm test:ct`
- `pnpm test`
- library build still succeeds.

## Phase 2: Modernize Tooling, Packaging, And CI

Phase 2 removes old monorepo tooling and enforces the release package shape.

Turborepo removal:

- Remove `turbo` from root dependencies.
- Delete `turbo.json`.
- Replace root scripts with direct `pnpm --filter` or workspace commands for library and docs tasks.

Biome migration:

- Add Biome as the formatting and linting tool.
- Remove Prettier, ESLint, and the shared ESLint config package.
- Use Biome defaults rather than preserving Airbnb ESLint behavior.
- Run Biome formatting and safe lint fixes across the repo, accepting the required formatting churn as part of Phase 2.
- Convert only suppressions that still represent intentional exceptions after Biome has run.
- Keep formatting/lint scripts simple and runnable from the root.

TypeScript config cleanup:

- Remove `packages/tsconfig`.
- Inline the library TypeScript settings into `packages/react-sketch-canvas/tsconfig.json`.
- Keep the docs app on its Astro TypeScript configuration unless docs need a small local override.

README and package contents:

- Treat the root `README.md` as canonical.
- Remove or collapse duplicate package README content.
- Configure the publish flow so the npm package includes the root README, license, changelog, and `dist`.
- Exclude `src`, `tests`, Playwright files, reports, configs, docs internals, and other development-only files from the production package.
- Verify contents with `npm pack --dry-run` or `pnpm --filter react-sketch-canvas pack --dry-run`.

Package metadata:

- Update the library peer dependency to `react >=18.0.0`.
- Align Node engine requirements between root and library.
- Keep package exports/types/main/module aligned with the generated `dist` files.
- Keep production package contents under the size target. The desired target is under 5 KB; if the existing implementation cannot meet that after minification, the implementation must report the exact measured size and reason instead of weakening the check silently.

Changesets:

- Remove stale changesets that refer only to deleted internal packages.
- Preserve real `react-sketch-canvas` release notes and changesets.

CI:

- Update CI to install dependencies, run Biome, build, run Vitest, run Playwright CT, and upload the new Playwright report path.
- Update deploy workflow to use the direct build commands instead of `pnpm build` through Turbo.
- Keep GitHub Pages deployment behavior unchanged.

Phase 2 validation:

- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm build`
- `pnpm test`
- package dry-run with explicit contents review
- size-limit or replacement size check using the new target

## Boundaries

This modernization should not redesign library behavior, public component APIs, drawing semantics, export semantics, or docs content. The Playwright dataset should move locations but keep the same behavioral coverage.

New Vitest tests are allowed only to establish and route fast unit coverage. Broader test expansion should follow after the migration unless a small test is needed to make the new Vitest setup meaningful.

## Risks And Mitigations

Import drift risk:

Colocated CT files may accidentally test built package output or stale workspace resolution. Mitigate by using local source-relative imports or an explicit package-local test alias.

Package contents risk:

Moving tests into the library package increases the chance of publishing test files. Mitigate with explicit package `files`, package ignore rules if needed, and dry-run contents review.

Lint migration risk:

Biome does not map one-to-one with the existing Airbnb ESLint stack. This migration intentionally adopts Biome defaults and accepts the resulting formatter/lint-fix churn. Mitigate review risk by keeping Biome's mechanical changes in the Phase 2 tooling step and avoiding unrelated behavioral edits in the same files.

Bundle-size risk:

The requested under-5 KB target may be lower than the current minified output. Mitigate by measuring the real production artifact and reporting any gap explicitly before making size-check policy claims.

CI drift risk:

Dropping Turbo changes task ordering. Mitigate with explicit root scripts that build the library before docs or tests when needed.

## Success Criteria

- The repo has one library package and one docs app.
- Playwright CT lives under `packages/react-sketch-canvas` and passes from that location.
- Vitest is installed, configured, and runnable through root/package scripts.
- Root scripts no longer require Turborepo.
- Biome replaces ESLint/Prettier for linting and formatting.
- Internal config/test packages are removed.
- The npm package dry-run includes README and `dist`, and excludes `src`, tests, and development-only files.
- React peer dependency is `>=18.0.0`.
- CI uses the new script and report paths.
