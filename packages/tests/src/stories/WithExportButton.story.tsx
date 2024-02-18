import { useRef } from "react";
import {
  ExportImageType,
  ReactSketchCanvas,
  ReactSketchCanvasProps,
  ReactSketchCanvasRef,
} from "react-sketch-canvas";
import { convertDataURItoKiloBytes } from "../commands";

interface WithExportButtonProps extends ReactSketchCanvasProps {
  eraserButtonId: string;
  exportButtonId: string;
  exportSVGButtonId: string;
  imageType: ExportImageType;
  onExport?: (size: number) => void;
  onExportSVG?: (svg: string | undefined) => void;
}

export function WithExportButton({
  eraserButtonId,
  exportButtonId,
  exportSVGButtonId,
  imageType,
  onExport,
  onExportSVG,
  ...canvasProps
}: WithExportButtonProps) {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);

  const handleExportClick = async () => {
    const dataURI = await canvasRef.current?.exportImage(imageType);

    const size = convertDataURItoKiloBytes(dataURI);
    onExport?.(size);
  };

  const handleEraserClick = () => {
    canvasRef.current?.eraseMode(true);
  };

  const handleExportSVGClick = async () => {
    const svg = await canvasRef.current?.exportSvg();
    onExportSVG?.(svg);
  };

  return (
    <div>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <ReactSketchCanvas ref={canvasRef} {...canvasProps} />
      <button id={eraserButtonId} type="button" onClick={handleEraserClick}>
        Eraser
      </button>
      <button id={exportButtonId} type="button" onClick={handleExportClick}>
        Export Image
      </button>
      <button
        id={exportSVGButtonId}
        type="button"
        onClick={handleExportSVGClick}
      >
        Export SVG
      </button>
    </div>
  );
}
