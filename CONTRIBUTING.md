## Prerequisites

- [Node.js](http://nodejs.org/) >= 22.13.0
- [pnpm](https://pnpm.io/) >= 11.0.0

## Installation

- Run `pnpm install` to install all project and workspace dependencies.

## Demo & Documentation Development Server

- Run `pnpm dev` to start the docs development server.
- Open `http://localhost:5173/` in your browser (basename is `/` in development).

## Running Tests

- Run `pnpm test:unit` to run unit tests (Vitest).
- Run `pnpm test:ct` to run Playwright component tests.
- Run `pnpm test:e2e` to run Playwright end-to-end browser tests.
- Or run `pnpm test` to run all tests sequentially.

## Linting & Formatting

- Run `pnpm lint` to check for linting and formatting issues (Biome).
- Run `pnpm format` to automatically format the codebase.

## Building

- Run `pnpm build` to compile the library and build the documentation site.

