## Prerequisites

[Node.js](http://nodejs.org/) >= v14.17.0 must be installed.

## Installation

- Running `yarn install` in the component's root directory will install everything you need for development.

## Demo Development Server

- Running `yarn install:example` will install the documentation site.

- `yarn watch:example` will run a documentation server with the component's demo app at [http://localhost:3000](http://localhost:3000) with hot module reloading.

## Running Tests

- Install the documentation site using `yarn install:example
- `yarn e2e:ci` will run the tests once. `yarn e2e` will start the cypress test server.

## Building

- `yarn build:prod` will build the component for publishing to npm.
