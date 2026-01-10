# Specification: Migrate to Bun and Biome

## Overview

This track migrates the React Sketch Canvas monorepo from the current toolchain (pnpm, Turborepo, Vitest, ESLint, Prettier) to a modern, unified toolchain using Bun and Biome.

## Goals

1. **Replace pnpm with Bun** as the package manager
2. **Replace Turborepo with Bun workspaces** for monorepo management
3. **Replace Vitest with Bun's test runner** for unit testing
4. **Replace ESLint + Prettier with Biome** for linting and formatting
5. **Maintain all existing functionality** - no regressions in library behavior
6. **Keep Playwright** for integration testing (no change)

## Non-Goals

- Changing the library's public API
- Modifying the documentation framework (Astro stays)
- Changing the release management process (Changesets stays)
- Modifying the bundler (tsup stays, but will run with Bun)

## Success Criteria

1. All existing tests pass using Bun's test runner
2. All Playwright integration tests pass
3. Library builds correctly with `bun run build`
4. Biome linting and formatting work without errors
5. CI/CD workflows updated and passing
6. Development experience is improved (faster installs, faster tests)

## Technical Approach

### Phase 1: Bun Package Manager Migration
- Install Bun globally
- Remove pnpm-lock.yaml, add bun.lockb
- Update package.json scripts to use Bun
- Verify workspace configuration works with Bun

### Phase 2: Test Runner Migration
- Migrate unit tests from Vitest to Bun test
- Update test configuration and scripts
- Ensure test coverage reporting works
- Verify all existing tests pass

### Phase 3: Biome Migration
- Install and configure Biome
- Migrate ESLint rules to Biome equivalents
- Migrate Prettier configuration to Biome formatter
- Remove ESLint and Prettier dependencies
- Remove eslint-config-custom package

### Phase 4: CI/CD and Cleanup
- Update GitHub Actions workflows
- Remove Turborepo configuration
- Clean up unused dependencies
- Update documentation

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Bun test runner missing Vitest features | Keep Vitest as fallback if critical features missing |
| Biome missing ESLint rules | Document any rules that can't be migrated |
| CI environment compatibility | Test thoroughly in CI before merging |
| Breaking existing developer workflows | Provide migration guide in PR description |

## Dependencies

- Bun >= 1.0
- Biome >= 1.5
- Existing Playwright tests must remain functional
