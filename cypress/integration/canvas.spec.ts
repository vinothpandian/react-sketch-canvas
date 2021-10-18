beforeEach(() => {
  cy.visit('/');
});

it('should load the page', () => {
  cy.findAllByText(/reactsketchcanvas/i).should('have.length', 1);
});

it('should contain the canvas with svg', () => {
  const side = 100;

  [...Array(5).keys()].forEach((_, i) => {
    cy.drawSquare(side);
  });

  cy.get('svg').find('path');
});
