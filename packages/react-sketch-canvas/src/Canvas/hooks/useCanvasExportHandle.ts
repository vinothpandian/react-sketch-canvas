import * as React from "react";
import type { ExportImageOptions, ExportImageType } from "../../types";
import { getCanvasWithViewBox } from "../export/dom";
import { exportImageFromSvg } from "../export/image";
import { prepareSvgForExport } from "../export/svg";
import type { CanvasProps, CanvasRef } from "../types";

type UseCanvasExportHandleParams = Required<Pick<CanvasProps, "id">> &
	Pick<
		CanvasProps,
		"canvasColor" | "backgroundImage" | "exportWithBackgroundImage"
	> & {
		canvasRef: React.RefObject<HTMLDivElement | null>;
	};

type UseCanvasExportHandleReturns = ReturnType<() => void>;

/**
 * Expose export methods from the low-level `Canvas` ref.
 *
 * @remarks
 * The hook centralizes all DOM cloning and SVG/image export wiring so the
 * component can stay focused on rendering and pointer handlers.
 */
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
