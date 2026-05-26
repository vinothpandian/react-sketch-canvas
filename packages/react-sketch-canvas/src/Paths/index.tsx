import type * as React from "react";
import type { CanvasPath } from "../types";
import { bezierCommand } from "./geometry";
import { SvgPath } from "./SvgPath";

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
function Paths({ id, paths }: PathProps): React.JSX.Element {
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

export default Paths;
