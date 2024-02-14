export type PointerEventType = "pen" | "touch" | "mouse";

export interface DrawSquareArgs {
  side: number;
  originX?: number;
  originY?: number;
  pointerType?: PointerEventType;
  eventButton?: 0 | 1 | 2 | 3 | 4;
  eventButtons?: number;
}

export interface DrawLineArgs extends Omit<DrawSquareArgs, "side"> {
  length: number;
}

export type DrawPointArgs = Omit<DrawSquareArgs, "side">;
