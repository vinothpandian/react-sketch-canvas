/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    drawSquare(
      side: number,
      originX?: number,
      originY?: number
    ): Chainable<any>;
    drawLine(
      length: number,
      originX?: number,
      originY?: number
    ): Chainable<any>;
    getCanvas(): Chainable<any>;
    convertDataURIToKiloBytes(): Chainable<number>;
  }
}
