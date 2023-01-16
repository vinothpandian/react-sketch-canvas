// noinspection DuplicatedCode

import { ReactSketchCanvasProps } from "react-sketch-canvas";

let defaultProps: Partial<ReactSketchCanvasProps>;
let backgroundImagePatternId: string;
let backgroundFill: string;
let firstStrokeGroupId: string;
let eraserStrokeGroupId: string;

let firstCircleId: string;
let canvasBackgroundId: string;
let firstEraserCircleId: string;

const exportedSvgId = "#exported-svg";
const exportedImageId = "#exported-image";
const sketchingTimeId = "#sketchingTime";

before(() => {
  cy.fixture("props.json").then((props: Partial<ReactSketchCanvasProps>) => {
    defaultProps = props;
    canvasBackgroundId = `#${props.id}__canvas-background`;
    backgroundImagePatternId = `pattern#${props.id}__background image`;
    backgroundFill = `url(#${props.id}__background)`;
    firstStrokeGroupId = `#${props.id}__stroke-group-0`;
    eraserStrokeGroupId = `#${props.id}__eraser-stroke-group`;

    firstCircleId = `circle#${props.id}__0`;
    firstEraserCircleId = `circle#${props.id}__eraser-0`;
  });
});

beforeEach(() => {
  cy.visit("/");
});

it("should update width on props change", () => {
  const updatedWidth = "100px";

  cy.getCanvas()
    .should("have.attr", "style")
    .and("include", `width: ${defaultProps.width}`);

  cy.findByRole("textbox", { name: /width/i }).clear().type(updatedWidth);

  cy.getCanvas()
    .should("have.attr", "style")
    .and("include", `width: ${updatedWidth}`);
});

it("should update height on props change", () => {
  const updatedHeight = "200px";

  cy.getCanvas()
    .should("have.attr", "style")
    .and("include", `height: ${defaultProps.height}`);

  cy.findByRole("textbox", { name: /height/i })
    .clear()
    .type(updatedHeight);

  cy.getCanvas()
    .should("have.attr", "style")
    .and("include", `height: ${updatedHeight}`);
});

it("should update className on props change", () => {
  const updatedClassName = "svg-canvas";

  cy.getCanvas().should("have.class", defaultProps.className);

  cy.findByRole("textbox", { name: /className/i })
    .clear()
    .type(updatedClassName);

  cy.getCanvas().should("have.class", updatedClassName);
});

it("should update backgroundImage on props change", () => {
  const updatedBackgroundImage = "https://i.imgur.com/jx47T07.jpeg";

  cy.get(canvasBackgroundId).should("have.attr", "fill", backgroundFill);

  cy.get(backgroundImagePatternId)
    .as("backgroundImage")
    .should("have.attr", "xlink:href", defaultProps.backgroundImage);

  cy.findByRole("textbox", { name: "backgroundImage", exact: true })
    .clear()
    .type(updatedBackgroundImage);

  cy.get(canvasBackgroundId).should("have.attr", "fill", backgroundFill);
  cy.get("@backgroundImage").should(
    "have.attr",
    "xlink:href",
    updatedBackgroundImage
  );
});

it("should update preserveAspectRatio of the background image", () => {
  const updatedPreserveAspectRatio = "xMidYMid meet";

  cy.get(backgroundImagePatternId)
    .as("backgroundImage")
    .should(
      "have.attr",
      "preserveAspectRatio",
      defaultProps.preserveBackgroundImageAspectRatio
    );

  cy.findByRole("textbox", {
    name: /preserveBackgroundImageAspectRatio/i,
  })
    .clear()
    .type(updatedPreserveAspectRatio);

  cy.get("@backgroundImage").should(
    "have.attr",
    "preserveAspectRatio",
    updatedPreserveAspectRatio
  );
});

it("should change stroke width", () => {
  const updatedStrokeWidth = "8";

  cy.drawLine({ length: 100, originX: 100, originY: 100 });
  cy.get(firstStrokeGroupId)
    .find("path")
    .first()
    .should("have.attr", "stroke-width", defaultProps.strokeWidth.toString());

  cy.findByRole("spinbutton", { name: /strokeWidth/i })
    .clear()
    .type(updatedStrokeWidth);

  cy.drawLine({ length: 50, originX: 50, originY: 100 });
  cy.get(firstStrokeGroupId)
    .find("path")
    .last()
    .should("have.attr", "stroke-width", updatedStrokeWidth);
});

it("should change eraser width", () => {
  const updatedEraserWidth = "8";
  cy.findByRole("button", { name: /eraser/i }).click();
  cy.drawLine({ length: 100, originX: 100, originY: 100 });
  cy.get(eraserStrokeGroupId)
    .find("path")
    .first()
    .should("have.attr", "stroke-width", defaultProps.eraserWidth.toString());

  cy.findByRole("spinbutton", { name: /eraserWidth/i })
    .clear()
    .type(updatedEraserWidth);

  cy.drawLine({ length: 50, originX: 50, originY: 100 });
  cy.get(eraserStrokeGroupId)
    .find("path")
    .last()
    .should("have.attr", "stroke-width", updatedEraserWidth);
});

it("should change stroke color", () => {
  const updatedStrokeColor = "#FF0000";
  cy.drawLine({ length: 100, originX: 100, originY: 100 });
  cy.get(firstStrokeGroupId)
    .find("path")
    .first()
    .should("have.attr", "stroke", defaultProps.strokeColor);

  cy.findByLabelText(/strokeColor/i)
    .focus()
    .invoke("val", updatedStrokeColor)
    .trigger("change");

  cy.drawLine({ length: 50, originX: 50, originY: 100 });
  cy.get(firstStrokeGroupId)
    .find("path")
    .last()
    .should("have.attr", "stroke", updatedStrokeColor.toLowerCase());
});

it("should change canvas color", () => {
  cy.get(canvasBackgroundId).should("have.attr", "fill", backgroundFill);

  const updatedCanvasColor = "#FF0000";
  cy.findByLabelText(/canvasColor/i)
    .focus()
    .invoke("val", updatedCanvasColor)
    .trigger("change");

  cy.get(canvasBackgroundId).should(
    "have.attr",
    "fill",
    updatedCanvasColor.toLowerCase()
  );
});

describe("exportWithBackgroundImage", () => {
  it("should export svg with background when enabled and canvas color background when disabled", () => {
    cy.findByRole("button", { name: /export svg/i }).click();

    cy.get(`${exportedSvgId} ${canvasBackgroundId}`)
      .as("exportedCanvasBackground")
      .should("have.attr", "fill", backgroundFill);

    cy.get(`${exportedSvgId} ${backgroundImagePatternId}`).should(
      "have.attr",
      "xlink:href",
      defaultProps.backgroundImage
    );

    cy.findByRole("switch", { name: /exportWithBackgroundImage/i }).click();

    cy.findByRole("button", { name: /export svg/i }).click();
    cy.get("@exportedCanvasBackground").should(
      "have.attr",
      "fill",
      defaultProps.canvasColor
    );
  });

  it("should export png with background when enabled and canvas color background when disabled", () => {
    cy.findByRole("button", { name: /export image/i }).click();

    cy.get(exportedImageId)
      .should("have.attr", "src")
      .and("match", /^data:image\/png;base64/i)
      .convertDataURIToKiloBytes()
      .as("fileSizeWithExportedImage");

    cy.findByRole("switch", { name: /exportWithBackgroundImage/i }).click();

    cy.findByRole("button", { name: /export image/i }).click();

    cy.get(exportedImageId)
      .should("have.attr", "src")
      .and("match", /^data:image\/png;base64/i)
      .convertDataURIToKiloBytes()
      .then((fileSizeWithoutExportedImage) => {
        cy.get("@fileSizeWithExportedImage").should(
          "not.be.lessThan",
          fileSizeWithoutExportedImage
        );
      });
  });

  it("should export jpeg with background when enabled and canvas color background when disabled", () => {
    cy.findByRole("radio", { name: /jpeg/i }).click();
    cy.findByRole("button", { name: /export image/i }).click();

    cy.get(exportedImageId)
      .should("have.attr", "src")
      .and("match", /^data:image\/jpeg;base64/i)
      .convertDataURIToKiloBytes()
      .as("fileSizeWithExportedImage");

    cy.findByRole("switch", { name: /exportWithBackgroundImage/i }).click();

    cy.findByRole("button", { name: /export image/i }).click();

    cy.get(exportedImageId)
      .should("have.attr", "src")
      .and("match", /^data:image\/jpeg;base64/i)
      .convertDataURIToKiloBytes()
      .then((fileSizeWithoutExportedImage) => {
        cy.get("@fileSizeWithExportedImage").should(
          "not.be.lessThan",
          fileSizeWithoutExportedImage
        );
      });
  });
});

it("should throw exception when attempted to get sketching time when withTimestamp is disabled", () => {
  const getSketchingTimeInString = (sketchingTime: number): string =>
    `${(sketchingTime / 1000).toFixed(3)} sec`;

  const initialTime = 0;
  cy.get(sketchingTimeId)
    .as("sketchingTimeContainer")
    .should("contain.text", getSketchingTimeInString(initialTime));

  cy.drawSquare({ side: 100 });
  cy.findByRole("button", { name: /get sketching time/i }).click();

  cy.get("@sketchingTimeContainer").then(($sketchingTimeContainer) => {
    const sketchingTime = Number($sketchingTimeContainer.text().slice(0, 5));
    expect(sketchingTime).to.be.greaterThan(0);
  });

  cy.findByRole("switch", { name: /withTimestamp/i }).click();

  cy.drawSquare({ side: 100, originX: 200, originY: 200 });
  cy.findByRole("button", { name: /get sketching time/i }).click();
  cy.get("@sketchingTimeContainer").should(
    "contain.text",
    getSketchingTimeInString(initialTime)
  );
});

describe("allowOnlyPointerType", () => {
  it("should allow sketching with mouse, touch, and stylus when allowOnlyPointerType is set as all", () => {
    cy.drawLine({ length: 50, originX: 0, originY: 10, pointerType: "mouse" });
    cy.drawLine({
      length: 100,
      originX: 50,
      originY: 10,
      pointerType: "touch",
    });
    cy.drawLine({ length: 200, originX: 100, originY: 10, pointerType: "pen" });

    cy.get(firstStrokeGroupId).find("path").should("have.length", 3);
  });

  it("should allow sketching only with mouse when allowOnlyPointerType is set as mouse", () => {
    cy.findByRole("radio", { name: /mouse/i }).click();

    cy.drawLine({ length: 50, originX: 0, originY: 10, pointerType: "mouse" });
    cy.get(firstStrokeGroupId).find("path").should("have.length", 1);
    cy.drawLine({
      length: 100,
      originX: 50,
      originY: 10,
      pointerType: "touch",
    });
    cy.drawLine({ length: 200, originX: 100, originY: 10, pointerType: "pen" });

    cy.get(firstStrokeGroupId).find("path").should("have.length", 1);
  });

  it("should allow sketching only with touch when allowOnlyPointerType is set as touch", () => {
    cy.findByRole("radio", { name: /touch/i }).click();

    cy.drawLine({ length: 50, originX: 0, originY: 10, pointerType: "touch" });
    cy.get(firstStrokeGroupId).find("path").should("have.length", 1);
    cy.drawLine({
      length: 100,
      originX: 50,
      originY: 10,
      pointerType: "mouse",
    });
    cy.drawLine({ length: 200, originX: 100, originY: 10, pointerType: "pen" });

    cy.get(firstStrokeGroupId).find("path").should("have.length", 1);
  });

  it("should allow sketching only with pen when allowOnlyPointerType is set as pen", () => {
    cy.findByRole("radio", { name: /pen/i }).click();

    cy.drawLine({ length: 50, originX: 0, originY: 10, pointerType: "pen" });
    cy.get(firstStrokeGroupId).find("path").should("have.length", 1);
    cy.drawLine({
      length: 100,
      originX: 50,
      originY: 10,
      pointerType: "mouse",
    });
    cy.drawLine({
      length: 200,
      originX: 100,
      originY: 10,
      pointerType: "touch",
    });

    cy.get(firstStrokeGroupId).find("path").should("have.length", 1);
  });
});

it("should call onChange when a new stroke or eraser is added", () => {
  cy.get("#paths")
    .as("pathsContainer")
    .should("have.text", "Sketch to get paths");

  cy.drawLine({ length: 50, originX: 0, originY: 10, pointerType: "pen" });
  cy.get("@pathsContainer").then(($pathsContainer) => {
    const paths = JSON.parse($pathsContainer.text());
    expect(paths).to.have.length(1);
    expect(paths.pop()).to.have.property("drawMode", true);
  });

  cy.findByRole("button", { name: /eraser/i }).click();
  cy.drawLine({ length: 50, originX: 0, originY: 10, pointerType: "pen" });
  cy.get("@pathsContainer").then(($pathsContainer) => {
    const paths = JSON.parse($pathsContainer.text());
    expect(paths).to.have.length(2);
    expect(paths.pop()).to.have.property("drawMode", false);
  });
});

it("should update style", () => {
  const updatedStyle = {
    border: "10px solid red",
    outline: "10px solid green",
  };

  cy.getCanvas()
    .should("have.attr", "style")
    .CssStyleToObject()
    .and(
      "have.any.key",
      Object.keys(defaultProps.style).map(Cypress._.kebabCase)
    );

  cy.findByRole("textbox", { name: "style", exact: true })
    .clear()
    .type(JSON.stringify(updatedStyle), {
      parseSpecialCharSequences: false,
      delay: 0,
    });

  cy.getCanvas()
    .should("have.attr", "style")
    .CssStyleToObject()
    .and(
      "not.have.any.keys",
      Object.keys(defaultProps.style).map(Cypress._.kebabCase)
    )
    .and("have.any.keys", Object.keys(updatedStyle).map(Cypress._.kebabCase));
});

it("should update SVG style", () => {
  const updatedStyle = {
    background: "red",
  };

  cy.findByRole("textbox", { name: "SVG style" })
    .clear()
    .type(JSON.stringify(updatedStyle), {
      parseSpecialCharSequences: false,
      delay: 0,
    });

  cy.getCanvas()
    .find("svg")
    .should("have.attr", "style")
    .CssStyleToObject()
    .and("have.any.keys", Object.keys(updatedStyle).map(Cypress._.kebabCase));
});

describe("onStroke", () => {
  it.only("should return the last stroke", () => {
    cy.drawLine({ length: 200, originX: 10, originY: 20, pointerType: "pen" });

    cy.findByRole("textbox", { name: /last stroke:pen/i })
      .StringToObject()
      .then((canvaspath) => {
        expect(canvaspath).has.property("drawMode", true);
        expect(canvaspath).has.deep.property("paths", [
          { x: 10, y: 20 },
          { x: 210, y: 220 },
        ]);
      });

    cy.drawLine({ length: 100, originX: 0, originY: 0, pointerType: "pen" });

    cy.findByRole("textbox", { name: /last stroke:pen/i })
      .StringToObject()
      .then((canvaspath) => {
        expect(canvaspath).has.property("drawMode", true);
        expect(canvaspath).has.deep.property("paths", [
          { x: 0, y: 0 },
          { x: 100, y: 100 },
        ]);
      });
  });

  it("should return the last eraser stroke", () => {
    cy.drawLine({ length: 200, originX: 10, originY: 20, pointerType: "pen" });

    cy.findByRole("textbox", { name: /last stroke:pen/i })
      .StringToObject()
      .then((canvaspath) => {
        expect(canvaspath).has.property("drawMode", true);
        expect(canvaspath).has.deep.property("paths", [
          { x: 10, y: 20 },
          { x: 210, y: 220 },
        ]);
      });

    cy.findByRole("button", { name: /eraser/i }).click();
    cy.drawLine({ length: 100, originX: 0, originY: 0, pointerType: "pen" });

    cy.findByRole("textbox", { name: /last stroke:eraser/i })
      .StringToObject()
      .then((canvaspath) => {
        expect(canvaspath).has.property("drawMode", false);
        expect(canvaspath).has.deep.property("paths", [
          { x: 0, y: 0 },
          { x: 100, y: 100 },
        ]);
      });
  });
});

describe("point", () => {
  it("should create a point with circle on single point stroke", () => {
    const originX = 10;
    const originY = 20;
    cy.drawPoint({ originX, originY });

    cy.getCanvas()
      .find(firstCircleId)
      .should("have.attr", "r", defaultProps.strokeWidth / 2)
      .should("have.attr", "cx", originX)
      .should("have.attr", "cy", originY);
  });

  it("should create a eraser point with circle on single point erase", () => {
    const originX = 10;
    const originY = 20;

    cy.drawPoint({ originX, originY });
    cy.findByRole("button", { name: /eraser/i }).click();
    cy.drawPoint({ originX, originY });

    cy.getCanvas()
      .find(firstEraserCircleId)
      .should("have.attr", "r", defaultProps.eraserWidth / 2)
      .should("have.attr", "cx", originX)
      .should("have.attr", "cy", originY);
  });
});
