import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

const svgPath = (paths, strokeColor, command) => {
  const d = paths.reduce(
    (acc, path, i, a) =>
      (i === 0 ? `M ${path.get('x')},${path.get('y')}` : `${acc} ${command(path, i, a)}`),
    '',
  );
  return <path d={d} fill="none" strokeLinecap="round" stroke={strokeColor} />;
};

const line = (pointA, pointB) => {
  const lengthX = pointB.get('x') - pointA.get('x');
  const lengthY = pointB.get('y') - pointA.get('y');

  return {
    length: Math.sqrt(lengthX ** 2 + lengthY ** 2),
    angle: Math.atan2(lengthY, lengthX),
  };
};

const controlPoint = (current, previous, next, reverse) => {
  const p = previous || current;
  const n = next || current;

  const smoothing = 0.2;

  const o = line(p, n);

  const angle = o.angle + (reverse ? Math.PI : 0);
  const length = o.length * smoothing;

  const x = current.get('x') + Math.cos(angle) * length;
  const y = current.get('y') + Math.sin(angle) * length;

  return [x, y];
};

const bezierCommand = (point, i, a) => {
  let cpsX = null;
  let cpsY = null;

  switch (i) {
    case 0:
      [cpsX, cpsY] = controlPoint(undefined, undefined, point);
      break;
    case 1:
      [cpsX, cpsY] = controlPoint(a.get(i - 1), undefined, point);
      break;
    default:
      [cpsX, cpsY] = controlPoint(a.get(i - 1), a.get(i - 2), point);
      break;
  }

  const [cpeX, cpeY] = controlPoint(point, a.get(i - 1), a.get(i + 1), true);
  return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point.get('x')},${point.get('y')}`;
};

const Path = ({ paths, strokeColor }) => svgPath(paths, strokeColor, bezierCommand);

const Paths = ({ strokeColor, paths }) => (
  <React.Fragment>
    {paths.map((path, index) => <Path key={index} strokeColor={strokeColor} paths={path} />)}
  </React.Fragment>
);

Paths.propTypes = {
  strokeColor: PropTypes.string.isRequired,
  paths: PropTypes.instanceOf(List).isRequired,
};

export default Paths;
