import * as React from 'react';
import { CanvasPath, ExportImageType } from '../types';

export interface ReactSketchCanvasProps {
  id?: string;
  width?: string;
  height?: string;
  className?: string;
  strokeColor?: string;
  canvasColor?: string;
  backgroundImage?: string;
  exportWithBackgroundImage?: boolean;
  preserveBackgroundImageAspectRatio?: string;
  strokeWidth?: number;
  eraserWidth?: number;
  allowOnlyPointerType?: string;
  onChange?: (updatedPaths: CanvasPath[]) => void;
  onStroke?: (path: CanvasPath, isEraser: boolean) => void;
  style?: React.CSSProperties;
  withTimestamp?: boolean;
}

export interface ReactSketchCanvasRef {
  eraseMode: (erase: boolean) => void;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  exportImage: (imageType: ExportImageType) => Promise<string>;
  exportSvg: () => Promise<string>;
  exportPaths: () => Promise<CanvasPath[]>;
  loadPaths: (paths: CanvasPath[]) => void;
  getSketchingTime: () => Promise<number>;
  resetCanvas: () => void;
}
