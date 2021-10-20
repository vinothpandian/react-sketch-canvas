import '@testing-library/cypress/add-commands';

Cypress.Commands.add('getCanvas', function () {
  return cy.findByRole('presentation', { name: /react\-sketch\-canvas/i });
});

Cypress.Commands.add(
  'drawSquare',
  function (side: number, originX: number = 0, originY: number = 0) {
    cy.findByRole('presentation', { name: /react\-sketch\-canvas/i }).then(
      ($canvas) => {
        const x = $canvas.offset().left + originX;
        const y = $canvas.offset().top + originY;

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
  }
);

Cypress.Commands.add(
  'drawLine',
  function (length: number, originX: number = 0, originY: number = 0) {
    cy.findByRole('presentation', { name: /react\-sketch\-canvas/i }).then(
      ($canvas) => {
        const x = $canvas.offset().left + originX;
        const y = $canvas.offset().top + originY;

        cy.findByRole('presentation', { name: /react\-sketch\-canvas/i })
          .trigger('pointerdown', { which: 1, pageX: x, pageY: y })
          .trigger('pointermove', { pageX: x + length, pageY: y + length })
          .trigger('pointerup', { force: true });
      }
    );
  }
);
