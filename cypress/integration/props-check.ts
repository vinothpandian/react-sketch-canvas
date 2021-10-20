import { ReactSketchCanvasProps } from 'react-sketch-canvas';

let defaultProps: Partial<ReactSketchCanvasProps>;

before(() => {
  cy.fixture('props.json').then((props) => (defaultProps = props));
});

beforeEach(() => {
  cy.visit('/');
});

it('should update width on props change', () => {
  const updatedWidth = '100px';

  cy.getCanvas()
    .should('have.attr', 'style')
    .and('include', `width: ${defaultProps.width}`);

  cy.findByRole('textbox', { name: /width/i }).clear().type(updatedWidth);

  cy.getCanvas()
    .should('have.attr', 'style')
    .and('include', `width: ${updatedWidth}`);
});

it('should update height on props change', () => {
  const updatedHeight = '200px';

  cy.getCanvas()
    .should('have.attr', 'style')
    .and('include', `height: ${defaultProps.height}`);

  cy.findByRole('textbox', { name: /height/i })
    .clear()
    .type(updatedHeight);

  cy.getCanvas()
    .should('have.attr', 'style')
    .and('include', `height: ${updatedHeight}`);
});

it('should update className on props change', () => {
  const updatedClassName = 'svg-canvas';

  cy.getCanvas().should('have.class', defaultProps.className);

  cy.findByRole('textbox', { name: /className/i })
    .clear()
    .type(updatedClassName);

  cy.getCanvas().should('have.class', updatedClassName);
});

it('should update backgroundImage on props change', () => {
  const updatedBackgroundImage = 'https://i.imgur.com/jx47T07.jpeg';

  cy.get('#canvas-background').should('have.attr', 'fill', 'url(#background)');

  cy.get('pattern#background')
    .find('image')
    .should('have.attr', 'xlink:href', defaultProps.backgroundImage);

  cy.findByRole('textbox', { name: 'backgroundImage', exact: true })
    .clear()
    .type(updatedBackgroundImage);

  cy.get('#canvas-background').should('have.attr', 'fill', 'url(#background)');

  cy.get('pattern#background')
    .find('image')
    .should('have.attr', 'xlink:href', updatedBackgroundImage);
});

it('should update preserveAspectRatio of the background image', () => {
  const updatedPreserveAspectRatio = 'xMidYMid meet';

  cy.get('pattern#background')
    .find('image')
    .should(
      'have.attr',
      'preserveAspectRatio',
      defaultProps.preserveBackgroundImageAspectRatio
    );

  cy.findByRole('textbox', {
    name: /preserveBackgroundImageAspectRatio/i,
  })
    .clear()
    .type(updatedPreserveAspectRatio);

  cy.get('pattern#background')
    .find('image')
    .should('have.attr', 'preserveAspectRatio', updatedPreserveAspectRatio);
});

it('should change stroke width', () => {
  const updatedStrokeWidth = '8';

  cy.drawLine(100, 100, 100);
  cy.get('#stroke-group-0')
    .find('path')
    .first()
    .should('have.attr', 'stroke-width', defaultProps.strokeWidth.toString());

  cy.findByRole('spinbutton', { name: /strokeWidth/i })
    .clear()
    .type(updatedStrokeWidth);

  cy.drawLine(50, 50, 100);
  cy.get('#stroke-group-0')
    .find('path')
    .last()
    .should('have.attr', 'stroke-width', updatedStrokeWidth);
});

it('should change eraser width', () => {
  const updatedEraserWidth = '8';
  cy.findByRole('button', { name: /eraser/i }).click();
  cy.drawLine(100, 100, 100);
  cy.get('#eraser-stroke-group')
    .find('path')
    .first()
    .should('have.attr', 'stroke-width', defaultProps.eraserWidth.toString());

  cy.findByRole('spinbutton', { name: /eraserWidth/i })
    .clear()
    .type(updatedEraserWidth);

  cy.drawLine(50, 50, 100);
  cy.get('#eraser-stroke-group')
    .find('path')
    .last()
    .should('have.attr', 'stroke-width', updatedEraserWidth);
});

it('should change stroke color', () => {
  const updatedStrokeColor = '#FF0000';
  cy.drawLine(100, 100, 100);
  cy.get('#stroke-group-0')
    .find('path')
    .first()
    .should('have.attr', 'stroke', defaultProps.strokeColor);

  cy.findByLabelText(/strokeColor/i)
    .invoke('val', updatedStrokeColor)
    .trigger('change');

  cy.drawLine(50, 50, 100);
  cy.get('#stroke-group-0')
    .find('path')
    .last()
    .should('have.attr', 'stroke', updatedStrokeColor.toLowerCase());
});

it('should change canvas color', () => {
  cy.get('#canvas-background').should('have.attr', 'fill', 'url(#background)');

  const updatedCanvasColor = '#FF0000';
  cy.findByLabelText(/canvasColor/i)
    .invoke('val', updatedCanvasColor)
    .trigger('change');

  cy.get('#canvas-background').should(
    'have.attr',
    'fill',
    updatedCanvasColor.toLowerCase()
  );
});

describe('exportWithBackgroundImage', () => {
  it('should export svg with background', () => {
    cy.findByRole('button', { name: /export svg/i }).click();
    cy.get('#exported-svg')
      .find('#canvas-background')
      .should('have.attr', 'fill', 'url(#background)');

    cy.get('#exported-svg')
      .find('pattern#background')
      .find('image')
      .first()
      .should('have.attr', 'xlink:href', defaultProps.backgroundImage);

    cy.findByRole('switch', { name: /exportWithBackgroundImage/i }).click();

    cy.findByRole('button', { name: /export svg/i }).click();
    cy.get('#exported-svg')
      .find('#canvas-background')
      .should('have.attr', 'fill', defaultProps.canvasColor);
  });
});
