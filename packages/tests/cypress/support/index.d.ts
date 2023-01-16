/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="cypress" />

declare namespace Cypress {
  type PointerEventType = "pen" | "touch" | "mouse";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    drawPoint(
      originX?: number,
      originY?: number,
      eventType?: PointerEventType
    ): Chainable<any>;

    getCanvas(): Chainable<any>;

    convertDataURIToKiloBytes(): Chainable<number>;

    CssStyleToObject(): Chainable<object>;

    StringToObject(): Chainable<object>;
  }
}
