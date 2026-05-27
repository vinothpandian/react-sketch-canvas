import { useRef, useState } from "react";
import { ReactSketchCanvas, type ReactSketchCanvasRef } from "../../src";

export function WithSizedExportButton() {
	const canvasRef = useRef<ReactSketchCanvasRef>(null);
	const [imageSize, setImageSize] = useState("");

	const handleExport = async () => {
		const dataUri = await canvasRef.current?.exportImage("png", {
			width: 123,
			height: 77,
		});

		if (!dataUri) {
			return;
		}

		const image = new Image();
		image.onload = () => {
			setImageSize(`${image.naturalWidth}x${image.naturalHeight}`);
		};
		image.src = dataUri;
	};

	return (
		<div>
			<ReactSketchCanvas
				ref={canvasRef}
				id="rsc"
				width="300px"
				height="200px"
			/>
			<button type="button" id="export-sized-image" onClick={handleExport}>
				Export Sized Image
			</button>
			<output id="image-size">{imageSize}</output>
		</div>
	);
}
