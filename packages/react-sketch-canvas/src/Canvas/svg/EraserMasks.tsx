import { SvgPath } from "../../Paths";
import type { CanvasPath } from "../../types";

type EraserMasksProps = {
	id: string;
	eraserPaths: CanvasPath[];
};

export function HiddenEraserStrokes({
	id,
	eraserPaths,
}: EraserMasksProps): JSX.Element {
	return (
		<g id={`${id}__eraser-stroke-group`} display="none">
			<rect
				id={`${id}__mask-background`}
				x="0"
				y="0"
				width="100%"
				height="100%"
				fill="white"
			/>
			{eraserPaths.map((eraserPath, i) => (
				<SvgPath
					// biome-ignore lint/suspicious/noArrayIndexKey: eraser masks are generated from ordered strokes with no domain id.
					key={`${id}__eraser-${i}`}
					id={`${id}__eraser-${i}`}
					paths={eraserPath.paths}
					strokeColor="#000000"
					strokeWidth={eraserPath.strokeWidth}
				/>
			))}
		</g>
	);
}

export function EraserMaskDefs({
	id,
	eraserPaths,
}: EraserMasksProps): JSX.Element {
	return (
		<>
			{eraserPaths.map((_, i) => (
				<mask
					id={`${id}__eraser-mask-${i}`}
					// biome-ignore lint/suspicious/noArrayIndexKey: mask order is tied to ordered eraser strokes.
					key={`${id}__eraser-mask-${i}`}
					maskUnits="userSpaceOnUse"
				>
					<use
						href={`#${id}__mask-background`}
						xlinkHref={`#${id}__mask-background`}
					/>
					{Array.from({ length: eraserPaths.length - i }, (_i, j) => j + i).map(
						(k) => (
							<use
								key={k.toString()}
								href={`#${id}__eraser-${k.toString()}`}
								xlinkHref={`#${id}__eraser-${k.toString()}`}
							/>
						),
					)}
				</mask>
			))}
		</>
	);
}
