beforeEach(() => {
  cy.visit('/');
  cy.findByRole('presentation', { name: /react\-sketch\-canvas/i }).then(
    ($canvas) => {
      const x = $canvas.offset().left;
      const y = $canvas.offset().top;

      cy.wrap({ x, y }).as('bounds');
    }
  );
});

it('should load the page', () => {
  cy.findAllByText(/reactsketchcanvas/i).should('have.length', 1);
});

it('should contain the canvas with svg', () => {
  cy.get<{ x: number; y: number }>('@bounds').then(({ x, y }) => {
    [...Array(5).keys()].forEach((_, i) => {
      cy.findByRole('presentation', { name: /react\-sketch\-canvas/i })
        .trigger('pointerdown', { which: 1, pageX: x + 100, pageY: y + 100 })
        .trigger('pointermove', { which: 1, pageX: x + 100, pageY: y + 200 })
        .trigger('pointermove', { which: 1, pageX: x + 200, pageY: y + 200 })
        .trigger('pointermove', { which: 1, pageX: x + 200, pageY: y + 100 })
        .trigger('pointermove', { which: 1, pageX: x + 100, pageY: y + 100 })
        .trigger('pointerup', { force: true });
    });
  });

  cy.get('svg').find('path');
});
