import '@testing-library/cypress/add-commands';

Cypress.Commands.add('getCanvas', function () {
  return cy.findByRole('presentation', { name: /react\-sketch\-canvas/i });
});

Cypress.Commands.add(
  'drawSquare',
  function (
    side: number,
    originX: number = 0,
    originY: number = 0,
    eventType: Cypress.PointerEventType = 'pointer'
  ) {
    cy.findByRole('presentation', { name: /react\-sketch\-canvas/i }).then(
      ($canvas) => {
        const x = $canvas.offset().left + originX;
        const y = $canvas.offset().top + originY;

        cy.wrap($canvas)
          .trigger(`${eventType}down`, { which: 1, pageX: x, pageY: y })
          .trigger(`${eventType}move`, { pageX: x, pageY: y + side })
          .trigger(`${eventType}move`, { pageX: x + side, pageY: y + side })
          .trigger(`${eventType}move`, { pageX: x + side, pageY: y })
          .trigger(`${eventType}move`, { pageX: x, pageY: y })
          .trigger(`${eventType}up`, { force: true });
      }
    );
  }
);

Cypress.Commands.add(
  'drawLine',
  function (
    length: number,
    originX: number = 0,
    originY: number = 0,
    eventType: Cypress.PointerEventType = 'pointer'
  ) {
    cy.findByRole('presentation', { name: /react\-sketch\-canvas/i }).then(
      ($canvas) => {
        const x = $canvas.offset().left + originX;
        const y = $canvas.offset().top + originY;

        cy.wrap($canvas)
          .trigger(`${eventType}down`, { which: 1, pageX: x, pageY: y })
          .trigger(`${eventType}move`, { pageX: x + length, pageY: y + length })
          .trigger(`${eventType}up`, { force: true });
      }
    );
  }
);

Cypress.Commands.add(
  'convertDataURIToKiloBytes',
  { prevSubject: true },
  function (subject) {
    const base64str = subject.split('base64,')[1];
    const decoded = atob(base64str);
    const fileSizeInKB = Math.floor(decoded.length / 1024);
    return cy.wrap(fileSizeInKB);
  }
);
