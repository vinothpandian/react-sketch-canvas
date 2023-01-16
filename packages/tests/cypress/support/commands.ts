import "@testing-library/cypress/add-commands";

Cypress.Commands.add("getCanvas", () => cy.findByRole("presentation"));

Cypress.Commands.add(
  "drawSquare",
  ({
    side,
    originX = 0,
    originY = 0,
    pointerType = "pen",
    eventButton = 0,
    eventButtons = 1,
  }) => {
    cy.findByRole("presentation").then(($canvas) => {
      const x = $canvas.offset().left + originX;
      const y = $canvas.offset().top + originY;

      cy.wrap($canvas)
        .trigger("pointerdown", {
          pointerType,
          button: eventButton,
          buttons: eventButtons,
          pageX: x,
          pageY: y,
        })
        .trigger("pointermove", {
          pointerType,
          button: eventButton,
          buttons: eventButtons,
          pageX: x,
          pageY: y + side,
        })
        .trigger("pointermove", {
          pointerType,
          button: eventButton,
          buttons: eventButtons,
          pageX: x + side,
          pageY: y + side,
        })
        .trigger("pointermove", {
          pointerType,
          button: eventButton,
          buttons: eventButtons,
          pageX: x + side,
          pageY: y,
        })
        .trigger("pointermove", {
          pointerType,
          button: eventButton,
          buttons: eventButtons,
          pageX: x,
          pageY: y,
        })
        .trigger("pointerup", {
          pointerType,
          button: eventButton,
          buttons: eventButtons,
          pageX: x,
          pageY: y,
        });
    });

    cy.wait(100);
  }
);

Cypress.Commands.add(
  "drawLine",
  ({
    length,
    originX = 0,
    originY = 0,
    pointerType = "pen",
    eventButton = 0,
    eventButtons = 1,
  }) => {
    cy.findByRole("presentation").then(($canvas) => {
      const x = $canvas.offset().left + originX;
      const y = $canvas.offset().top + originY;

      cy.wrap($canvas)
        .trigger("pointerdown", {
          pointerType,
          button: eventButton,
          buttons: eventButtons,
          pageX: x,
          pageY: y,
        })
        .trigger("pointermove", {
          pointerType,
          button: eventButton,
          buttons: eventButtons,
          pageX: x + length,
          pageY: y + length,
        })
        .trigger("pointerup", {
          pointerType,
          button: eventButton,
          buttons: eventButtons,
        });

      cy.wait(100);
    });
  }
);

Cypress.Commands.add(
  "drawPoint",
  ({
    originX = 0,
    originY = 0,
    pointerType = "pen",
    eventButton = 0,
    eventButtons = 1,
  }) => {
    cy.findByRole("presentation").then(($canvas) => {
      const x = $canvas.offset().left + originX;
      const y = $canvas.offset().top + originY;

      cy.wrap($canvas)
        .trigger("pointerdown", {
          pointerType,
          button: eventButton,
          buttons: eventButtons,
          pageX: x,
          pageY: y,
        })
        .trigger("pointerup", {
          pointerType,
          button: eventButton,
          buttons: eventButtons,
        });

      cy.wait(100);
    });
  }
);

Cypress.Commands.add(
  "convertDataURIToKiloBytes",
  { prevSubject: true },
  (subject) => {
    const base64str = subject.split("base64,")[1];
    const decoded = atob(base64str);
    const fileSizeInKB = Math.floor(decoded.length / 1024);
    return cy.wrap(fileSizeInKB);
  }
);

Cypress.Commands.add("CssStyleToObject", { prevSubject: true }, (subject) => {
  const regex = /([\w-]*)\s*:\s*([^;]*)/g;
  let match = null;
  const properties = {};
  while ((match = regex.exec(subject))) {
    properties[match[1]] = match[2].trim();
  }

  return cy.wrap(properties);
});

Cypress.Commands.add("StringToObject", { prevSubject: true }, (subject) => {
  try {
    const value = JSON.parse(subject.text());
    return cy.wrap(value);
  } catch (error) {
    return cy.wrap({});
  }
});
