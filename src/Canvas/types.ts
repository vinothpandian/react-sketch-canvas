import * as React from 'react';
import { CanvasPath, ExportImageType, Point } from '../types';

export interface CanvasProps {
  paths: CanvasPath[];
  isDrawing: boolean;
  onPointerDown: (point: Point) => void;
  onPointerMove: (point: Point) => void;
  onPointerUp: () => void;
  className?: string;
  id?: string;
  width: string;
  height: string;
  canvasColor: string;
  backgroundImage: string;
  exportWithBackgroundImage: boolean;
  preserveBackgroundImageAspectRatio: string;
  allowOnlyPointerType: string;
  style: React.CSSProperties;
}

export interface CanvasRef {
  exportImage: (imageType: ExportImageType) => Promise<string>;
  exportSvg: () => Promise<string>;
}
