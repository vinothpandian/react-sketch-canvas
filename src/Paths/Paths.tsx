import * as React from 'react';
import { CanvasPath } from '../types';
import { SvgPath } from './SvgPath';
import { PathProps } from './types';
import { bezierCommand } from './utils';

export const Paths = ({ id, paths }: PathProps): JSX.Element => (
  <React.Fragment>
    {paths.map((path: CanvasPath, index: number) => (
      <SvgPath
        key={`${id}__${index}`}
        paths={path.paths}
        id={`${id}__${index}`}
        strokeWidth={path.strokeWidth}
        strokeColor={path.strokeColor}
        command={bezierCommand}
      />
    ))}
  </React.Fragment>
);
