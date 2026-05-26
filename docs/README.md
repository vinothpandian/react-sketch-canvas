# React Sketch Canvas Docs

This is the Fumadocs documentation site for `react-sketch-canvas`, built with Vite and React Router.

## Commands

Run commands from the repository root:

| Command | Action |
| :-- | :-- |
| `pnpm dev` | Start the docs dev server |
| `pnpm --filter documentation build` | Build the docs site |
| `pnpm --filter documentation preview` | Preview the built docs |

## Generated Content

The Vite build generates API reference pages from the package TSDoc and writes markdown copies of the docs pages into `docs/public`. Local development keeps the markdown copies current when docs content changes.
