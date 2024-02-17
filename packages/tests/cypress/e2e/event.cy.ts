// noinspection DuplicatedCode

import { ReactSketchCanvasProps } from "react-sketch-canvas";

let defaultProps: Partial<ReactSketchCanvasProps>;
let canvasPathWithEraser: CanvasPath;
let canvasPathWithOnlyPen: CanvasPath;

let firstStrokeGroupId: string;
let eraserStrokeGroupId: string;
let firstEraserMask: string;
let firstEraserMaskId: string;
let canvasBackgroundId: string;

const exportedImageId = "#exported-image";
const exportedSvgId = "#exported-svg";

before(() => {
  cy.fixture("props.json").then((props: Partial<ReactSketchCanvasProps>) => {
    defaultProps = props;
    firstStrokeGroupId = `#${props.id}__stroke-group-0`;
    canvasBackgroundId = `#${props.id}__canvas-background`;
    eraserStrokeGroupId = `#${props.id}__eraser-stroke-group`;
    firstEraserMaskId = `${props.id}__eraser-mask-0`;
    firstEraserMask = `mask#${firstEraserMaskId}`;
  });

  cy.fixture("canvasPath/onlyPen.json").then((onlyPen) => {
    canvasPathWithOnlyPen = onlyPen;
  });
  cy.fixture("canvasPath/withEraser.json").then((withEraser) => {
    canvasPathWithEraser = withEraser;
  });
});

beforeEach(() => {
  cy.visit("/");
});

describe("loadPaths", () => {
  it("should load path with only pen", () => {
    cy.getCanvas().find("path").should("not.exist");

    cy.findByRole("textbox", { name: /paths to load/i })
      .clear()
      .type(JSON.stringify(canvasPathWithOnlyPen), {
        parseSpecialCharSequences: false,
        delay: 0,
      });

    cy.findByRole("button", { name: /load paths/i }).click();
    cy.getCanvas().find("path").should("have.length", 1);
  });

  it("should load path with pen and eraser", () => {
    cy.getCanvas().find("path").should("not.exist");

    cy.findByRole("textbox", { name: /paths to load/i })
      .clear()
      .type(JSON.stringify(canvasPathWithEraser), {
        parseSpecialCharSequences: false,
        delay: 0,
      });

    cy.findByRole("button", { name: /load paths/i }).click();
    cy.getCanvas().find("path").should("have.length", 2);
    cy.get(eraserStrokeGroupId).find("path").should("have.length", 1);
    cy.get(firstEraserMask).find("use").should("have.length", 2); // background + one mask path
  });
});
