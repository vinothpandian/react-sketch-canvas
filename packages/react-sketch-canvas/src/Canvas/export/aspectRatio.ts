import type { PreserveAspectRatio } from "./backgroundPlan";

type SvgAspectRatioAlign = "Min" | "Mid" | "Max";

type SvgAspectRatioMode = "meet" | "slice";

/**
 * Parsed SVG aspect-ratio alignment and scaling mode.
 */
export type ParsedSvgAspectRatio = {
	xAlign: SvgAspectRatioAlign;
	yAlign: SvgAspectRatioAlign;
	mode: SvgAspectRatioMode;
};

/**
 * Parse the SVG `preserveAspectRatio` value used for background image drawing.
 */
export function parseSvgAspectRatio(
	preserveAspectRatio: PreserveAspectRatio,
): ParsedSvgAspectRatio | null {
	if (!preserveAspectRatio || preserveAspectRatio === "none") {
		return null;
	}

	const [align = "xMidYMid", mode = "meet"] = preserveAspectRatio.split(/\s+/);
	const alignMatch = /^x(Min|Mid|Max)Y(Min|Mid|Max)$/.exec(align);

	return {
		xAlign: (alignMatch?.[1] ?? "Mid") as SvgAspectRatioAlign,
		yAlign: (alignMatch?.[2] ?? "Mid") as SvgAspectRatioAlign,
		mode: mode === "slice" ? "slice" : "meet",
	};
}

/**
 * Resolve the start offset for `meet` letterboxing or `slice` cropping.
 */
export function resolveAlignedOffset(
	containerSize: number,
	contentSize: number,
	align: SvgAspectRatioAlign,
): number {
	if (align === "Min") {
		return 0;
	}

	const remainingSize = containerSize - contentSize;

	if (align === "Max") {
		return remainingSize;
	}

	return remainingSize / 2;
}
