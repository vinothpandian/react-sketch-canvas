/**
 * Image type to export the canvas as.
 */
export type ExportImageType = "jpeg" | "png";

/**
 * Options for exporting the canvas as an image.
 */
export interface ExportImageOptions {
  /**
   * Width of the exported image.
   */
  readonly width?: number;
  /**
   * Height of the exported image.
   */
  readonly height?: number;
}

/**
 * Point on the canvas.
 *
 * @remarks
 * The origin (0, 0) is the top-left corner of the canvas.
 */
export interface Point {
  /**
   * The x coordinate of the point.
   */
  readonly x: number;
  /**
   * The y coordinate of the point.
   */
  readonly y: number;
}

/**
 * Path to draw on the canvas.
 */
export interface CanvasPath {
  /**
   * The paths to draw. Each path is an array of points.
   */
  readonly paths: Point[];
  /**
   * The stroke width of the path.
   */
  readonly strokeWidth: number;
  /**
   * Color of the stroke.
   */
  readonly strokeColor: string;
  /**
   * Whether the path is a draw mode or erase mode.
   */
  readonly drawMode: boolean;
  /**
   * The timestamp when the path was created. This is used to determine the order of the paths.
   *
   * @remarks
   * This will only be set when the withTimestamp option is set to true.
   */
  readonly startTimestamp?: number;
  /**
   * The timestamp when the path was last updated. This is used to determine the order of the paths.
   *
   * @remarks
   * This will only be set when the withTimestamp option is set to true.
   */
  readonly endTimestamp?: number;
}

export interface TouchExtends extends Touch {
  touchType: "direct" | "stylus";
}
