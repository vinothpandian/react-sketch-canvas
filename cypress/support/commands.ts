import '@testing-library/cypress/add-commands';

Cypress.Commands.add('drawSquare', function (side: number) {
  cy.findByRole('presentation', { name: /react\-sketch\-canvas/i }).then(
    ($canvas) => {
      const x = $canvas.offset().left;
      const y = $canvas.offset().top;

      cy.findByRole('presentation', { name: /react\-sketch\-canvas/i })
        .trigger('pointerdown', {
          which: 1,
          pageX: x + side,
          pageY: y + side,
        })
        .trigger('pointermove', { pageX: x + side, pageY: y + side * 2 })
        .trigger('pointermove', { pageX: x + side * 2, pageY: y + side * 2 })
        .trigger('pointermove', { pageX: x + side * 2, pageY: y + side })
        .trigger('pointermove', { pageX: x + side, pageY: y + side })
        .trigger('pointerup', { force: true });
    }
  );
});
