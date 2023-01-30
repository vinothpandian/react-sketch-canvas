/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="cypress" />

declare namespace Cypress {
  type PointerEventType = "pen" | "touch" | "mouse";

  interface DrawSquareArgs {
    side: number;
    originX?: number;
    originY?: number;
    pointerType?: PointerEventType;
    eventButton?: 0 | 1 | 2 | 3 | 4;
    eventButtons?: number;
  }

  interface DrawLineArgs extends Omit<DrawSquareArgs, "side"> {
    length: number;
  }

  type DrawPointArgs = Omit<DrawSquareArgs, "side">;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    drawSquare(args: DrawSquareArgs): Chainable<any>;

    drawLine(args: DrawLineArgs): Chainable<any>;

    drawPoint(args: DrawPointArgs): Chainable<any>;

    getCanvas(): Chainable<any>;

    convertDataURIToKiloBytes(): Chainable<number>;

    CssStyleToObject(): Chainable<object>;

    StringToObject(): Chainable<object>;
  }
}
