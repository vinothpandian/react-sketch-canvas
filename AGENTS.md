# Repository Instructions

## Git And Workflow

- Always use conventional commits.
- If the branch name, spec, or ticket context includes a Linear ticket, include it in the pull request description.
- Do not change public APIs without discussing the change first. If a bug exposes a public API limitation, explain the tradeoff before changing the API.
- Keep changes scoped to the requested work. Do not revert or rewrite unrelated user changes in the working tree.

## Code Quality Expectations

- Prefer small, focused modules over large files that mix rendering, state, export, pointer handling, and utility logic.
- Extract logic into unit-testable functions or hooks when it improves readability and test coverage.
- Follow the existing package architecture and naming patterns before introducing new abstractions.
- Compose types from existing public or internal types with `Pick`, `Omit`, `Partial`, `Required`, or local aliases when that avoids repeating the same shape.
- Avoid duplicating prop shapes across components and hooks. Derive internal props from the public props where practical.
- Keep console warnings and thrown errors user friendly. Messages should explain what went wrong and what the consumer can check or change.

## TypeScript Naming

- Use `Params` as the suffix for object types that represent function arguments.
- Use `Returns` as the suffix for function return types.
- Example: `exportImageFromSvg` should accept `ExportImageFromSvgParams` and return `ExportImageFromSvgReturns`.
- Type React components and forwarded refs explicitly so generated declarations expose clear prop and ref contracts.
- Keep public prop types stable and readable for package consumers.

## Documentation

- Add TSDoc for all public code exported by the React Sketch Canvas package.
- Public TSDoc is compiled into documentation and should be written as user-facing documentation, not implementation notes.
- Public props, refs, return values, defaults, side effects, and usage constraints should be documented thoroughly.
- Add developer-facing comments or TSDoc for internal extracted logic when it clarifies non-obvious state transitions, SVG rendering behavior, export behavior, pointer handling, or browser constraints.
- Do not add comments that merely restate obvious code.

## Testing Expectations

- Add or update unit tests when extracting logic into testable functions or hooks.
- Use Testing Library for React hooks and component-facing behavior.
- Cover critical paths and edge cases without creating excessive tests.
- Prefer deterministic assertions. Avoid exact floating-point string assertions; assert stable structure, rounded values, or use approximate numeric checks where appropriate.
- Critical extracted logic should have focused coverage for:
  - pointer filtering, pointer normalization, and document-level pointer release;
  - SVG grouping, eraser masks, and export preparation;
  - image export error paths and background handling;
  - sketch state history, undo/redo boundaries, reset, clear, and loaded paths;
  - imperative ref methods and hook contracts.
- Run the relevant package verification before claiming work is complete. For broad package changes, prefer:
  - `pnpm --filter react-sketch-canvas format`
  - `pnpm --filter react-sketch-canvas lint`
  - `pnpm --filter react-sketch-canvas build`
  - `pnpm --filter react-sketch-canvas test:unit`
  - `pnpm --filter react-sketch-canvas test:ct`
  - `pnpm --filter react-sketch-canvas test:e2e`
