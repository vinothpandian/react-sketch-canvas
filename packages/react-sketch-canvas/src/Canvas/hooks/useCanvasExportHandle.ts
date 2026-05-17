import * as React from "react";
import type { ExportImageOptions, ExportImageType } from "../../types";
import { getCanvasWithViewBox } from "../export/dom";
import { exportImageFromSvg } from "../export/image";
import { prepareSvgForExport } from "../export/svg";
import type { CanvasRef } from "../types";

type UseCanvasExportHandleParams = {
	canvasRef: React.RefObject<HTMLDivElement>;
	id: string;
	canvasColor: string;
	backgroundImage: string;
	exportWithBackgroundImage: boolean;
};

type UseCanvasExportHandleReturns = ReturnType<() => void>;

export function useCanvasExportHandle(
	ref: React.ForwardedRef<CanvasRef>,
	{
		canvasRef,
		id,
		canvasColor,
		backgroundImage,
		exportWithBackgroundImage,
	}: UseCanvasExportHandleParams,
): UseCanvasExportHandleReturns {
	React.useImperativeHandle(ref, () => ({
		exportImage: async (
			imageType: ExportImageType,
			options?: ExportImageOptions,
		): Promise<string> => {
			const canvas = canvasRef.current;

			if (!canvas) {
				throw Error("Canvas not rendered yet");
			}

			const { svgCanvas, width, height } = getCanvasWithViewBox(canvas);

			return exportImageFromSvg({
				svgCanvas,
				svgWidth: width,
				svgHeight: height,
				imageType,
				canvasColor,
				backgroundImage,
				exportWithBackgroundImage,
				options,
			});
		},
		exportSvg: async (): Promise<string> => {
			const canvas = canvasRef.current;

			if (!canvas) {
				throw new Error("Canvas not loaded");
			}

			const { svgCanvas } = getCanvasWithViewBox(canvas);
			return prepareSvgForExport(svgCanvas, {
				id,
				canvasColor,
				exportWithBackgroundImage,
			}).outerHTML;
		},
	}));
}
