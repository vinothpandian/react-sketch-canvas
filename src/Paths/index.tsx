import * as React from 'react';
import { CanvasPath, Point } from '../types';

export type SvgPathProps = {
  // List of points to create the stroke
  paths: Point[];
  // Unique ID
  id: string;
  // Width of the stroke
  strokeWidth: number;
  // Color of the stroke
  strokeColor: string;
  // Bezier command to smoothen the line
  command?: (point: Point, i: number, a: Point[]) => string;
};

/**
 * Generate SVG Path tag from the given points
 */
export const SvgPath = ({
  paths,
  id,
  strokeWidth,
  strokeColor,
  command = bezierCommand,
}: SvgPathProps): JSX.Element => {
  if (paths.length === 1) {
    const { x, y } = paths[0];
    const radius = strokeWidth / 2;

    return (
      <circle
        key={id}
        id={id}
        cx={x}
        cy={y}
        r={radius}
        stroke={strokeColor}
        fill={strokeColor}
      />
    );
  }

  const d = paths.reduce(
    (acc, point, i, a) =>
      i === 0 ? `M ${point.x},${point.y}` : `${acc} ${command(point, i, a)}`,
    ''
  );

  return (
    <path
      key={id}
      id={id}
      d={d}
      fill="none"
      strokeLinecap="round"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
    />
  );
};

export const line = (pointA: Point, pointB: Point) => {
  const lengthX = pointB.x - pointA.x;
  const lengthY = pointB.y - pointA.y;

  return {
    length: Math.sqrt(lengthX ** 2 + lengthY ** 2),
    angle: Math.atan2(lengthY, lengthX),
  };
};

type ControlPoints = {
  current: Point;
  previous?: Point;
  next?: Point;
  reverse?: boolean;
};

const controlPoint = (controlPoints: ControlPoints): [number, number] => {
  const { current, next, previous, reverse } = controlPoints;

  const p = previous || current;
  const n = next || current;

  const smoothing = 0.2;

  const o = line(p, n);

  const angle = o.angle + (reverse ? Math.PI : 0);
  const length = o.length * smoothing;

  const x = current.x + Math.cos(angle) * length;
  const y = current.y + Math.sin(angle) * length;

  return [x, y];
};

export const bezierCommand = (point: Point, i: number, a: Point[]): string => {
  let cpsX = null;
  let cpsY = null;

  switch (i) {
    case 0:
      [cpsX, cpsY] = controlPoint({
        current: point,
      });
      break;
    case 1:
      [cpsX, cpsY] = controlPoint({
        current: a[i - 1],
        next: point,
      });
      break;
    default:
      [cpsX, cpsY] = controlPoint({
        current: a[i - 1],
        previous: a[i - 2],
        next: point,
      });
      break;
  }

  const [cpeX, cpeY] = controlPoint({
    current: point,
    previous: a[i - 1],
    next: a[i + 1],
    reverse: true,
  });

  return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point.x}, ${point.y}`;
};

type PathProps = {
  id: string;
  paths: CanvasPath[];
};

const Paths = ({ id, paths }: PathProps): JSX.Element => (
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

export default Paths;
