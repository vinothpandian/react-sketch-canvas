import { useRef } from "react";
import {
	type CanvasPath,
	ReactSketchCanvas,
	type ReactSketchCanvasProps,
	type ReactSketchCanvasRef,
} from "../../src";

interface WithLoadPathsButtonProps extends ReactSketchCanvasProps {
	loadPathsButtonId?: string;
	exportSVGButtonId?: string;
	paths: CanvasPath[];
	onExportSVG?: (svg: string | undefined) => void;
}

export function WithLoadPathsButton({
	loadPathsButtonId = "load-paths-button",
	exportSVGButtonId = "export-svg-button",
	paths,
	onExportSVG,
	...canvasProps
}: WithLoadPathsButtonProps) {
	const canvasRef = useRef<ReactSketchCanvasRef>(null);

	const handleLoadPathsClick = () => {
		canvasRef.current?.loadPaths(paths);
	};

	const handleExportSVGClick = async () => {
		onExportSVG?.(await canvasRef.current?.exportSvg());
	};

	return (
		<div>
			<ReactSketchCanvas ref={canvasRef} {...canvasProps} />
			<button
				id={loadPathsButtonId}
				type="button"
				onClick={handleLoadPathsClick}
			>
				Load Paths
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
