import { CanvasPath, Point } from '../types';

export interface SvgPathProps {
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
}

export interface PathProps {
  id: string;
  paths: CanvasPath[];
}

export interface ControlPoints {
  current: Point;
  previous?: Point;
  next?: Point;
  reverse?: boolean;
}
