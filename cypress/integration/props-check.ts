beforeEach(() => {
  cy.visit('/');
});

it('should update width on props change', () => {
  const currentWidth = '100%';
  const updatedWidth = '100px';

  cy.getCanvas()
    .should('have.attr', 'style')
    .and('include', `width: ${currentWidth}`);

  cy.findByRole('textbox', { name: /width/i }).clear().type(updatedWidth);

  cy.getCanvas()
    .should('have.attr', 'style')
    .and('include', `width: ${updatedWidth}`);
});

it('should update height on props change', () => {
  const currentHeight = '500px';
  const updatedHeight = '200px';

  cy.getCanvas()
    .should('have.attr', 'style')
    .and('include', `height: ${currentHeight}`);

  cy.findByRole('textbox', { name: /height/i })
    .clear()
    .type(updatedHeight);

  cy.getCanvas()
    .should('have.attr', 'style')
    .and('include', `height: ${updatedHeight}`);
});

it('should update className on props change', () => {
  const currentClassName = 'react-sketch-canvas';
  const updatedClassName = 'svg-canvas';

  cy.getCanvas().should('have.class', currentClassName);

  cy.findByRole('textbox', { name: /className/i })
    .clear()
    .type(updatedClassName);

  cy.getCanvas().should('have.class', updatedClassName);
});

it('should update backgroundImage on props change', () => {
  const currentBackgroundImage =
    'https://upload.wikimedia.org/wikipedia/commons/7/70/Graph_paper_scan_1600x1000_%286509259561%29.jpg';
  const updatedBackgroundImage = 'https://i.imgur.com/jx47T07.jpeg';

  cy.get('#canvas-background')
    .should('have.attr', 'fill')
    .and('equal', 'url(#background)');

  cy.get('pattern#background>image')
    .first()
    .should('have.attr', 'xlink:href')
    .and('equal', currentBackgroundImage);

  cy.findByRole('textbox', { name: 'backgroundImage', exact: true })
    .clear()
    .type(updatedBackgroundImage);

  cy.get('#canvas-background')
    .should('have.attr', 'fill')
    .and('equal', 'url(#background)');

  cy.get('pattern#background>image')
    .first()
    .should('have.attr', 'xlink:href')
    .and('equal', updatedBackgroundImage);
});
