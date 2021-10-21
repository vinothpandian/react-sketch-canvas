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

describe('undo', () => {
  it('should undo a stroke', () => {
    cy.getCanvas().find('path').should('have.length', 0);
    cy.drawSquare(100, 100, 50, 'pen');
    cy.getCanvas().find('path').should('have.length', 1);

    cy.findByRole('button', { name: /undo/i }).click();
    cy.getCanvas().find('path').should('have.length', 0);
  });

  it('should undo an eraser stroke', () => {
    cy.drawSquare(100, 100, 50, 'pen');
    cy.findByRole('button', { name: /eraser/i }).click();
    cy.drawSquare(100, 150, 50, 'pen');

    cy.getCanvas().find('path').should('have.length', 2);
    cy.get('#eraser-stroke-group').find('path').should('have.length', 1);
    cy.get('mask#eraser-mask-0').find('use').should('have.length', 2); // background + one mask path

    cy.findByRole('button', { name: /undo/i }).click();
    cy.getCanvas().find('path').should('have.length', 1);
    cy.get('#eraser-stroke-group').find('path').should('have.length', 0);
  });
});

describe('redo', () => {
  it('should redo a stroke', () => {
    cy.getCanvas().find('path').should('have.length', 0);
    cy.drawSquare(100, 100, 50, 'pen');
    cy.getCanvas().find('path').should('have.length', 1);

    cy.findByRole('button', { name: /undo/i }).click();
    cy.getCanvas().find('path').should('have.length', 0);

    cy.findByRole('button', { name: /redo/i }).click();
    cy.getCanvas().find('path').should('have.length', 1);
  });

  it('should redo an eraser stroke', () => {
    cy.drawSquare(100, 100, 50, 'pen');
    cy.findByRole('button', { name: /eraser/i }).click();
    cy.drawSquare(100, 150, 50, 'pen');

    cy.getCanvas().find('path').should('have.length', 2);
    cy.get('#eraser-stroke-group').find('path').should('have.length', 1);
    cy.get('mask#eraser-mask-0').find('use').should('have.length', 2); // background + one mask path

    cy.findByRole('button', { name: /undo/i }).click();
    cy.getCanvas().find('path').should('have.length', 1);
    cy.get('#eraser-stroke-group').find('path').should('have.length', 0);
    cy.get('mask#eraser-mask-0').should('not.exist');

    cy.findByRole('button', { name: /redo/i }).click();
    cy.getCanvas().find('path').should('have.length', 2);
    cy.get('#eraser-stroke-group').find('path').should('have.length', 1);
    cy.get('mask#eraser-mask-0').find('use').should('have.length', 2); // background + one mask path
  });
});

describe('clearCanvas', () => {
  it('should clearCanvas but still keep the stack', () => {
    cy.getCanvas().find('path').should('have.length', 0);
    cy.drawSquare(100, 100, 50, 'pen');
    cy.getCanvas().find('path').should('have.length', 1);

    cy.findByRole('button', { name: /clear all/i }).click();
    cy.getCanvas().find('path').should('have.length', 0);

    cy.findByRole('button', { name: /redo/i }).click();
    cy.getCanvas().find('path').should('have.length', 0);

    cy.findByRole('button', { name: /undo/i }).click();
    cy.getCanvas().find('path').should('have.length', 1);
  });

  it('should clearCanvas with an eraser stroke but still keep the stack', () => {
    cy.drawSquare(100, 100, 50, 'pen');
    cy.findByRole('button', { name: /eraser/i }).click();
    cy.drawSquare(100, 150, 50, 'pen');

    cy.getCanvas().find('path').should('have.length', 2);
    cy.get('#eraser-stroke-group').find('path').should('have.length', 1);
    cy.get('mask#eraser-mask-0').find('use').should('have.length', 2); // background + one mask path

    cy.findByRole('button', { name: /clear all/i }).click();
    cy.getCanvas().find('path').should('have.length', 0);
    cy.get('mask#eraser-mask-0').should('not.exist');

    cy.findByRole('button', { name: /redo/i }).click();
    cy.getCanvas().find('path').should('have.length', 0);
    cy.get('mask#eraser-mask-0').should('not.exist');

    cy.findByRole('button', { name: /undo/i }).click();
    cy.getCanvas().find('path').should('have.length', 2);
    cy.get('#eraser-stroke-group').find('path').should('have.length', 1);
    cy.get('mask#eraser-mask-0').find('use').should('have.length', 2); // background + one mask path
  });
});

describe('resetCanvas', () => {
  it('should resetCanvas and remove the stack', () => {
    cy.getCanvas().find('path').should('have.length', 0);
    cy.drawSquare(100, 100, 50, 'pen');
    cy.getCanvas().find('path').should('have.length', 1);

    cy.findByRole('button', { name: /reset all/i }).click();
    cy.getCanvas().find('path').should('have.length', 0);

    cy.findByRole('button', { name: /redo/i }).click();
    cy.getCanvas().find('path').should('have.length', 0);

    cy.findByRole('button', { name: /undo/i }).click();
    cy.getCanvas().find('path').should('have.length', 0);
  });

  it('should resetCanvas with an eraser stroke and remove the stack', () => {
    cy.drawSquare(100, 100, 50, 'pen');
    cy.findByRole('button', { name: /eraser/i }).click();
    cy.drawSquare(100, 150, 50, 'pen');

    cy.getCanvas().find('path').should('have.length', 2);
    cy.get('#eraser-stroke-group').find('path').should('have.length', 1);
    cy.get('mask#eraser-mask-0').find('use').should('have.length', 2); // background + one mask path

    cy.findByRole('button', { name: /reset all/i }).click();
    cy.getCanvas().find('path').should('have.length', 0);
    cy.get('mask#eraser-mask-0').should('not.exist');

    cy.findByRole('button', { name: /redo/i }).click();
    cy.getCanvas().find('path').should('have.length', 0);
    cy.get('mask#eraser-mask-0').should('not.exist');

    cy.findByRole('button', { name: /undo/i }).click();
    cy.getCanvas().find('path').should('have.length', 0);
    cy.get('mask#eraser-mask-0').should('not.exist');
  });
});

describe('exportImage - png', () => {
  beforeEach(() => {
    cy.findByRole('radio', { name: /png/i }).click();
    cy.findByRole('textbox', { name: 'backgroundImage', exact: true }).clear();
    cy.findByRole('switch', {
      name: 'exportWithBackgroundImage',
      exact: true,
    }).click();
  });

  it('should export png with stroke', () => {
    cy.findByRole('button', { name: /export image/i }).click();

    cy.get('#exported-image')
      .should('have.attr', 'src')
      .and('match', /^data:image\/png;base64/i)
      .convertDataURIToKiloBytes()
      .as('fileSizeWithoutStroke');

    cy.drawSquare(100, 100, 50, 'pen');

    cy.findByRole('button', { name: /export image/i }).click();

    cy.get('#exported-image')
      .should('have.attr', 'src')
      .and('match', /^data:image\/png;base64/i)
      .convertDataURIToKiloBytes()
      .then((fileSizeWithStroke) => {
        cy.get('@fileSizeWithoutStroke').should(
          'be.lessThan',
          fileSizeWithStroke
        );
      });
  });

  it('should export png with stroke and eraser', () => {
    cy.findByRole('button', { name: /export image/i }).click();

    cy.get('#exported-image')
      .should('have.attr', 'src')
      .and('match', /^data:image\/png;base64/i)
      .convertDataURIToKiloBytes()
      .as('fileSizeWithoutStrokeAndEraser');

    cy.drawSquare(100, 100, 50, 'pen');
    cy.findByRole('button', { name: /eraser/i }).click();
    cy.drawSquare(100, 150, 50, 'pen');

    cy.findByRole('button', { name: /export image/i }).click();

    cy.get('#exported-image')
      .should('have.attr', 'src')
      .and('match', /^data:image\/png;base64/i)
      .convertDataURIToKiloBytes()
      .then((fileSizeWithStrokeAndEraser) => {
        cy.get('@fileSizeWithoutStrokeAndEraser').should(
          'be.lessThan',
          fileSizeWithStrokeAndEraser
        );
      });
  });

  it('should export png with stroke while exportWithBackgroundImage is set', () => {
    cy.findByRole('switch', {
      name: 'exportWithBackgroundImage',
      exact: true,
    }).click();
    cy.findByRole('button', { name: /export image/i }).click();

    cy.get('#exported-image')
      .should('have.attr', 'src')
      .and('match', /^data:image\/png;base64/i)
      .convertDataURIToKiloBytes()
      .as('fileSizeWithoutStroke');

    cy.drawSquare(100, 100, 50, 'pen');

    cy.findByRole('button', { name: /export image/i }).click();

    cy.get('#exported-image')
      .should('have.attr', 'src')
      .and('match', /^data:image\/png;base64/i)
      .convertDataURIToKiloBytes()
      .then((fileSizeWithStroke) => {
        cy.get('@fileSizeWithoutStroke').should(
          'be.lessThan',
          fileSizeWithStroke
        );
      });
  });

  it('should export png with stroke and eraser while exportWithBackgroundImage is set', () => {
    cy.findByRole('switch', {
      name: 'exportWithBackgroundImage',
      exact: true,
    }).click();
    cy.findByRole('button', { name: /export image/i }).click();

    cy.get('#exported-image')
      .should('have.attr', 'src')
      .and('match', /^data:image\/png;base64/i)
      .convertDataURIToKiloBytes()
      .as('fileSizeWithoutStrokeAndEraser');

    cy.drawSquare(100, 100, 50, 'pen');
    cy.findByRole('button', { name: /eraser/i }).click();
    cy.drawSquare(100, 150, 50, 'pen');

    cy.findByRole('button', { name: /export image/i }).click();

    cy.get('#exported-image')
      .should('have.attr', 'src')
      .and('match', /^data:image\/png;base64/i)
      .convertDataURIToKiloBytes()
      .then((fileSizeWithStrokeAndEraser) => {
        cy.get('@fileSizeWithoutStrokeAndEraser').should(
          'be.lessThan',
          fileSizeWithStrokeAndEraser
        );
      });
  });
});

describe('exportImage - jpeg', () => {
  beforeEach(() => {
    cy.findByRole('radio', { name: /jpeg/i }).click();
    cy.findByRole('textbox', { name: 'backgroundImage', exact: true }).clear();

    cy.findByRole('switch', {
      name: 'exportWithBackgroundImage',
      exact: true,
    }).click();
  });

  it('should export jpeg with stroke', () => {
    cy.findByRole('button', { name: /export image/i }).click();

    cy.get('#exported-image')
      .should('have.attr', 'src')
      .and('match', /^data:image\/jpeg;base64/i)
      .convertDataURIToKiloBytes()
      .as('fileSizeWithoutStroke');

    cy.drawSquare(100, 100, 50, 'pen');

    cy.findByRole('button', { name: /export image/i }).click();

    cy.get('#exported-image')
      .should('have.attr', 'src')
      .and('match', /^data:image\/jpeg;base64/i)
      .convertDataURIToKiloBytes()
      .then((fileSizeWithStroke) => {
        cy.get('@fileSizeWithoutStroke').should(
          'be.lessThan',
          fileSizeWithStroke
        );
      });
  });

  it('should export jpeg with stroke and eraser', () => {
    cy.findByRole('button', { name: /export image/i }).click();

    cy.get('#exported-image')
      .should('have.attr', 'src')
      .and('match', /^data:image\/jpeg;base64/i)
      .convertDataURIToKiloBytes()
      .as('fileSizeWithoutStrokeAndEraser');

    cy.drawSquare(100, 100, 50, 'pen');
    cy.findByRole('button', { name: /eraser/i }).click();
    cy.drawSquare(100, 150, 50, 'pen');

    cy.findByRole('button', { name: /export image/i }).click();

    cy.get('#exported-image')
      .should('have.attr', 'src')
      .and('match', /^data:image\/jpeg;base64/i)
      .convertDataURIToKiloBytes()
      .then((fileSizeWithStrokeAndEraser) => {
        cy.get('@fileSizeWithoutStrokeAndEraser').should(
          'be.lessThan',
          fileSizeWithStrokeAndEraser
        );
      });
  });

  it('should export jpeg with stroke while exportWithBackgroundImage is set', () => {
    cy.findByRole('switch', {
      name: 'exportWithBackgroundImage',
      exact: true,
    }).click();
    cy.findByRole('button', { name: /export image/i }).click();

    cy.get('#exported-image')
      .should('have.attr', 'src')
      .and('match', /^data:image\/jpeg;base64/i)
      .convertDataURIToKiloBytes()
      .as('fileSizeWithoutStroke');

    cy.drawSquare(100, 100, 50, 'pen');

    cy.findByRole('button', { name: /export image/i }).click();

    cy.get('#exported-image')
      .should('have.attr', 'src')
      .and('match', /^data:image\/jpeg;base64/i)
      .convertDataURIToKiloBytes()
      .then((fileSizeWithStroke) => {
        cy.get('@fileSizeWithoutStroke').should(
          'be.lessThan',
          fileSizeWithStroke
        );
      });
  });

  it('should export jpeg with stroke and eraser while exportWithBackgroundImage is set', () => {
    cy.findByRole('switch', {
      name: 'exportWithBackgroundImage',
      exact: true,
    }).click();
    cy.findByRole('button', { name: /export image/i }).click();

    cy.get('#exported-image')
      .should('have.attr', 'src')
      .and('match', /^data:image\/jpeg;base64/i)
      .convertDataURIToKiloBytes()
      .as('fileSizeWithoutStrokeAndEraser');

    cy.drawSquare(100, 100, 50, 'pen');
    cy.findByRole('button', { name: /eraser/i }).click();
    cy.drawSquare(100, 150, 50, 'pen');

    cy.findByRole('button', { name: /export image/i }).click();

    cy.get('#exported-image')
      .should('have.attr', 'src')
      .and('match', /^data:image\/jpeg;base64/i)
      .convertDataURIToKiloBytes()
      .then((fileSizeWithStrokeAndEraser) => {
        cy.get('@fileSizeWithoutStrokeAndEraser').should(
          'be.lessThan',
          fileSizeWithStrokeAndEraser
        );
      });
  });
});

describe('exportImage - svg', () => {
  beforeEach(() => {
    cy.findByRole('textbox', { name: 'backgroundImage', exact: true }).clear();

    cy.findByRole('switch', {
      name: 'exportWithBackgroundImage',
      exact: true,
    }).click();
  });

  it('should export jpeg with stroke', () => {
    cy.drawSquare(100, 100, 50, 'pen');

    cy.findByRole('button', { name: /export svg/i }).click();
    cy.get('#exported-svg').find('path').should('have.length', 1);
  });

  it('should export jpeg with stroke and eraser', () => {
    cy.drawSquare(100, 100, 50, 'pen');
    cy.findByRole('button', { name: /eraser/i }).click();
    cy.drawSquare(100, 150, 50, 'pen');

    cy.findByRole('button', { name: /export svg/i }).click();

    cy.get('#exported-svg').find('path').should('have.length', 2);
    cy.get('#exported-svg #eraser-stroke-group')
      .find('path')
      .should('have.length', 1);
    cy.get('#exported-svg mask#eraser-mask-0')
      .find('use')
      .should('have.length', 2); // background + one mask path
  });

  it('should export jpeg with stroke while exportWithBackgroundImage is set', () => {
    cy.findByRole('switch', {
      name: 'exportWithBackgroundImage',
      exact: true,
    }).click();

    cy.drawSquare(100, 100, 50, 'pen');

    cy.findByRole('button', { name: /export svg/i }).click();

    cy.get('#exported-svg').find('path').should('have.length', 1);
    cy.get('#exported-svg #canvas-background').should(
      'have.attr',
      'fill',
      defaultProps.canvasColor
    );
  });

  it('should export jpeg with stroke and eraser while exportWithBackgroundImage is set', () => {
    cy.findByRole('switch', {
      name: 'exportWithBackgroundImage',
      exact: true,
    }).click();
    cy.drawSquare(100, 100, 50, 'pen');
    cy.findByRole('button', { name: /eraser/i }).click();
    cy.drawSquare(100, 150, 50, 'pen');

    cy.findByRole('button', { name: /export svg/i }).click();
    cy.get('#exported-svg').find('path').should('have.length', 2);
    cy.get('#exported-svg #eraser-stroke-group')
      .find('path')
      .should('have.length', 1);
    cy.get('#exported-svg mask#eraser-mask-0')
      .find('use')
      .should('have.length', 2); // background + one mask path

    cy.get('#exported-svg #canvas-background').should(
      'have.attr',
      'fill',
      defaultProps.canvasColor
    );
  });
});
