beforeEach(() => {
  cy.visit('/');
});

it('should contain the canvas with svg', () => {
  const side = 100;
  const strokeCount = 4;

  Cypress._.range(strokeCount).forEach((_, i) => {
    cy.drawSquare(side);
  });

  cy.get('svg').find('path').should('have.length', strokeCount);
});
