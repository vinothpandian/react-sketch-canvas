import type { CanvasPath } from "../types";
import { SvgPath } from "./SvgPath";
import { bezierCommand } from "./geometry";

type PathProps = {
	id: string;
	paths: CanvasPath[];
};

function Paths({ id, paths }: PathProps): JSX.Element {
	return (
		<>
			{paths.map((path: CanvasPath, index: number) => (
				<SvgPath
					// biome-ignore lint/suspicious/noArrayIndexKey: stroke path order is stable and has no domain id.
					key={`${id}__${index}`}
					paths={path.paths}
					id={`${id}__${index}`}
					strokeWidth={path.strokeWidth}
					strokeColor={path.strokeColor}
					command={bezierCommand}
				/>
			))}
		</>
	);
}

export { bezierCommand, line } from "./geometry";
export { SvgPath };
export type { SvgPathProps } from "./SvgPath";
export default Paths;
