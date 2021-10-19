/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    drawSquare(side: number): Chainable<any>;
    getCanvas(): Chainable<any>;
  }
}
