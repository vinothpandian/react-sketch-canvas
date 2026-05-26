import { useRef } from "react";
import {
	type ExportImageType,
	ReactSketchCanvas,
	type ReactSketchCanvasProps,
	type ReactSketchCanvasRef,
} from "../../src";
import { convertDataURItoKiloBytes } from "../commands";

interface WithExportButtonProps extends ReactSketchCanvasProps {
	eraserButtonId: string;
	exportButtonId: string;
	exportSVGButtonId: string;
	imageType: ExportImageType;
	onExport?: (size: number) => void;
	onExportImage?: (dataURI: string | undefined) => void;
	onExportSVG?: (svg: string | undefined) => void;
}

export function WithExportButton({
	eraserButtonId,
	exportButtonId,
	exportSVGButtonId,
	imageType,
	onExport,
	onExportImage,
	onExportSVG,
	...canvasProps
}: WithExportButtonProps) {
	const canvasRef = useRef<ReactSketchCanvasRef>(null);

	const handleExportClick = async () => {
		const dataURI = await canvasRef.current?.exportImage(imageType);

		const size = convertDataURItoKiloBytes(dataURI);
		onExport?.(size);
		onExportImage?.(dataURI);
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
