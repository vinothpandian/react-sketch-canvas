import React, { Component } from 'react';
import { render } from 'react-dom';

import Example from '../../src';

const Demo = () => (
  <div>
    <h1>react-svg-sketch Demo</h1>
    <Example
      strokeWidth={7}
      strokeColor="green"
      exportDataUri={(data) => {
        console.log(data);
      }}
    />
  </div>
);
render(<Demo />, document.querySelector('#demo'));
