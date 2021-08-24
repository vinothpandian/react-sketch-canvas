/* eslint-disable react/no-danger */
/* eslint-disable jsx-a11y/label-has-associated-control */

import { action } from '@storybook/addon-actions';
import { Meta, Story } from '@storybook/react';
import { ReactSketchCanvas, ReactSketchCanvasProps } from '..';

export default {
  title: 'Demo/React Sketch Canvas',
  component: ReactSketchCanvas,
  argTypes: {
    allowOnlyPointerType: {
      options: ['mouse', 'touch', 'pen', 'all'],
      control: { type: 'radio' },
    },
    strokeColor: {
      control: { type: 'color' },
    },
  },
  parameters: { actions: { argTypesRegex: '^on.*' } },
} as Meta;

const Template: Story<ReactSketchCanvasProps> = (args) => (
  <ReactSketchCanvas {...args} onUpdate={action('onUpdate')} />
);

export const Default = Template.bind({});
Default.args = {
  className: 'react-sketch-canvas',
  width: '100%',
  height: '500px',
  backgroundImage:
    'https://upload.wikimedia.org/wikipedia/commons/7/70/Graph_paper_scan_1600x1000_%286509259561%29.jpg',
  exportWithBackgroundImage: true,
  preserveBackgroundImageAspectRatio: 'none',
  strokeWidth: 4,
  strokeColor: '#000000',
  canvasColor: '#FFFFFF',
  eraserWidth: 5,
  allowOnlyPointerType: 'all',
  style: { borderRight: '1px solid #CCC' },
  withTimestamp: true,
};
