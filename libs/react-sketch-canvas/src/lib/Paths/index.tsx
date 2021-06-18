import React from 'react';
import { CanvasPath, Point } from '../types';
import { bezierCommand } from '../utils';

const svgPath = (
  paths: Point[],
  id: string,
  strokeWidth: number,
  strokeColor: string,
  command: (point: Point, i: number, a: Point[]) => string
): JSX.Element => {
  const d = paths.reduce(
    (acc, point, i, a) =>
      i === 0 ? `M ${point.x},${point.y}` : `${acc} ${command(point, i, a)}`,
    ''
  );

  return (
    <path
      key={id}
      d={d}
      fill="none"
      strokeLinecap="round"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
    />
  );
};

type PathProps = {
  paths: CanvasPath[];
};

const Paths = ({ paths }: PathProps): JSX.Element => (
  <React.Fragment>
    {paths.map((path: CanvasPath, id: number) =>
      svgPath(
        path.paths,
        id.toString(),
        path.strokeWidth,
        path.strokeColor,
        bezierCommand
      )
    )}
  </React.Fragment>
);

export default Paths;
