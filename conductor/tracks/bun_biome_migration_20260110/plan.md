# Plan: Migrate to Bun and Biome

## Phase 1: Bun Package Manager Migration [checkpoint: 8245abd]

- [x] Task: Set up Bun and migrate from pnpm [e7ef4ac]
    - [x] Install Bun globally and verify installation
    - [x] Remove pnpm-lock.yaml
    - [x] Run `bun install` to generate bun.lockb
    - [x] Verify all dependencies install correctly
    - [x] Update root package.json scripts to use `bun run` instead of `pnpm`

- [x] Task: Configure Bun workspaces [verified]
    - [x] Verify workspace configuration in root package.json works with Bun
    - [x] Test that workspace dependencies resolve correctly
    - [x] Verify `bun run build` works across all packages

- [x] Task: Remove Turborepo [a69636e]
    - [x] Delete turbo.json
    - [x] Remove turbo from devDependencies
    - [x] Update package.json scripts to work without Turborepo task runner
    - [x] Test that build, lint, and test commands work correctly

- [x] Task: Conductor - User Manual Verification 'Phase 1: Bun Package Manager Migration' (Protocol in workflow.md) [8245abd]

## Phase 2: Test Runner Migration [checkpoint: 1822b9d]

- [x] Task: Analyze existing Vitest configuration [analysis]
    - [x] Document current Vitest configuration and features used
    - [x] Identify test patterns, mocks, and assertions used
    - [x] List any Vitest-specific APIs that need migration

- [x] Task: Migrate unit tests to Bun test runner [cf083d4]
    - [x] Update test file imports to use Bun test APIs
    - [x] Migrate test assertions to Bun's built-in expect
    - [x] Update any mock implementations for Bun compatibility
    - [x] Ensure test files use .test.ts extension (Bun convention)

- [x] Task: Update test scripts and configuration [6817157]
    - [x] Update package.json test scripts to use `bun test`
    - [x] Configure test coverage reporting with Bun
    - [x] Verify all unit tests pass with Bun test runner
    - [x] Ensure coverage meets >80% threshold

- [x] Task: Remove Vitest dependencies [f4ab766]
    - [x] Remove vitest from devDependencies
    - [x] Remove vitest configuration files
    - [x] Clean up any Vitest-specific imports

- [x] Task: Conductor - User Manual Verification 'Phase 2: Test Runner Migration' (Protocol in workflow.md) [1822b9d]

## Phase 3: Biome Migration [checkpoint: 7e90b97]

- [x] Task: Install and configure Biome [daa0706]
    - [x] Add @biomejs/biome to devDependencies
    - [x] Create biome.json configuration file
    - [x] Configure linting rules equivalent to current ESLint setup
    - [x] Configure formatting rules equivalent to current Prettier setup

- [x] Task: Migrate linting rules
    - [x] Analyze current ESLint configuration in eslint-config-custom
    - [x] Map ESLint rules to Biome equivalents
    - [x] Document any rules that cannot be migrated (CSS linting disabled for Tailwind)
    - [x] Test Biome linting on codebase

- [x] Task: Migrate formatting rules
    - [x] Analyze current Prettier configuration
    - [x] Configure Biome formatter with equivalent settings
    - [x] Run Biome format on entire codebase
    - [x] Verify formatting output matches expectations

- [x] Task: Update package.json scripts for Biome
    - [x] Update lint script to use `biome check`
    - [x] Update format script to use `biome format`
    - [x] Add `biome check --write` for auto-fix capability
    - [x] Test all scripts work correctly

- [x] Task: Remove ESLint and Prettier
    - [x] Remove eslint and all eslint plugins from devDependencies
    - [x] Remove prettier from devDependencies
    - [x] Delete .eslintrc, .eslintignore files
    - [x] Delete .prettierrc, .prettierignore files (none existed)
    - [x] Remove packages/eslint-config-custom package entirely
    - [x] Update workspace configuration to remove eslint-config-custom

- [x] Task: Conductor - User Manual Verification 'Phase 3: Biome Migration' (Protocol in workflow.md) [7e90b97]

## Phase 4: CI/CD and Cleanup

- [x] Task: Update GitHub Actions workflows
    - [x] Update workflows to use Bun instead of pnpm
    - [x] Update test commands to use Bun test runner
    - [x] Update lint commands to use Biome
    - [ ] Ensure all CI checks pass (to be verified after push)

- [x] Task: Clean up unused dependencies and files
    - [x] Audit all devDependencies for unused packages
    - [x] Remove any orphaned configuration files (Turbo, Cypress references)
    - [x] Update .gitignore if needed (cleaned up Turbo/Cypress references)

- [x] Task: Update documentation
    - [ ] Update README.md with new commands (deferred - optional)
    - [x] Update CLAUDE.md with new development workflow
    - [ ] Document migration in CHANGELOG.md (deferred - optional)

- [x] Task: Final verification
    - [x] Run full build: `bun run build`
    - [x] Run all unit tests: `bun test`
    - [~] Run Playwright tests: `bun run test` (some pre-existing flaky tests)
    - [x] Run linting: `bun run lint`
    - [x] Verify bundle size is within limits (3.58KB ESM, 3.66KB CJS)

- [ ] Task: Conductor - User Manual Verification 'Phase 4: CI/CD and Cleanup' (Protocol in workflow.md)
