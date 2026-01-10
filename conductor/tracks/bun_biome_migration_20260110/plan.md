# Plan: Migrate to Bun and Biome

## Phase 1: Bun Package Manager Migration

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

- [~] Task: Remove Turborepo
    - [x] Delete turbo.json
    - [x] Remove turbo from devDependencies
    - [x] Update package.json scripts to work without Turborepo task runner
    - [x] Test that build, lint, and test commands work correctly

- [ ] Task: Conductor - User Manual Verification 'Phase 1: Bun Package Manager Migration' (Protocol in workflow.md)

## Phase 2: Test Runner Migration

- [ ] Task: Analyze existing Vitest configuration
    - [ ] Document current Vitest configuration and features used
    - [ ] Identify test patterns, mocks, and assertions used
    - [ ] List any Vitest-specific APIs that need migration

- [ ] Task: Migrate unit tests to Bun test runner
    - [ ] Update test file imports to use Bun test APIs
    - [ ] Migrate test assertions to Bun's built-in expect
    - [ ] Update any mock implementations for Bun compatibility
    - [ ] Ensure test files use .test.ts extension (Bun convention)

- [ ] Task: Update test scripts and configuration
    - [ ] Update package.json test scripts to use `bun test`
    - [ ] Configure test coverage reporting with Bun
    - [ ] Verify all unit tests pass with Bun test runner
    - [ ] Ensure coverage meets >80% threshold

- [ ] Task: Remove Vitest dependencies
    - [ ] Remove vitest from devDependencies
    - [ ] Remove vitest configuration files
    - [ ] Clean up any Vitest-specific imports

- [ ] Task: Conductor - User Manual Verification 'Phase 2: Test Runner Migration' (Protocol in workflow.md)

## Phase 3: Biome Migration

- [ ] Task: Install and configure Biome
    - [ ] Add @biomejs/biome to devDependencies
    - [ ] Create biome.json configuration file
    - [ ] Configure linting rules equivalent to current ESLint setup
    - [ ] Configure formatting rules equivalent to current Prettier setup

- [ ] Task: Migrate linting rules
    - [ ] Analyze current ESLint configuration in eslint-config-custom
    - [ ] Map ESLint rules to Biome equivalents
    - [ ] Document any rules that cannot be migrated
    - [ ] Test Biome linting on codebase

- [ ] Task: Migrate formatting rules
    - [ ] Analyze current Prettier configuration
    - [ ] Configure Biome formatter with equivalent settings
    - [ ] Run Biome format on entire codebase
    - [ ] Verify formatting output matches expectations

- [ ] Task: Update package.json scripts for Biome
    - [ ] Update lint script to use `biome check`
    - [ ] Update format script to use `biome format`
    - [ ] Add `biome check --write` for auto-fix capability
    - [ ] Test all scripts work correctly

- [ ] Task: Remove ESLint and Prettier
    - [ ] Remove eslint and all eslint plugins from devDependencies
    - [ ] Remove prettier from devDependencies
    - [ ] Delete .eslintrc, .eslintignore files
    - [ ] Delete .prettierrc, .prettierignore files
    - [ ] Remove packages/eslint-config-custom package entirely
    - [ ] Update workspace configuration to remove eslint-config-custom

- [ ] Task: Conductor - User Manual Verification 'Phase 3: Biome Migration' (Protocol in workflow.md)

## Phase 4: CI/CD and Cleanup

- [ ] Task: Update GitHub Actions workflows
    - [ ] Update workflows to use Bun instead of pnpm
    - [ ] Update test commands to use Bun test runner
    - [ ] Update lint commands to use Biome
    - [ ] Ensure all CI checks pass

- [ ] Task: Clean up unused dependencies and files
    - [ ] Audit all devDependencies for unused packages
    - [ ] Remove any orphaned configuration files
    - [ ] Update .gitignore if needed (add bun.lockb, remove pnpm-lock.yaml)

- [ ] Task: Update documentation
    - [ ] Update README.md with new commands
    - [ ] Update CLAUDE.md with new development workflow
    - [ ] Document migration in CHANGELOG.md

- [ ] Task: Final verification
    - [ ] Run full build: `bun run build`
    - [ ] Run all unit tests: `bun test`
    - [ ] Run Playwright tests: `bun run test`
    - [ ] Run linting: `bun run lint`
    - [ ] Verify bundle size is within limits

- [ ] Task: Conductor - User Manual Verification 'Phase 4: CI/CD and Cleanup' (Protocol in workflow.md)
