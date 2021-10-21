import { ReactSketchCanvasProps } from 'react-sketch-canvas';

let defaultProps: Partial<ReactSketchCanvasProps>;

before(() => {
  cy.fixture('props.json').then((props) => (defaultProps = props));
});

beforeEach(() => {
  cy.visit('/');
});

it('should trigger erase mode and add a mask for erasing previous strokes', () => {
  cy.drawSquare(100, 100, 50, 'pen');

  cy.findByRole('button', { name: /eraser/i }).click();
  cy.drawSquare(100, 150, 50, 'pen');

  cy.get('#eraser-stroke-group').find('path').should('have.length', 1);
  cy.get('mask#eraser-mask-0').find('use').should('have.length', 2); // background + one mask path

  cy.get('#stroke-group-0')
    .should('have.attr', 'mask', 'url(#eraser-mask-0)')
    .find('path')
    .should('have.length', 1);

  cy.findByRole('button', { name: /pen/i }).click();
  cy.drawSquare(105, 105, 55, 'pen');

  cy.findByRole('button', { name: /eraser/i }).click();
  cy.drawSquare(100, 150, 50, 'pen');

  cy.get('#eraser-stroke-group').find('path').should('have.length', 2);
  cy.get('mask#eraser-mask-0').find('use').should('have.length', 3); // background + two mask paths
  cy.get('mask#eraser-mask-1').find('use').should('have.length', 2); // background + one mask path
});
