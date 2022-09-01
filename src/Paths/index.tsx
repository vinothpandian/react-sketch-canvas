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
  onClick?: (id: string) => void;
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
  onClick = undefined,
}: SvgPathProps): JSX.Element => {
  const areaMargin = 5; // px

  if (paths.length === 1) {
    const { x, y } = paths[0];
    const radius = strokeWidth / 2;

    const elem = (
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
    if (onClick) {
      return (
        <>
          {elem}
          <circle
            key={`${id}-area`}
            id={`${id}-area`}
            cx={x}
            cy={y}
            r={radius + areaMargin * 2}
            pointerEvents="all"
            fill="none"
            onClick={() => onClick(id)}
          />
        </>
      );
    }
    return elem;
  }

  const d = paths.reduce(
    (acc, point, i, a) =>
      i === 0 ? `M ${point.x},${point.y}` : `${acc} ${command(point, i, a)}`,
    ''
  );

  const elem = (
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
  if (onClick) {
    return (
      <>
        {elem}
        <path
          key={`${id}-area`}
          id={`${id}-area`}
          d={d}
          fill="none"
          strokeLinecap="round"
          strokeWidth={strokeWidth + areaMargin * 2}
          pointerEvents="all"
          onClick={() => onClick(id)}
        />
      </>
    );
  }
  return elem;
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
  paths: CanvasPath[];
  onClick?: (id: string) => void;
};

const Paths = ({ paths, onClick }: PathProps): JSX.Element => (
  <React.Fragment>
    {paths.map((path: CanvasPath) => (
      <SvgPath
        key={`${path.id}`}
        paths={path.paths}
        id={`${path.id}`}
        strokeWidth={path.strokeWidth}
        strokeColor={path.strokeColor}
        command={bezierCommand}
        onClick={(id) => onClick && onClick(id) }
      />
    ))}
  </React.Fragment>
);

export default Paths;
