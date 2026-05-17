import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReactSketchCanvas } from "../../src";

describe("ReactSketchCanvas", () => {
  it("renders an svg canvas with the provided id", () => {
    render(<ReactSketchCanvas id="unit-canvas" width="320px" height="180px" />);

    const canvas = document.querySelector("svg#unit-canvas");

    expect(canvas).toBeInstanceOf(SVGElement);
    expect(canvas?.parentElement?.getAttribute("style")).toContain(
      "width: 320px",
    );
    expect(canvas?.parentElement?.getAttribute("style")).toContain(
      "height: 180px",
    );
  });
});
