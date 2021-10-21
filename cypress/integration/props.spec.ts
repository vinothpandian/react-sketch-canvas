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

  cy.get('pattern#background image')
    .as('backgroundImage')
    .should('have.attr', 'xlink:href', defaultProps.backgroundImage);

  cy.findByRole('textbox', { name: 'backgroundImage', exact: true })
    .clear()
    .type(updatedBackgroundImage);

  cy.get('#canvas-background').should('have.attr', 'fill', 'url(#background)');
  cy.get('@backgroundImage').should(
    'have.attr',
    'xlink:href',
    updatedBackgroundImage
  );
});

it('should update preserveAspectRatio of the background image', () => {
  const updatedPreserveAspectRatio = 'xMidYMid meet';

  cy.get('pattern#background image')
    .as('backgroundImage')
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

  cy.get('@backgroundImage').should(
    'have.attr',
    'preserveAspectRatio',
    updatedPreserveAspectRatio
  );
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
  it('should export svg with background when enabled and canvas color background when disabled', () => {
    cy.findByRole('button', { name: /export svg/i }).click();
    cy.get('#exported-svg #canvas-background')
      .as('exportedCanvasBackground')
      .should('have.attr', 'fill', 'url(#background)');

    cy.get('#exported-svg pattern#background image').should(
      'have.attr',
      'xlink:href',
      defaultProps.backgroundImage
    );

    cy.findByRole('switch', { name: /exportWithBackgroundImage/i }).click();

    cy.findByRole('button', { name: /export svg/i }).click();
    cy.get('@exportedCanvasBackground').should(
      'have.attr',
      'fill',
      defaultProps.canvasColor
    );
  });

  it('should export png with background when enabled and canvas color background when disabled', () => {
    cy.findByRole('button', { name: /export image/i }).click();

    cy.get('#exported-image')
      .should('have.attr', 'src')
      .and('match', /^data:image\/png;base64/i)
      .convertDataURIToKiloBytes()
      .as('fileSizeWithExportedImage');

    cy.findByRole('switch', { name: /exportWithBackgroundImage/i }).click();

    cy.findByRole('button', { name: /export image/i }).click();

    cy.get('#exported-image')
      .should('have.attr', 'src')
      .and('match', /^data:image\/png;base64/i)
      .convertDataURIToKiloBytes()
      .then((fileSizeWithoutExportedImage) => {
        cy.get('@fileSizeWithExportedImage').should(
          'not.be.lessThan',
          fileSizeWithoutExportedImage
        );
      });
  });

  it('should export jpeg with background when enabled and canvas color background when disabled', () => {
    cy.findByRole('radio', { name: /jpeg/i }).click();
    cy.findByRole('button', { name: /export image/i }).click();

    cy.get('#exported-image')
      .should('have.attr', 'src')
      .and('match', /^data:image\/jpeg;base64/i)
      .convertDataURIToKiloBytes()
      .as('fileSizeWithExportedImage');

    cy.findByRole('switch', { name: /exportWithBackgroundImage/i }).click();

    cy.findByRole('button', { name: /export image/i }).click();

    cy.get('#exported-image')
      .should('have.attr', 'src')
      .and('match', /^data:image\/jpeg;base64/i)
      .convertDataURIToKiloBytes()
      .then((fileSizeWithoutExportedImage) => {
        cy.get('@fileSizeWithExportedImage').should(
          'not.be.lessThan',
          fileSizeWithoutExportedImage
        );
      });
  });
});

it('should throw exception when attempted to get sketching time when withTimestamp is disabled', () => {
  const getSketchingTimeInString = (sketchingTime: number): string =>
    `${(sketchingTime / 1000).toFixed(3)} sec`;

  const initialTime = 0;
  cy.get('#sketchingTime')
    .as('sketchingTimeContainer')
    .should('contain.text', getSketchingTimeInString(initialTime));

  cy.drawSquare(100);
  cy.findByRole('button', { name: /get sketching time/i }).click();

  cy.get('@sketchingTimeContainer').then(($sketchingTimeContainer) => {
    const sketchingTime = Number($sketchingTimeContainer.text().slice(0, 5));
    expect(sketchingTime).to.be.greaterThan(0);
  });

  cy.findByRole('switch', { name: /withTimestamp/i }).click();

  cy.drawSquare(100, 200, 200);
  cy.findByRole('button', { name: /get sketching time/i }).click();
  cy.get('@sketchingTimeContainer').should(
    'contain.text',
    getSketchingTimeInString(initialTime)
  );
});

describe('allowOnlyPointerType', () => {
  it('should allow sketching with mouse, touch, and stylus when allowOnlyPointerType is set as all', () => {
    cy.drawLine(50, 0, 10, 'mouse');
    cy.drawLine(100, 50, 10, 'touch');
    cy.drawLine(200, 100, 10, 'pen');

    cy.get('#stroke-group-0').find('path').should('have.length', 3);
  });

  it('should allow sketching only with mouse when allowOnlyPointerType is set as mouse', () => {
    cy.findByRole('radio', { name: /mouse/i }).click();

    cy.drawLine(50, 0, 10, 'mouse');
    cy.get('#stroke-group-0').find('path').should('have.length', 1);
    cy.drawLine(100, 50, 10, 'touch');
    cy.drawLine(200, 100, 10, 'pen');

    cy.get('#stroke-group-0').find('path').should('have.length', 1);
  });

  it('should allow sketching only with touch when allowOnlyPointerType is set as touch', () => {
    cy.findByRole('radio', { name: /touch/i }).click();

    cy.drawLine(50, 0, 10, 'touch');
    cy.get('#stroke-group-0').find('path').should('have.length', 1);
    cy.drawLine(100, 50, 10, 'mouse');
    cy.drawLine(200, 100, 10, 'pen');

    cy.get('#stroke-group-0').find('path').should('have.length', 1);
  });

  it('should allow sketching only with pen when allowOnlyPointerType is set as pen', () => {
    cy.findByRole('radio', { name: /pen/i }).click();

    cy.drawLine(50, 0, 10, 'pen');
    cy.get('#stroke-group-0').find('path').should('have.length', 1);
    cy.drawLine(100, 50, 10, 'mouse');
    cy.drawLine(200, 100, 10, 'touch');

    cy.get('#stroke-group-0').find('path').should('have.length', 1);
  });
});

it('should call onUpdate when a new stroke or eraser is added', () => {
  cy.get('#paths')
    .as('pathsContainer')
    .should('have.text', 'Sketch to get paths');

  cy.drawLine(50, 0, 10, 'pen');
  cy.get('@pathsContainer').then(($pathsContainer) => {
    const paths = JSON.parse($pathsContainer.text());
    expect(paths).to.have.length(1);
    expect(paths.pop()).to.have.property('drawMode', true);
  });

  cy.findByRole('button', { name: /eraser/i }).click();
  cy.drawLine(50, 0, 10, 'pen');
  cy.get('@pathsContainer').then(($pathsContainer) => {
    const paths = JSON.parse($pathsContainer.text());
    expect(paths).to.have.length(2);
    expect(paths.pop()).to.have.property('drawMode', false);
  });
});
