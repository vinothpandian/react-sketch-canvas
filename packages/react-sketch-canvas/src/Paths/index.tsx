import type { CanvasPath } from "../types";
import { SvgPath } from "./SvgPath";
import { bezierCommand } from "./geometry";

type PathProps = {
	id: string;
	paths: CanvasPath[];
};

/**
 * Render an ordered list of draw-mode paths.
 *
 * @remarks
 * Eraser paths are handled by SVG masks before this component receives its path
 * group, so every path rendered here is a visible stroke.
 */
function Paths({ id, paths }: PathProps): JSX.Element {
	return (
		<>
			{paths.map((path: CanvasPath, index: number) => (
				<SvgPath
					// biome-ignore lint/suspicious/noArrayIndexKey: stroke path order is stable and has no domain id.
					key={`${id}__${index}`}
					id={`${id}__${index}`}
					paths={path.paths}
					strokeWidth={path.strokeWidth}
					strokeColor={path.strokeColor}
					command={bezierCommand}
				/>
			))}
		</>
	);
}

/**
 * Geometry helpers are exported for focused unit tests and custom path
 * rendering experiments.
 */
export { bezierCommand, line } from "./geometry";
export { SvgPath };

/**
 * Props used by the internal SVG path renderer.
 */
export type { SvgPathProps } from "./SvgPath";
export default Paths;
