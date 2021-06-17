import { withKnobs } from '@storybook/addon-knobs';
import { addDecorator, addParameters } from '@storybook/react';

addDecorator(withKnobs);

addParameters({
  layout: 'centered',
  viewMode: 'docs',
});
