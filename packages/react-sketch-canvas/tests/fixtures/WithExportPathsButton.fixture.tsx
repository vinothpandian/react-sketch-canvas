import { type ComponentProps, useRef, useState } from "react";
import {
	type CanvasPath,
	ReactSketchCanvas,
	type ReactSketchCanvasRef,
} from "../../src";

type WithExportPathsButtonProps = ComponentProps<typeof ReactSketchCanvas> & {
	exportPathsButtonId: string;
	outputId: string;
};

export function WithExportPathsButton({
	exportPathsButtonId,
	outputId,
	...canvasProps
}: WithExportPathsButtonProps) {
	const canvasRef = useRef<ReactSketchCanvasRef>(null);
	const [paths, setPaths] = useState<CanvasPath[]>([]);

	const handleExportPaths = async () => {
		setPaths((await canvasRef.current?.exportPaths()) ?? []);
	};

	return (
		<div>
			<ReactSketchCanvas ref={canvasRef} {...canvasProps} />
			<button
				id={exportPathsButtonId}
				type="button"
				onClick={handleExportPaths}
			>
				Export paths
			</button>
			<output id={outputId}>{JSON.stringify(paths)}</output>
		</div>
	);
}
