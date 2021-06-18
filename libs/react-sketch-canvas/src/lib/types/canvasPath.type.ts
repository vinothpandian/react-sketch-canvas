import { Point } from '.';

export interface CanvasPath {
  readonly paths: Point[];
  readonly strokeWidth: number;
  readonly strokeColor: string;
  readonly drawMode: boolean;
  readonly startTimestamp?: number;
  readonly endTimestamp?: number;
}
