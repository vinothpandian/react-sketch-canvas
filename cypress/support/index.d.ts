/// <reference types="cypress" />

declare namespace Cypress {
  type PointerEventType = 'pointer' | 'touch' | 'mouse';

  interface Chainable<Subject> {
    drawSquare(
      side: number,
      originX?: number,
      originY?: number,
      eventType?: PointerEventType
    ): Chainable<any>;
    drawLine(
      length: number,
      originX?: number,
      originY?: number,
      eventType?: PointerEventType
    ): Chainable<any>;
    getCanvas(): Chainable<any>;
    convertDataURIToKiloBytes(): Chainable<number>;
  }
}
