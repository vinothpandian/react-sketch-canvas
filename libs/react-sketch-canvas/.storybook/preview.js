import { addParameters } from '@storybook/react';

addParameters({
  layout: 'centered',
  viewMode: 'docs',
  controls: {
    matchers: {
      color: /(color)$/i,
      date: /Date$/,
    },
  },
  docs: {
    source: {
      type: 'code',
    },
  },
});
