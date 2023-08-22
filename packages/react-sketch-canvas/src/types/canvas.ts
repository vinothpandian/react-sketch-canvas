export type ExportImageType = "jpeg" | "png";

export interface ExportImageOptions {
  readonly width?: number;
  readonly height?: number;
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface CanvasPath {
  readonly paths: Point[];
  readonly strokeWidth: number;
  readonly strokeColor: string;
  readonly drawMode: boolean;
  readonly startTimestamp?: number;
  readonly endTimestamp?: number;
}
