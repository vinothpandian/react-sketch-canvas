/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Draw a square on canvas
     * @example
     * cy.drawSquare(100)
     */
    drawSquare(side: number): Chainable<any>;
  }
}
