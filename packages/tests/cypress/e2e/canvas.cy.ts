beforeEach(() => {
  cy.visit("/");
});

it("should contain the canvas with svg", () => {
  const side = 300;
  const strokeCount = 4;

  Cypress._.range(strokeCount).forEach(() => {
    cy.drawSquare({ side });
  });

  cy.get("svg").find("path").should("have.length", strokeCount);
});
