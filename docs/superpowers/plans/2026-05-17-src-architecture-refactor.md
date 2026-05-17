# React Sketch Canvas Source Architecture Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `packages/react-sketch-canvas/src` into focused, testable modules while preserving the current public API and runtime behavior.

**Architecture:** Extract pure domain logic first, then React hooks, then thin composition components. `ReactSketchCanvas` owns sketch state and public ref behavior, `Canvas` owns DOM/pointer/export behavior, `Canvas/svg` owns SVG composition, and `Paths` separates geometry from rendering.

**Tech Stack:** TypeScript, React 18, Vitest, Testing Library React, happy-dom, Playwright CT/e2e, Biome, pnpm.

---

## Scope Check

This plan implements the approved source architecture refactor in one cycle. It touches one package implementation area and its tests: `packages/react-sketch-canvas/src` and `packages/react-sketch-canvas/tests/unit`. It must not change public props, ref method names, package exports, drawing semantics, eraser semantics, export semantics, or callback timing unless a blocking bug is found and the user approves a behavior change.

## File Structure

Create:

- `packages/react-sketch-canvas/src/Paths/geometry.ts`: pure line, control point, and bezier command helpers.
- `packages/react-sketch-canvas/src/Paths/SvgPath.tsx`: single-stroke SVG rendering component.
- `packages/react-sketch-canvas/src/Canvas/svg/grouping.ts`: pure eraser and draw path grouping helpers.
- `packages/react-sketch-canvas/src/Canvas/svg/Background.tsx`: SVG background pattern and rect rendering.
- `packages/react-sketch-canvas/src/Canvas/svg/EraserMasks.tsx`: hidden eraser path group and mask definitions.
- `packages/react-sketch-canvas/src/Canvas/svg/StrokeGroups.tsx`: grouped drawing strokes with mask references.
- `packages/react-sketch-canvas/src/Canvas/svg/CanvasSvg.tsx`: top-level SVG composition.
- `packages/react-sketch-canvas/src/Canvas/hooks/useCanvasPointerHandlers.ts`: pointer filtering, coordinate conversion, and document `pointerup` wiring.
- `packages/react-sketch-canvas/src/Canvas/hooks/useCanvasExportHandle.ts`: lower-level `CanvasRef` imperative export handle.
- `packages/react-sketch-canvas/src/Canvas/export/dom.ts`: SVG clone and sizing helpers.
- `packages/react-sketch-canvas/src/Canvas/export/svg.ts`: SVG export preparation helpers.
- `packages/react-sketch-canvas/src/Canvas/export/image.ts`: image loading and render-canvas export helpers.
- `packages/react-sketch-canvas/src/ReactSketchCanvas/state/strokes.ts`: pure stroke creation/update/finalization helpers.
- `packages/react-sketch-canvas/src/ReactSketchCanvas/state/sketchingTime.ts`: pure sketching-time calculation.
- `packages/react-sketch-canvas/src/ReactSketchCanvas/state/history.ts`: pure history and path state transitions.
- `packages/react-sketch-canvas/src/ReactSketchCanvas/state/operations.ts`: operation type and operation reducer helpers.
- `packages/react-sketch-canvas/src/ReactSketchCanvas/hooks/useSketchCanvasController.ts`: React state orchestration and drawing lifecycle.
- `packages/react-sketch-canvas/src/ReactSketchCanvas/hooks/useSketchCanvasImperativeHandle.ts`: public `ReactSketchCanvasRef` wiring.
- `packages/react-sketch-canvas/tests/unit/paths/geometry.spec.ts`
- `packages/react-sketch-canvas/tests/unit/paths/SvgPath.spec.tsx`
- `packages/react-sketch-canvas/tests/unit/canvas/grouping.spec.ts`
- `packages/react-sketch-canvas/tests/unit/canvas/pointer.spec.ts`
- `packages/react-sketch-canvas/tests/unit/canvas/svgExport.spec.ts`
- `packages/react-sketch-canvas/tests/unit/canvas/useCanvasPointerHandlers.spec.tsx`
- `packages/react-sketch-canvas/tests/unit/canvas/useCanvasExportHandle.spec.tsx`
- `packages/react-sketch-canvas/tests/unit/react-sketch-canvas/strokes.spec.ts`
- `packages/react-sketch-canvas/tests/unit/react-sketch-canvas/sketchingTime.spec.ts`
- `packages/react-sketch-canvas/tests/unit/react-sketch-canvas/history.spec.ts`
- `packages/react-sketch-canvas/tests/unit/react-sketch-canvas/operations.spec.ts`
- `packages/react-sketch-canvas/tests/unit/react-sketch-canvas/useSketchCanvasController.spec.tsx`
- `packages/react-sketch-canvas/tests/unit/react-sketch-canvas/useSketchCanvasImperativeHandle.spec.tsx`

Modify:

- `packages/react-sketch-canvas/src/Paths/index.tsx`: re-export geometry and `SvgPath`, keep default `Paths`.
- `packages/react-sketch-canvas/src/Canvas/index.tsx`: reduce to container/ref composition.
- `packages/react-sketch-canvas/src/Canvas/types.ts`: add internal prop types only if shared by new modules.
- `packages/react-sketch-canvas/src/ReactSketchCanvas/index.tsx`: reduce to prop defaults, controller hook, imperative hook, and `Canvas`.
- `packages/react-sketch-canvas/tests/unit/paths.spec.tsx`: split or delete after replacement tests cover the same assertions.
- `packages/react-sketch-canvas/tests/unit/react-sketch-canvas.spec.tsx`: keep or move into the new nested structure.

---

## Task 1: Baseline And Test Harness Sanity

**Files:**

- Read: `packages/react-sketch-canvas/src/Canvas/index.tsx`
- Read: `packages/react-sketch-canvas/src/ReactSketchCanvas/index.tsx`
- Read: `packages/react-sketch-canvas/src/Paths/index.tsx`
- Read: `packages/react-sketch-canvas/vitest.config.mts`
- Read: `packages/react-sketch-canvas/package.json`

- [ ] **Step 1: Confirm the worktree is clean**

Run:

```bash
git status --short
```

Expected: no output. If unrelated user changes exist, do not revert them; inspect whether they touch files in this plan before continuing.

- [ ] **Step 2: Run current fast tests**

Run:

```bash
pnpm --filter react-sketch-canvas test:unit
```

Expected: PASS with the existing `tests/unit/paths.spec.tsx` and `tests/unit/react-sketch-canvas.spec.tsx`.

- [ ] **Step 3: Run current lint on the package**

Run:

```bash
pnpm --filter react-sketch-canvas lint
```

Expected: PASS. If lint fails on pre-existing unrelated files, capture the exact output and ask before broad cleanup.

- [ ] **Step 4: Commit only if baseline required a repo change**

Run:

```bash
git status --short
```

Expected: no source changes from baseline commands. Do not commit generated output.

---

## Task 2: Extract Paths Geometry And SvgPath

**Files:**

- Create: `packages/react-sketch-canvas/src/Paths/geometry.ts`
- Create: `packages/react-sketch-canvas/src/Paths/SvgPath.tsx`
- Modify: `packages/react-sketch-canvas/src/Paths/index.tsx`
- Create: `packages/react-sketch-canvas/tests/unit/paths/geometry.spec.ts`
- Create: `packages/react-sketch-canvas/tests/unit/paths/SvgPath.spec.tsx`
- Delete after replacement: `packages/react-sketch-canvas/tests/unit/paths.spec.tsx`

- [ ] **Step 1: Write failing geometry tests**

Create `packages/react-sketch-canvas/tests/unit/paths/geometry.spec.ts`:

```ts
import { describe, expect, it } from "vitest";
import { bezierCommand, line } from "../../../src/Paths/geometry";

describe("Paths geometry", () => {
	it("measures the length and angle between two points", () => {
		const segment = line({ x: 0, y: 0 }, { x: 3, y: 4 });

		expect(segment.length).toBe(5);
		expect(segment.angle).toBeCloseTo(Math.atan2(4, 3));
	});

	it("builds a smooth cubic bezier command from neighboring points", () => {
		const command = bezierCommand({ x: 10, y: 0 }, 1, [
			{ x: 0, y: 0 },
			{ x: 10, y: 0 },
			{ x: 20, y: 10 },
		]);

		expect(command).toBe("C 2,0 5.999999999999999,-1.9999999999999998 10, 0");
	});
});
```

- [ ] **Step 2: Run geometry tests and verify the expected failure**

Run:

```bash
pnpm --filter react-sketch-canvas exec vitest run tests/unit/paths/geometry.spec.ts
```

Expected: FAIL because `src/Paths/geometry` does not exist.

- [ ] **Step 3: Extract geometry helpers**

Create `packages/react-sketch-canvas/src/Paths/geometry.ts`:

```ts
import type { Point } from "../types";

type ControlPoints = {
	current: Point;
	previous?: Point;
	next?: Point;
	reverse?: boolean;
};

export const line = (pointA: Point, pointB: Point) => {
	const lengthX = pointB.x - pointA.x;
	const lengthY = pointB.y - pointA.y;

	return {
		length: Math.sqrt(lengthX ** 2 + lengthY ** 2),
		angle: Math.atan2(lengthY, lengthX),
	};
};

const controlPoint = (controlPoints: ControlPoints): [number, number] => {
	const { current, next, previous, reverse } = controlPoints;
	const p = previous || current;
	const n = next || current;
	const smoothing = 0.2;
	const o = line(p, n);
	const angle = o.angle + (reverse ? Math.PI : 0);
	const length = o.length * smoothing;

	return [
		current.x + Math.cos(angle) * length,
		current.y + Math.sin(angle) * length,
	];
};

export const bezierCommand = (point: Point, i: number, a: Point[]): string => {
	let cpsX: number;
	let cpsY: number;

	switch (i) {
		case 0:
			[cpsX, cpsY] = controlPoint({ current: point });
			break;
		case 1:
			[cpsX, cpsY] = controlPoint({ current: a[i - 1], next: point });
			break;
		default:
			[cpsX, cpsY] = controlPoint({
				current: a[i - 1],
				previous: a[i - 2],
				next: point,
			});
			break;
	}

	const [cpeX, cpeY] = controlPoint({
		current: point,
		previous: a[i - 1],
		next: a[i + 1],
		reverse: true,
	});

	return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point.x}, ${point.y}`;
};
```

- [ ] **Step 4: Run geometry tests and verify they pass**

Run:

```bash
pnpm --filter react-sketch-canvas exec vitest run tests/unit/paths/geometry.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Write failing SvgPath tests**

Create `packages/react-sketch-canvas/tests/unit/paths/SvgPath.spec.tsx`:

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SvgPath } from "../../../src/Paths/SvgPath";

describe("SvgPath", () => {
	it("renders a circle for a single-point stroke", () => {
		render(
			<svg aria-hidden="true">
				<SvgPath
					id="single-point"
					paths={[{ x: 12, y: 24 }]}
					strokeColor="blue"
					strokeWidth={8}
				/>
			</svg>,
		);

		const circle = document.querySelector("circle#single-point");

		expect(circle).toBeInstanceOf(SVGCircleElement);
		expect(circle?.getAttribute("cx")).toBe("12");
		expect(circle?.getAttribute("cy")).toBe("24");
		expect(circle?.getAttribute("r")).toBe("4");
		expect(circle?.getAttribute("fill")).toBe("blue");
	});

	it("renders a path for a multi-point stroke", () => {
		render(
			<svg aria-hidden="true">
				<SvgPath
					id="multi-point"
					paths={[
						{ x: 0, y: 0 },
						{ x: 10, y: 0 },
					]}
					strokeColor="red"
					strokeWidth={6}
					command={(point) => `L ${point.x},${point.y}`}
				/>
			</svg>,
		);

		const path = document.querySelector("path#multi-point");

		expect(path).toBeInstanceOf(SVGPathElement);
		expect(path?.getAttribute("d")).toBe("M 0,0 L 10,0");
		expect(path?.getAttribute("stroke")).toBe("red");
		expect(path?.getAttribute("stroke-width")).toBe("6");
		expect(path?.getAttribute("fill")).toBe("none");
	});
});
```

- [ ] **Step 6: Run SvgPath tests and verify the expected failure**

Run:

```bash
pnpm --filter react-sketch-canvas exec vitest run tests/unit/paths/SvgPath.spec.tsx
```

Expected: FAIL because `src/Paths/SvgPath` does not exist.

- [ ] **Step 7: Extract SvgPath component and update Paths barrel**

Create `packages/react-sketch-canvas/src/Paths/SvgPath.tsx`:

```tsx
import type { Point } from "../types";
import { bezierCommand } from "./geometry";

export type SvgPathProps = {
	paths: Point[];
	id: string;
	strokeWidth: number;
	strokeColor: string;
	command?: (point: Point, i: number, a: Point[]) => string;
};

export function SvgPath({
	paths,
	id,
	strokeWidth,
	strokeColor,
	command = bezierCommand,
}: SvgPathProps): JSX.Element {
	if (paths.length === 1) {
		const { x, y } = paths[0];
		const radius = strokeWidth / 2;

		return (
			<circle
				key={id}
				id={id}
				cx={x}
				cy={y}
				r={radius}
				stroke={strokeColor}
				fill={strokeColor}
			/>
		);
	}

	const d = paths.reduce(
		(acc, point, i, a) =>
			i === 0 ? `M ${point.x},${point.y}` : `${acc} ${command(point, i, a)}`,
		"",
	);

	return (
		<path
			key={id}
			id={id}
			d={d}
			fill="none"
			strokeLinecap="round"
			stroke={strokeColor}
			strokeWidth={strokeWidth}
		/>
	);
}
```

Replace `packages/react-sketch-canvas/src/Paths/index.tsx` with:

```tsx
import type { CanvasPath } from "../types";
import { bezierCommand } from "./geometry";
import { SvgPath } from "./SvgPath";

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
```

- [ ] **Step 8: Remove replaced old unit file**

Run:

```bash
git rm packages/react-sketch-canvas/tests/unit/paths.spec.tsx
```

Expected: the old combined unit test file is removed because the new nested tests cover the same assertions.

- [ ] **Step 9: Run paths unit tests**

Run:

```bash
pnpm --filter react-sketch-canvas exec vitest run tests/unit/paths
```

Expected: PASS.

- [ ] **Step 10: Run package unit tests**

Run:

```bash
pnpm --filter react-sketch-canvas test:unit
```

Expected: PASS.

- [ ] **Step 11: Commit Paths extraction**

Run:

```bash
git add packages/react-sketch-canvas/src/Paths packages/react-sketch-canvas/tests/unit/paths
git add -A packages/react-sketch-canvas/tests/unit/paths.spec.tsx
git commit -m "refactor: split path geometry and rendering"
```

Expected: conventional commit succeeds.

---

## Task 3: Extract Canvas SVG Grouping And Presentational Components

**Files:**

- Create: `packages/react-sketch-canvas/src/Canvas/svg/grouping.ts`
- Create: `packages/react-sketch-canvas/src/Canvas/svg/Background.tsx`
- Create: `packages/react-sketch-canvas/src/Canvas/svg/EraserMasks.tsx`
- Create: `packages/react-sketch-canvas/src/Canvas/svg/StrokeGroups.tsx`
- Create: `packages/react-sketch-canvas/src/Canvas/svg/CanvasSvg.tsx`
- Modify: `packages/react-sketch-canvas/src/Canvas/index.tsx`
- Create: `packages/react-sketch-canvas/tests/unit/canvas/grouping.spec.ts`

- [ ] **Step 1: Write failing grouping tests**

Create `packages/react-sketch-canvas/tests/unit/canvas/grouping.spec.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { CanvasPath } from "../../../src/types";
import { getEraserPaths, getPathGroups } from "../../../src/Canvas/svg/grouping";

const draw = (id: number): CanvasPath => ({
	drawMode: true,
	strokeColor: `draw-${id}`,
	strokeWidth: id,
	paths: [{ x: id, y: id }],
});

const erase = (id: number): CanvasPath => ({
	drawMode: false,
	strokeColor: "#000000",
	strokeWidth: id,
	paths: [{ x: id, y: id }],
});

describe("canvas SVG grouping", () => {
	it("returns only eraser paths", () => {
		expect(getEraserPaths([draw(1), erase(2), draw(3), erase(4)])).toEqual([
			erase(2),
			erase(4),
		]);
	});

	it("groups draw paths between eraser strokes", () => {
		expect(getPathGroups([draw(1), draw(2), erase(3), draw(4), erase(5)])).toEqual([
			[draw(1), draw(2)],
			[draw(4)],
		]);
	});

	it("keeps an initial empty group when the first stroke is an eraser", () => {
		expect(getPathGroups([erase(1), draw(2)])).toEqual([[], [draw(2)]]);
	});
});
```

- [ ] **Step 2: Run grouping tests and verify the expected failure**

Run:

```bash
pnpm --filter react-sketch-canvas exec vitest run tests/unit/canvas/grouping.spec.ts
```

Expected: FAIL because `src/Canvas/svg/grouping` does not exist.

- [ ] **Step 3: Extract grouping helpers**

Create `packages/react-sketch-canvas/src/Canvas/svg/grouping.ts`:

```ts
import type { CanvasPath } from "../../types";

export const getEraserPaths = (paths: CanvasPath[]): CanvasPath[] =>
	paths.filter((path) => !path.drawMode);

export const getPathGroups = (paths: CanvasPath[]): CanvasPath[][] => {
	let currentGroup = 0;

	return paths.reduce<CanvasPath[][]>(
		(arrayGroup, path) => {
			if (!path.drawMode) {
				currentGroup += 1;
				return arrayGroup;
			}

			if (arrayGroup[currentGroup] === undefined) {
				arrayGroup[currentGroup] = [];
			}

			arrayGroup[currentGroup].push(path);
			return arrayGroup;
		},
		[[]],
	);
};
```

- [ ] **Step 4: Run grouping tests and verify they pass**

Run:

```bash
pnpm --filter react-sketch-canvas exec vitest run tests/unit/canvas/grouping.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Create Background component**

Create `packages/react-sketch-canvas/src/Canvas/svg/Background.tsx`:

```tsx
import type * as React from "react";

type BackgroundProps = {
	id: string;
	backgroundImage: string;
	canvasColor: string;
	preserveBackgroundImageAspectRatio?: React.SVGAttributes<HTMLImageElement>["preserveAspectRatio"];
};

export function BackgroundPattern({
	id,
	backgroundImage,
	preserveBackgroundImageAspectRatio,
}: Pick<
	BackgroundProps,
	"id" | "backgroundImage" | "preserveBackgroundImageAspectRatio"
>): JSX.Element | null {
	if (!backgroundImage) return null;

	return (
		<pattern
			id={`${id}__background`}
			x="0"
			y="0"
			width="100%"
			height="100%"
			patternUnits="userSpaceOnUse"
		>
			<image
				x="0"
				y="0"
				width="100%"
				height="100%"
				xlinkHref={backgroundImage}
				preserveAspectRatio={preserveBackgroundImageAspectRatio}
			/>
		</pattern>
	);
}

export function BackgroundRect({
	id,
	backgroundImage,
	canvasColor,
}: Pick<BackgroundProps, "id" | "backgroundImage" | "canvasColor">): JSX.Element {
	return (
		<g id={`${id}__canvas-background-group`}>
			<rect
				id={`${id}__canvas-background`}
				x="0"
				y="0"
				width="100%"
				height="100%"
				fill={backgroundImage ? `url(#${id}__background)` : canvasColor}
			/>
		</g>
	);
}
```

- [ ] **Step 6: Create EraserMasks component**

Create `packages/react-sketch-canvas/src/Canvas/svg/EraserMasks.tsx`:

```tsx
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
```

- [ ] **Step 7: Create StrokeGroups component**

Create `packages/react-sketch-canvas/src/Canvas/svg/StrokeGroups.tsx`:

```tsx
import Paths from "../../Paths";
import type { CanvasPath } from "../../types";

type StrokeGroupsProps = {
	id: string;
	pathGroups: CanvasPath[][];
	eraserPaths: CanvasPath[];
};

export function StrokeGroups({
	id,
	pathGroups,
	eraserPaths,
}: StrokeGroupsProps): JSX.Element {
	return (
		<>
			{pathGroups.map((pathGroup, i) => (
				<g
					id={`${id}__stroke-group-${i}`}
					// biome-ignore lint/suspicious/noArrayIndexKey: stroke groups are ordered drawing segments with no domain id.
					key={`${id}__stroke-group-${i}`}
					{...(eraserPaths[i] ? { mask: `url(#${id}__eraser-mask-${i})` } : {})}
				>
					<Paths id={`${id}__stroke-group-${i}__paths`} paths={pathGroup} />
				</g>
			))}
		</>
	);
}
```

- [ ] **Step 8: Create CanvasSvg component**

Create `packages/react-sketch-canvas/src/Canvas/svg/CanvasSvg.tsx`:

```tsx
import type * as React from "react";
import type { CanvasPath } from "../../types";
import { BackgroundPattern, BackgroundRect } from "./Background";
import { EraserMaskDefs, HiddenEraserStrokes } from "./EraserMasks";
import { getEraserPaths, getPathGroups } from "./grouping";
import { StrokeGroups } from "./StrokeGroups";

type CanvasSvgProps = {
	id: string;
	paths: CanvasPath[];
	canvasColor: string;
	backgroundImage: string;
	preserveBackgroundImageAspectRatio?: React.SVGAttributes<HTMLImageElement>["preserveAspectRatio"];
	svgStyle: React.CSSProperties;
	viewBox?: string;
};

export function CanvasSvg({
	id,
	paths,
	canvasColor,
	backgroundImage,
	preserveBackgroundImageAspectRatio,
	svgStyle,
	viewBox,
}: CanvasSvgProps): JSX.Element {
	const eraserPaths = getEraserPaths(paths);
	const pathGroups = getPathGroups(paths);

	return (
		<svg
			version="1.1"
			baseProfile="full"
			xmlns="http://www.w3.org/2000/svg"
			xmlnsXlink="http://www.w3.org/1999/xlink"
			aria-hidden="true"
			style={{
				width: "100%",
				height: "100%",
				...svgStyle,
			}}
			id={id}
			viewBox={viewBox}
		>
			<HiddenEraserStrokes id={id} eraserPaths={eraserPaths} />
			<defs>
				<BackgroundPattern
					id={id}
					backgroundImage={backgroundImage}
					preserveBackgroundImageAspectRatio={preserveBackgroundImageAspectRatio}
				/>
				<EraserMaskDefs id={id} eraserPaths={eraserPaths} />
			</defs>
			<BackgroundRect
				id={id}
				backgroundImage={backgroundImage}
				canvasColor={canvasColor}
			/>
			<StrokeGroups id={id} pathGroups={pathGroups} eraserPaths={eraserPaths} />
		</svg>
	);
}
```

- [ ] **Step 9: Replace inline SVG rendering in Canvas**

In `packages/react-sketch-canvas/src/Canvas/index.tsx`, add:

```ts
import { CanvasSvg } from "./svg/CanvasSvg";
```

Remove the local `eraserPaths` and `pathGroups` `useMemo` blocks. Replace the inline `<svg>...</svg>` block in the return with:

```tsx
<CanvasSvg
	id={id}
	paths={paths}
	canvasColor={canvasColor}
	backgroundImage={backgroundImage}
	preserveBackgroundImageAspectRatio={preserveBackgroundImageAspectRatio}
	svgStyle={svgStyle}
	viewBox={viewBox}
/>
```

Also remove imports that become unused after deleting inline SVG logic:

```ts
import Paths, { SvgPath } from "../Paths";
import type { CanvasPath } from "../types";
```

Keep the remaining type imports needed by export and pointer logic.

- [ ] **Step 10: Run canvas grouping and unit tests**

Run:

```bash
pnpm --filter react-sketch-canvas exec vitest run tests/unit/canvas/grouping.spec.ts
pnpm --filter react-sketch-canvas test:unit
```

Expected: both commands PASS.

- [ ] **Step 11: Run Playwright canvas smoke tests**

Run:

```bash
pnpm --filter react-sketch-canvas test:ct -- tests/canvas/canvas.spec.tsx tests/actions/erase.spec.tsx
```

Expected: PASS. These tests guard that SVG composition and eraser behavior still render correctly in a browser.

- [ ] **Step 12: Commit Canvas SVG extraction**

Run:

```bash
git add packages/react-sketch-canvas/src/Canvas packages/react-sketch-canvas/tests/unit/canvas/grouping.spec.ts
git commit -m "refactor: split canvas svg rendering"
```

Expected: conventional commit succeeds.

---

## Task 4: Extract Canvas Pointer Handling

**Files:**

- Create: `packages/react-sketch-canvas/src/Canvas/hooks/useCanvasPointerHandlers.ts`
- Modify: `packages/react-sketch-canvas/src/Canvas/index.tsx`
- Create: `packages/react-sketch-canvas/tests/unit/canvas/pointer.spec.ts`
- Create: `packages/react-sketch-canvas/tests/unit/canvas/useCanvasPointerHandlers.spec.tsx`

- [ ] **Step 1: Write failing pure pointer tests**

Create `packages/react-sketch-canvas/tests/unit/canvas/pointer.spec.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
	getCanvasPoint,
	isAllowedPointerType,
	isPenEraser,
	shouldHandlePointerButton,
} from "../../../src/Canvas/hooks/useCanvasPointerHandlers";

describe("canvas pointer helpers", () => {
	it("allows all pointer types when configured as all", () => {
		expect(isAllowedPointerType("all", "mouse")).toBe(true);
		expect(isAllowedPointerType("all", "pen")).toBe(true);
		expect(isAllowedPointerType("all", "touch")).toBe(true);
	});

	it("rejects pointer types that do not match the configured type", () => {
		expect(isAllowedPointerType("pen", "mouse")).toBe(false);
		expect(isAllowedPointerType("pen", "pen")).toBe(true);
	});

	it("ignores non-primary mouse buttons", () => {
		expect(shouldHandlePointerButton("mouse", 0)).toBe(true);
		expect(shouldHandlePointerButton("mouse", 2)).toBe(false);
		expect(shouldHandlePointerButton("pen", 5)).toBe(true);
	});

	it("detects pen eraser button bit", () => {
		expect(isPenEraser("pen", 32)).toBe(true);
		expect(isPenEraser("pen", 64)).toBe(false);
		expect(isPenEraser("mouse", 32)).toBe(false);
	});

	it("converts page coordinates into canvas-relative coordinates", () => {
		const point = getCanvasPoint(
			{ pageX: 150, pageY: 220 },
			{ left: 100, top: 200 },
			{ scrollX: 10, scrollY: 20 },
		);

		expect(point).toEqual({ x: 40, y: 0 });
	});
});
```

- [ ] **Step 2: Run pointer tests and verify the expected failure**

Run:

```bash
pnpm --filter react-sketch-canvas exec vitest run tests/unit/canvas/pointer.spec.ts
```

Expected: FAIL because `useCanvasPointerHandlers` does not exist.

- [ ] **Step 3: Create pointer hook and pure helpers**

Create `packages/react-sketch-canvas/src/Canvas/hooks/useCanvasPointerHandlers.ts`:

```ts
import * as React from "react";
import { useCallback } from "react";
import type { AllowOnlyPointerType } from "../types";
import type { Point } from "../../types";

const ERASER_BUTTON_MASK = 32;

type PointerLike = {
	pageX: number;
	pageY: number;
};

type BoundsLike = {
	left: number;
	top: number;
};

type ScrollLike = {
	scrollX: number;
	scrollY: number;
};

type UseCanvasPointerHandlersParams = {
	canvasRef: React.RefObject<HTMLDivElement>;
	canvasSizeRef: React.MutableRefObject<{ width: number; height: number } | null>;
	isDrawing: boolean;
	allowOnlyPointerType: AllowOnlyPointerType;
	onPointerDown: (point: Point, isEraser?: boolean) => void;
	onPointerMove: (point: Point) => void;
	onPointerUp: () => void;
};

export const isAllowedPointerType = (
	allowOnlyPointerType: AllowOnlyPointerType,
	pointerType: string,
): boolean =>
	allowOnlyPointerType === "all" || pointerType === allowOnlyPointerType;

export const shouldHandlePointerButton = (
	pointerType: string,
	button: number,
): boolean => !(pointerType === "mouse" && button !== 0);

export const isPenEraser = (pointerType: string, buttons: number): boolean =>
	pointerType === "pen" && Math.floor(buttons / ERASER_BUTTON_MASK) % 2 === 1;

export const getCanvasPoint = (
	pointerEvent: PointerLike,
	boundingArea: BoundsLike,
	scroll: ScrollLike,
): Point => ({
	x: pointerEvent.pageX - boundingArea.left - scroll.scrollX,
	y: pointerEvent.pageY - boundingArea.top - scroll.scrollY,
});

export function useCanvasPointerHandlers({
	canvasRef,
	canvasSizeRef,
	isDrawing,
	allowOnlyPointerType,
	onPointerDown,
	onPointerMove,
	onPointerUp,
}: UseCanvasPointerHandlersParams) {
	const getCoordinates = useCallback(
		(pointerEvent: React.PointerEvent<HTMLDivElement>): Point => {
			const boundingArea = canvasRef.current?.getBoundingClientRect();
			canvasSizeRef.current = boundingArea
				? { width: boundingArea.width, height: boundingArea.height }
				: null;

			if (!boundingArea) {
				return { x: 0, y: 0 };
			}

			return getCanvasPoint(pointerEvent, boundingArea, {
				scrollX: window.scrollX ?? 0,
				scrollY: window.scrollY ?? 0,
			});
		},
		[canvasRef, canvasSizeRef],
	);

	const handlePointerDown = useCallback(
		(event: React.PointerEvent<HTMLDivElement>): void => {
			if (!isAllowedPointerType(allowOnlyPointerType, event.pointerType)) return;
			if (!shouldHandlePointerButton(event.pointerType, event.button)) return;

			onPointerDown(
				getCoordinates(event),
				isPenEraser(event.pointerType, event.buttons),
			);
		},
		[allowOnlyPointerType, getCoordinates, onPointerDown],
	);

	const handlePointerMove = useCallback(
		(event: React.PointerEvent<HTMLDivElement>): void => {
			if (!isDrawing) return;
			if (!isAllowedPointerType(allowOnlyPointerType, event.pointerType)) return;

			onPointerMove(getCoordinates(event));
		},
		[allowOnlyPointerType, getCoordinates, isDrawing, onPointerMove],
	);

	const handlePointerUp = useCallback(
		(event: React.PointerEvent<HTMLDivElement> | PointerEvent): void => {
			if (!shouldHandlePointerButton(event.pointerType, event.button)) return;
			if (!isAllowedPointerType(allowOnlyPointerType, event.pointerType)) return;

			onPointerUp();
		},
		[allowOnlyPointerType, onPointerUp],
	);

	React.useEffect(() => {
		document.addEventListener("pointerup", handlePointerUp);
		return () => {
			document.removeEventListener("pointerup", handlePointerUp);
		};
	}, [handlePointerUp]);

	return {
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
	};
}
```

- [ ] **Step 4: Run pure pointer tests and verify they pass**

Run:

```bash
pnpm --filter react-sketch-canvas exec vitest run tests/unit/canvas/pointer.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Write hook harness tests**

Create `packages/react-sketch-canvas/tests/unit/canvas/useCanvasPointerHandlers.spec.tsx`:

```tsx
import { fireEvent, render } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { useCanvasPointerHandlers } from "../../../src/Canvas/hooks/useCanvasPointerHandlers";
import type { AllowOnlyPointerType } from "../../../src/Canvas/types";
import type { Point } from "../../../src/types";

type HarnessProps = {
	isDrawing?: boolean;
	allowOnlyPointerType?: AllowOnlyPointerType;
	onPointerDown?: (point: Point, isEraser?: boolean) => void;
	onPointerMove?: (point: Point) => void;
	onPointerUp?: () => void;
};

function Harness({
	isDrawing = false,
	allowOnlyPointerType = "all",
	onPointerDown = vi.fn(),
	onPointerMove = vi.fn(),
	onPointerUp = vi.fn(),
}: HarnessProps) {
	const canvasRef = React.useRef<HTMLDivElement>(null);
	const canvasSizeRef = React.useRef<{ width: number; height: number } | null>(null);
	const handlers = useCanvasPointerHandlers({
		canvasRef,
		canvasSizeRef,
		isDrawing,
		allowOnlyPointerType,
		onPointerDown,
		onPointerMove,
		onPointerUp,
	});

	React.useEffect(() => {
		if (!canvasRef.current) return;
		canvasRef.current.getBoundingClientRect = () =>
			({
				left: 10,
				top: 20,
				width: 300,
				height: 200,
			}) as DOMRect;
	}, []);

	return <div data-testid="canvas" ref={canvasRef} {...handlers} />;
}

describe("useCanvasPointerHandlers", () => {
	it("normalizes pointer down into a canvas point", () => {
		const onPointerDown = vi.fn();
		const { getByTestId } = render(<Harness onPointerDown={onPointerDown} />);

		fireEvent.pointerDown(getByTestId("canvas"), {
			pointerType: "mouse",
			button: 0,
			buttons: 1,
			pageX: 40,
			pageY: 70,
		});

		expect(onPointerDown).toHaveBeenCalledWith({ x: 30, y: 50 }, false);
	});

	it("does not move when drawing is false", () => {
		const onPointerMove = vi.fn();
		const { getByTestId } = render(<Harness onPointerMove={onPointerMove} />);

		fireEvent.pointerMove(getByTestId("canvas"), {
			pointerType: "mouse",
			pageX: 40,
			pageY: 70,
		});

		expect(onPointerMove).not.toHaveBeenCalled();
	});

	it("wires document pointerup", () => {
		const onPointerUp = vi.fn();
		render(<Harness onPointerUp={onPointerUp} />);

		fireEvent.pointerUp(document, { pointerType: "mouse", button: 0 });

		expect(onPointerUp).toHaveBeenCalledOnce();
	});
});
```

- [ ] **Step 6: Run hook tests and verify they pass**

Run:

```bash
pnpm --filter react-sketch-canvas exec vitest run tests/unit/canvas/useCanvasPointerHandlers.spec.tsx
```

Expected: PASS.

- [ ] **Step 7: Replace inline pointer logic in Canvas**

In `packages/react-sketch-canvas/src/Canvas/index.tsx`, remove:

- `ERASER_BUTTON_MASK`
- local `getCoordinates`
- local `handlePointerDown`
- local `handlePointerMove`
- local `handlePointerUp`
- the document `pointerup` `useEffect`

Add:

```ts
import { useCanvasPointerHandlers } from "./hooks/useCanvasPointerHandlers";
```

Inside `Canvas`, after refs are declared, add:

```ts
const { handlePointerDown, handlePointerMove, handlePointerUp } =
	useCanvasPointerHandlers({
		canvasRef,
		canvasSizeRef,
		isDrawing,
		allowOnlyPointerType,
		onPointerDown,
		onPointerMove,
		onPointerUp,
	});
```

- [ ] **Step 8: Run unit and pointer release tests**

Run:

```bash
pnpm --filter react-sketch-canvas test:unit
pnpm --filter react-sketch-canvas test:ct -- tests/events/pointerRelease.spec.tsx tests/events/events.spec.tsx
```

Expected: PASS.

- [ ] **Step 9: Commit pointer extraction**

Run:

```bash
git add packages/react-sketch-canvas/src/Canvas packages/react-sketch-canvas/tests/unit/canvas/pointer.spec.ts packages/react-sketch-canvas/tests/unit/canvas/useCanvasPointerHandlers.spec.tsx
git commit -m "refactor: extract canvas pointer handling"
```

Expected: conventional commit succeeds.

---

## Task 5: Extract Canvas Export Helpers And Export Hook

**Files:**

- Create: `packages/react-sketch-canvas/src/Canvas/export/dom.ts`
- Create: `packages/react-sketch-canvas/src/Canvas/export/svg.ts`
- Create: `packages/react-sketch-canvas/src/Canvas/export/image.ts`
- Create: `packages/react-sketch-canvas/src/Canvas/hooks/useCanvasExportHandle.ts`
- Modify: `packages/react-sketch-canvas/src/Canvas/index.tsx`
- Create: `packages/react-sketch-canvas/tests/unit/canvas/svgExport.spec.ts`
- Create: `packages/react-sketch-canvas/tests/unit/canvas/useCanvasExportHandle.spec.tsx`

- [ ] **Step 1: Write failing SVG export helper tests**

Create `packages/react-sketch-canvas/tests/unit/canvas/svgExport.spec.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getCanvasWithViewBox } from "../../../src/Canvas/export/dom";
import { prepareSvgForExport } from "../../../src/Canvas/export/svg";

describe("canvas SVG export helpers", () => {
	it("clones the svg and applies explicit width, height, and viewBox", () => {
		const wrapper = document.createElement("div");
		Object.defineProperties(wrapper, {
			offsetWidth: { value: 320 },
			offsetHeight: { value: 180 },
		});
		wrapper.innerHTML = `<svg id="sketch"></svg>`;

		const result = getCanvasWithViewBox(wrapper);

		expect(result.width).toBe(320);
		expect(result.height).toBe(180);
		expect(result.svgCanvas.getAttribute("viewBox")).toBe("0 0 320 180");
		expect(result.svgCanvas.getAttribute("width")).toBe("320");
		expect(result.svgCanvas.getAttribute("height")).toBe("180");
	});

	it("keeps the background image pattern when exporting with background image", () => {
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.innerHTML = `
			<defs><pattern id="canvas__background"></pattern></defs>
			<rect id="canvas__canvas-background" fill="url(#canvas__background)"></rect>
		`;

		prepareSvgForExport(svg, {
			id: "canvas",
			canvasColor: "white",
			exportWithBackgroundImage: true,
		});

		expect(svg.querySelector("#canvas__background")).not.toBeNull();
	});

	it("removes the background image pattern and restores canvas color when exporting without background image", () => {
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.innerHTML = `
			<defs><pattern id="canvas__background"></pattern></defs>
			<rect id="canvas__canvas-background" fill="url(#canvas__background)"></rect>
		`;

		prepareSvgForExport(svg, {
			id: "canvas",
			canvasColor: "pink",
			exportWithBackgroundImage: false,
		});

		expect(svg.querySelector("#canvas__background")).toBeNull();
		expect(svg.querySelector("#canvas__canvas-background")?.getAttribute("fill")).toBe(
			"pink",
		);
	});
});
```

- [ ] **Step 2: Run SVG export tests and verify the expected failure**

Run:

```bash
pnpm --filter react-sketch-canvas exec vitest run tests/unit/canvas/svgExport.spec.ts
```

Expected: FAIL because export helper modules do not exist.

- [ ] **Step 3: Extract DOM and SVG export helpers**

Create `packages/react-sketch-canvas/src/Canvas/export/dom.ts`:

```ts
export function getCanvasWithViewBox(canvas: HTMLDivElement) {
	const svgCanvas = canvas.firstChild?.cloneNode(true) as SVGElement;
	const width = canvas.offsetWidth;
	const height = canvas.offsetHeight;

	svgCanvas.setAttribute("viewBox", `0 0 ${width} ${height}`);
	svgCanvas.setAttribute("width", width.toString());
	svgCanvas.setAttribute("height", height.toString());

	return { svgCanvas, width, height };
}
```

Create `packages/react-sketch-canvas/src/Canvas/export/svg.ts`:

```ts
type PrepareSvgForExportOptions = {
	id: string;
	canvasColor: string;
	exportWithBackgroundImage: boolean;
};

export function prepareSvgForExport(
	svgCanvas: SVGElement,
	{ id, canvasColor, exportWithBackgroundImage }: PrepareSvgForExportOptions,
): SVGElement {
	if (exportWithBackgroundImage) {
		return svgCanvas;
	}

	svgCanvas.querySelector(`#${id}__background`)?.remove();
	svgCanvas
		.querySelector(`#${id}__canvas-background`)
		?.setAttribute("fill", canvasColor);

	return svgCanvas;
}
```

- [ ] **Step 4: Run SVG export helper tests and verify they pass**

Run:

```bash
pnpm --filter react-sketch-canvas exec vitest run tests/unit/canvas/svgExport.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Extract image export helper**

Create `packages/react-sketch-canvas/src/Canvas/export/image.ts`:

```ts
import type { ExportImageOptions, ExportImageType } from "../../types";

export const loadImage = (url: string): Promise<HTMLImageElement> =>
	new Promise((resolve, reject) => {
		const img = new Image();
		img.addEventListener("load", () => {
			if (img.width > 0) {
				resolve(img);
				return;
			}
			reject(new Error("Image not found"));
		});
		img.addEventListener("error", (err) => reject(err));
		img.src = url;
		img.setAttribute("crossorigin", "anonymous");
	});

type ExportImageFromSvgOptions = {
	svgCanvas: SVGElement;
	svgWidth: number;
	svgHeight: number;
	imageType: ExportImageType;
	canvasColor: string;
	backgroundImage: string;
	exportWithBackgroundImage: boolean;
	options?: ExportImageOptions;
};

export async function exportImageFromSvg({
	svgCanvas,
	svgWidth,
	svgHeight,
	imageType,
	canvasColor,
	backgroundImage,
	exportWithBackgroundImage,
	options,
}: ExportImageFromSvgOptions): Promise<string> {
	const exportWidth = options?.width ?? svgWidth;
	const exportHeight = options?.height ?? svgHeight;
	const canvasSketch = `data:image/svg+xml;base64,${btoa(svgCanvas.outerHTML)}`;
	const loadImagePromises = [loadImage(canvasSketch)];

	if (exportWithBackgroundImage && backgroundImage) {
		try {
			loadImagePromises.push(loadImage(backgroundImage));
		} catch {
			console.warn(
				"exportWithBackgroundImage props is set without a valid background image URL. This option is ignored",
			);
		}
	}

	const images = await Promise.all(loadImagePromises);
	const renderCanvas = document.createElement("canvas");
	renderCanvas.setAttribute("width", exportWidth.toString());
	renderCanvas.setAttribute("height", exportHeight.toString());
	const context = renderCanvas.getContext("2d");

	if (!context) {
		throw Error("Canvas not rendered yet");
	}

	if (imageType === "jpeg" && !exportWithBackgroundImage) {
		context.fillStyle = canvasColor;
		context.fillRect(0, 0, exportWidth, exportHeight);
	}

	for (const image of images.reverse()) {
		context.drawImage(image, 0, 0, exportWidth, exportHeight);
	}

	return renderCanvas.toDataURL(`image/${imageType}`);
}
```

- [ ] **Step 6: Write export hook tests**

Create `packages/react-sketch-canvas/tests/unit/canvas/useCanvasExportHandle.spec.tsx`:

```tsx
import { render } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import type { CanvasRef } from "../../../src/Canvas/types";
import { useCanvasExportHandle } from "../../../src/Canvas/hooks/useCanvasExportHandle";

function Harness({ canvasRef }: { canvasRef: React.RefObject<CanvasRef> }) {
	const wrapperRef = React.useRef<HTMLDivElement>(null);

	useCanvasExportHandle(canvasRef, {
		canvasRef: wrapperRef,
		id: "hook-canvas",
		canvasColor: "white",
		backgroundImage: "",
		exportWithBackgroundImage: false,
	});

	return (
		<div ref={wrapperRef}>
			<svg id="hook-canvas">
				<rect id="hook-canvas__canvas-background" fill="white" />
			</svg>
		</div>
	);
}

describe("useCanvasExportHandle", () => {
	it("exposes exportSvg through the forwarded ref", async () => {
		const canvasRef = React.createRef<CanvasRef>();

		render(<Harness canvasRef={canvasRef} />);

		await expect(canvasRef.current?.exportSvg()).resolves.toContain(
			'id="hook-canvas"',
		);
	});
});
```

- [ ] **Step 7: Create export hook**

Create `packages/react-sketch-canvas/src/Canvas/hooks/useCanvasExportHandle.ts`:

```ts
import * as React from "react";
import type { CanvasRef } from "../types";
import type { ExportImageOptions, ExportImageType } from "../../types";
import { getCanvasWithViewBox } from "../export/dom";
import { exportImageFromSvg } from "../export/image";
import { prepareSvgForExport } from "../export/svg";

type UseCanvasExportHandleOptions = {
	canvasRef: React.RefObject<HTMLDivElement>;
	id: string;
	canvasColor: string;
	backgroundImage: string;
	exportWithBackgroundImage: boolean;
};

export function useCanvasExportHandle(
	ref: React.ForwardedRef<CanvasRef>,
	{
		canvasRef,
		id,
		canvasColor,
		backgroundImage,
		exportWithBackgroundImage,
	}: UseCanvasExportHandleOptions,
): void {
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
```

- [ ] **Step 8: Run export hook tests**

Run:

```bash
pnpm --filter react-sketch-canvas exec vitest run tests/unit/canvas/useCanvasExportHandle.spec.tsx
```

Expected: PASS.

- [ ] **Step 9: Replace inline export logic in Canvas**

In `packages/react-sketch-canvas/src/Canvas/index.tsx`, remove:

- local `loadImage`
- local `getCanvasWithViewBox`
- inline `React.useImperativeHandle` export block

Add:

```ts
import { useCanvasExportHandle } from "./hooks/useCanvasExportHandle";
```

Inside `Canvas`, after refs are declared, add:

```ts
useCanvasExportHandle(ref, {
	canvasRef,
	id,
	canvasColor,
	backgroundImage,
	exportWithBackgroundImage,
});
```

- [ ] **Step 10: Run export-focused tests**

Run:

```bash
pnpm --filter react-sketch-canvas test:unit
pnpm --filter react-sketch-canvas test:ct -- tests/actions/export.spec.tsx tests/actions/exportOptions.spec.tsx
```

Expected: PASS. These Playwright tests guard browser image export behavior that happy-dom cannot fully validate.

- [ ] **Step 11: Commit export extraction**

Run:

```bash
git add packages/react-sketch-canvas/src/Canvas packages/react-sketch-canvas/tests/unit/canvas/svgExport.spec.ts packages/react-sketch-canvas/tests/unit/canvas/useCanvasExportHandle.spec.tsx
git commit -m "refactor: extract canvas export handling"
```

Expected: conventional commit succeeds.

---

## Task 6: Extract ReactSketchCanvas Pure State Modules

**Files:**

- Create: `packages/react-sketch-canvas/src/ReactSketchCanvas/state/strokes.ts`
- Create: `packages/react-sketch-canvas/src/ReactSketchCanvas/state/sketchingTime.ts`
- Create: `packages/react-sketch-canvas/src/ReactSketchCanvas/state/history.ts`
- Create: `packages/react-sketch-canvas/src/ReactSketchCanvas/state/operations.ts`
- Create: `packages/react-sketch-canvas/tests/unit/react-sketch-canvas/strokes.spec.ts`
- Create: `packages/react-sketch-canvas/tests/unit/react-sketch-canvas/sketchingTime.spec.ts`
- Create: `packages/react-sketch-canvas/tests/unit/react-sketch-canvas/history.spec.ts`
- Create: `packages/react-sketch-canvas/tests/unit/react-sketch-canvas/operations.spec.ts`

- [ ] **Step 1: Write failing stroke tests**

Create `packages/react-sketch-canvas/tests/unit/react-sketch-canvas/strokes.spec.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
	appendPointToLastStroke,
	createStroke,
	finishStroke,
} from "../../../src/ReactSketchCanvas/state/strokes";

describe("stroke state helpers", () => {
	it("creates a draw stroke", () => {
		expect(
			createStroke({
				point: { x: 1, y: 2 },
				drawMode: true,
				strokeColor: "red",
				strokeWidth: 4,
				eraserWidth: 8,
				withTimestamp: false,
				now: 100,
			}),
		).toEqual({
			drawMode: true,
			strokeColor: "red",
			strokeWidth: 4,
			paths: [{ x: 1, y: 2 }],
		});
	});

	it("creates an eraser stroke when draw mode is false", () => {
		expect(
			createStroke({
				point: { x: 1, y: 2 },
				drawMode: false,
				strokeColor: "red",
				strokeWidth: 4,
				eraserWidth: 8,
				withTimestamp: true,
				now: 100,
			}),
		).toEqual({
			drawMode: false,
			strokeColor: "#000000",
			strokeWidth: 8,
			paths: [{ x: 1, y: 2 }],
			startTimestamp: 100,
			endTimestamp: 0,
		});
	});

	it("appends a point to the last stroke", () => {
		const paths = [
			createStroke({
				point: { x: 1, y: 2 },
				drawMode: true,
				strokeColor: "red",
				strokeWidth: 4,
				eraserWidth: 8,
				withTimestamp: false,
				now: 100,
			}),
		];

		expect(appendPointToLastStroke(paths, { x: 3, y: 4 })[0].paths).toEqual([
			{ x: 1, y: 2 },
			{ x: 3, y: 4 },
		]);
	});

	it("finishes timestamped last stroke", () => {
		const paths = [
			createStroke({
				point: { x: 1, y: 2 },
				drawMode: true,
				strokeColor: "red",
				strokeWidth: 4,
				eraserWidth: 8,
				withTimestamp: true,
				now: 100,
			}),
		];

		expect(finishStroke(paths, true, 250)[0].endTimestamp).toBe(250);
		expect(finishStroke(paths, false, 250)[0].endTimestamp).toBe(0);
	});
});
```

- [ ] **Step 2: Create stroke helpers**

Create `packages/react-sketch-canvas/src/ReactSketchCanvas/state/strokes.ts`:

```ts
import type { CanvasPath, Point } from "../../types";

type CreateStrokeOptions = {
	point: Point;
	drawMode: boolean;
	strokeColor: string;
	strokeWidth: number;
	eraserWidth: number;
	withTimestamp: boolean;
	now: number;
};

export function createStroke({
	point,
	drawMode,
	strokeColor,
	strokeWidth,
	eraserWidth,
	withTimestamp,
	now,
}: CreateStrokeOptions): CanvasPath {
	const stroke: CanvasPath = {
		drawMode,
		strokeColor: drawMode ? strokeColor : "#000000",
		strokeWidth: drawMode ? strokeWidth : eraserWidth,
		paths: [point],
	};

	if (!withTimestamp) {
		return stroke;
	}

	return {
		...stroke,
		startTimestamp: now,
		endTimestamp: 0,
	};
}

export function appendPointToLastStroke(
	paths: CanvasPath[],
	point: Point,
): CanvasPath[] {
	const currentStroke = paths.slice(-1)[0];

	if (!currentStroke) {
		return paths;
	}

	const updatedStroke = {
		...currentStroke,
		paths: [...currentStroke.paths, point],
	};

	return [...paths.slice(0, -1), updatedStroke];
}

export function finishStroke(
	paths: CanvasPath[],
	withTimestamp: boolean,
	now: number,
): CanvasPath[] {
	if (!withTimestamp) return paths;

	const currentStroke = paths.slice(-1)?.[0] ?? null;
	if (currentStroke === null) return paths;

	const updatedStroke = {
		...currentStroke,
		endTimestamp: now,
	};

	return [...paths.slice(0, -1), updatedStroke];
}
```

- [ ] **Step 3: Run stroke tests**

Run:

```bash
pnpm --filter react-sketch-canvas exec vitest run tests/unit/react-sketch-canvas/strokes.spec.ts
```

Expected: PASS.

- [ ] **Step 4: Write and implement sketching time tests**

Create `packages/react-sketch-canvas/tests/unit/react-sketch-canvas/sketchingTime.spec.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getSketchingTime } from "../../../src/ReactSketchCanvas/state/sketchingTime";

describe("getSketchingTime", () => {
	it("sums timestamp durations and treats missing timestamps as zero", () => {
		expect(
			getSketchingTime([
				{
					drawMode: true,
					strokeColor: "red",
					strokeWidth: 4,
					paths: [{ x: 0, y: 0 }],
					startTimestamp: 100,
					endTimestamp: 250,
				},
				{
					drawMode: true,
					strokeColor: "blue",
					strokeWidth: 4,
					paths: [{ x: 1, y: 1 }],
				},
			]),
		).toBe(150);
	});
});
```

Create `packages/react-sketch-canvas/src/ReactSketchCanvas/state/sketchingTime.ts`:

```ts
import type { CanvasPath } from "../../types";

export function getSketchingTime(paths: CanvasPath[]): number {
	return paths.reduce((totalSketchingTime, path) => {
		const startTimestamp = path.startTimestamp ?? 0;
		const endTimestamp = path.endTimestamp ?? 0;

		return totalSketchingTime + (endTimestamp - startTimestamp);
	}, 0);
}
```

Run:

```bash
pnpm --filter react-sketch-canvas exec vitest run tests/unit/react-sketch-canvas/sketchingTime.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Write and implement history tests**

Create `packages/react-sketch-canvas/tests/unit/react-sketch-canvas/history.spec.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { CanvasPath } from "../../../src/types";
import {
	addLastStrokeToHistory,
	clearCanvasState,
	createInitialSketchState,
	loadPathsState,
	redoState,
	resetCanvasState,
	undoState,
} from "../../../src/ReactSketchCanvas/state/history";

const path = (strokeColor: string): CanvasPath => ({
	drawMode: true,
	strokeColor,
	strokeWidth: 4,
	paths: [{ x: 0, y: 0 }],
});

describe("history state", () => {
	it("adds the current paths to history only when unsynced", () => {
		const state = {
			...createInitialSketchState(),
			currentPaths: [path("red")],
			historyPos: 1,
			historySynced: false,
		};

		expect(addLastStrokeToHistory(state).history).toEqual([[], [path("red")]]);
		expect(addLastStrokeToHistory({ ...state, historySynced: true }).history).toEqual([
			[],
		]);
	});

	it("undoes and redoes through existing history", () => {
		const state = {
			...createInitialSketchState(),
			history: [[], [path("red")], [path("red"), path("blue")]],
			historyPos: 2,
			currentPaths: [path("red"), path("blue")],
			historySynced: true,
		};

		const undone = undoState(state);
		expect(undone.currentPaths).toEqual([path("red")]);
		expect(undone.historyPos).toBe(1);

		const redone = redoState(undone);
		expect(redone.currentPaths).toEqual([path("red"), path("blue")]);
		expect(redone.historyPos).toBe(2);
	});

	it("clear appends an empty history entry", () => {
		const state = {
			...createInitialSketchState(),
			currentPaths: [path("red")],
			historyPos: 1,
			historySynced: false,
		};

		const cleared = clearCanvasState(state);

		expect(cleared.currentPaths).toEqual([]);
		expect(cleared.history).toEqual([[], [path("red")], []]);
		expect(cleared.historyPos).toBe(2);
	});

	it("loadPaths appends to current paths to preserve existing behavior", () => {
		const loaded = loadPathsState(
			{ ...createInitialSketchState(), currentPaths: [path("red")] },
			[path("blue")],
		);

		expect(loaded.currentPaths).toEqual([path("red"), path("blue")]);
	});

	it("reset clears paths, history, and operation queue state", () => {
		expect(resetCanvasState().history).toEqual([]);
		expect(resetCanvasState().historyPos).toBe(0);
		expect(resetCanvasState().currentPaths).toEqual([]);
		expect(resetCanvasState().operationQueue).toEqual([]);
	});
});
```

Create `packages/react-sketch-canvas/src/ReactSketchCanvas/state/history.ts`:

```ts
import type { CanvasPath } from "../../types";
import type { Operation } from "./operations";

export type SketchState = {
	drawMode: boolean;
	isDrawing: boolean;
	history: CanvasPath[][];
	historyPos: number;
	historySynced: boolean;
	currentPaths: CanvasPath[];
	operationQueue: Operation[];
	isProcessingQueue: boolean;
};

export function createInitialSketchState(): SketchState {
	return {
		drawMode: true,
		isDrawing: false,
		history: [[]],
		historyPos: 0,
		historySynced: false,
		currentPaths: [],
		operationQueue: [],
		isProcessingQueue: false,
	};
}

export function addLastStrokeToHistory(state: SketchState): SketchState {
	if (state.historySynced) return state;

	return {
		...state,
		history: [
			...state.history.slice(0, state.historyPos),
			[...state.currentPaths],
		],
		historySynced: true,
	};
}

export function undoState(state: SketchState): SketchState {
	if (state.historyPos <= 0) return state;
	const synced = addLastStrokeToHistory(state);

	return {
		...synced,
		currentPaths: synced.history[synced.historyPos - 1],
		historyPos: synced.historyPos - 1,
	};
}

export function redoState(state: SketchState): SketchState {
	if (state.historyPos >= state.history.length - 1) return state;
	const synced = addLastStrokeToHistory(state);

	return {
		...synced,
		currentPaths: synced.history[synced.historyPos + 1],
		historyPos: synced.historyPos + 1,
	};
}

export function clearCanvasState(state: SketchState): SketchState {
	const synced = addLastStrokeToHistory(state);

	return {
		...synced,
		currentPaths: [],
		history: [...synced.history.slice(0, synced.historyPos + 1), []],
		historyPos: synced.historyPos + 1,
	};
}

export function loadPathsState(
	state: SketchState,
	paths: CanvasPath[],
): SketchState {
	const synced = addLastStrokeToHistory(state);
	const newPaths = [...synced.currentPaths, ...paths];
	const newHistoryPos = synced.historyPos + 1;

	return {
		...synced,
		currentPaths: newPaths,
		history: [...synced.history.slice(0, newHistoryPos), newPaths],
		historyPos: newHistoryPos,
	};
}

export function resetCanvasState(): SketchState {
	return {
		...createInitialSketchState(),
		history: [],
	};
}
```

Run:

```bash
pnpm --filter react-sketch-canvas exec vitest run tests/unit/react-sketch-canvas/history.spec.ts
```

Expected: PASS.

- [ ] **Step 6: Write and implement operation tests**

Create `packages/react-sketch-canvas/tests/unit/react-sketch-canvas/operations.spec.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { CanvasPath } from "../../../src/types";
import { createInitialSketchState } from "../../../src/ReactSketchCanvas/state/history";
import {
	applyOperation,
	enqueueOperation,
} from "../../../src/ReactSketchCanvas/state/operations";

const path = (strokeColor: string): CanvasPath => ({
	drawMode: true,
	strokeColor,
	strokeWidth: 4,
	paths: [{ x: 0, y: 0 }],
});

describe("operations", () => {
	it("enqueues operations in order", () => {
		expect(
			enqueueOperation(createInitialSketchState(), { type: "clear" }).operationQueue,
		).toEqual([{ type: "clear" }]);
	});

	it("applies loadPaths operation", () => {
		const next = applyOperation(createInitialSketchState(), {
			type: "loadPaths",
			payload: [path("red")],
		});

		expect(next.currentPaths).toEqual([path("red")]);
	});

	it("throws on unknown operations", () => {
		expect(() =>
			applyOperation(createInitialSketchState(), { type: "unknown" } as never),
		).toThrow("Unknown operation type: unknown");
	});
});
```

Create `packages/react-sketch-canvas/src/ReactSketchCanvas/state/operations.ts`:

```ts
import type { CanvasPath } from "../../types";
import type { SketchState } from "./history";
import {
	clearCanvasState,
	loadPathsState,
	redoState,
	undoState,
} from "./history";

export type Operation = {
	type: "undo" | "redo" | "clear" | "loadPaths";
	payload?: CanvasPath[];
};

export function enqueueOperation(
	state: SketchState,
	operation: Operation,
): SketchState {
	return {
		...state,
		operationQueue: [...state.operationQueue, operation],
	};
}

export function applyOperation(
	state: SketchState,
	operation: Operation,
): SketchState {
	switch (operation.type) {
		case "undo":
			return undoState(state);
		case "redo":
			return redoState(state);
		case "clear":
			return clearCanvasState(state);
		case "loadPaths":
			return operation.payload ? loadPathsState(state, operation.payload) : state;
		default:
			throw new Error(`Unknown operation type: ${(operation as Operation).type}`);
	}
}
```

Run:

```bash
pnpm --filter react-sketch-canvas exec vitest run tests/unit/react-sketch-canvas/operations.spec.ts
```

Expected: PASS.

- [ ] **Step 7: Run all new state tests**

Run:

```bash
pnpm --filter react-sketch-canvas exec vitest run tests/unit/react-sketch-canvas
```

Expected: PASS.

- [ ] **Step 8: Commit state extraction**

Run:

```bash
git add packages/react-sketch-canvas/src/ReactSketchCanvas/state packages/react-sketch-canvas/tests/unit/react-sketch-canvas
git commit -m "refactor: extract sketch canvas state logic"
```

Expected: conventional commit succeeds.

---

## Task 7: Introduce ReactSketchCanvas Controller And Imperative Hooks

**Files:**

- Create: `packages/react-sketch-canvas/src/ReactSketchCanvas/hooks/useSketchCanvasController.ts`
- Create: `packages/react-sketch-canvas/src/ReactSketchCanvas/hooks/useSketchCanvasImperativeHandle.ts`
- Modify: `packages/react-sketch-canvas/src/ReactSketchCanvas/index.tsx`
- Create: `packages/react-sketch-canvas/tests/unit/react-sketch-canvas/useSketchCanvasController.spec.tsx`
- Create: `packages/react-sketch-canvas/tests/unit/react-sketch-canvas/useSketchCanvasImperativeHandle.spec.tsx`

- [ ] **Step 1: Write controller hook tests**

Create `packages/react-sketch-canvas/tests/unit/react-sketch-canvas/useSketchCanvasController.spec.tsx`:

```tsx
import { act, render } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { useSketchCanvasController } from "../../../src/ReactSketchCanvas/hooks/useSketchCanvasController";
import type { CanvasPath, Point } from "../../../src/types";

type ControllerSnapshot = ReturnType<typeof useSketchCanvasController>;

function Harness({
	onReady,
	onChange = vi.fn(),
	onStroke = vi.fn(),
}: {
	onReady: (controller: ControllerSnapshot) => void;
	onChange?: (paths: CanvasPath[]) => void;
	onStroke?: (path: CanvasPath, isEraser: boolean) => void;
}) {
	const controller = useSketchCanvasController({
		strokeColor: "red",
		strokeWidth: 4,
		eraserWidth: 8,
		withTimestamp: false,
		onChange,
		onStroke,
	});

	React.useEffect(() => {
		onReady(controller);
	}, [controller, onReady]);

	return null;
}

describe("useSketchCanvasController", () => {
	it("creates and extends a stroke from pointer events", () => {
		let controller: ControllerSnapshot | undefined;
		const onReady = vi.fn((next: ControllerSnapshot) => {
			controller = next;
		});

		render(<Harness onReady={onReady} />);

		act(() => {
			controller?.handlePointerDown({ x: 1, y: 2 } satisfies Point);
		});
		act(() => {
			controller?.handlePointerMove({ x: 3, y: 4 } satisfies Point);
		});

		expect(controller?.currentPaths).toEqual([
			{
				drawMode: true,
				strokeColor: "red",
				strokeWidth: 4,
				paths: [
					{ x: 1, y: 2 },
					{ x: 3, y: 4 },
				],
			},
		]);
	});

	it("uses eraser stroke settings for eraser input", () => {
		let controller: ControllerSnapshot | undefined;
		render(
			<Harness
				onReady={(next) => {
					controller = next;
				}}
			/>,
		);

		act(() => {
			controller?.handlePointerDown({ x: 1, y: 2 }, true);
		});

		expect(controller?.currentPaths[0]).toMatchObject({
			drawMode: false,
			strokeColor: "#000000",
			strokeWidth: 8,
		});
	});
});
```

- [ ] **Step 2: Create controller hook**

Create `packages/react-sketch-canvas/src/ReactSketchCanvas/hooks/useSketchCanvasController.ts`:

```ts
import * as React from "react";
import { useCallback } from "react";
import type { CanvasPath, Point } from "../../types";
import {
	addLastStrokeToHistory,
	createInitialSketchState,
	type SketchState,
} from "../state/history";
import {
	applyOperation,
	enqueueOperation as enqueueOperationInState,
	type Operation,
} from "../state/operations";
import {
	appendPointToLastStroke,
	createStroke,
	finishStroke,
} from "../state/strokes";

type UseSketchCanvasControllerOptions = {
	strokeColor: string;
	strokeWidth: number;
	eraserWidth: number;
	withTimestamp: boolean;
	onChange: (updatedPaths: CanvasPath[]) => void;
	onStroke: (path: CanvasPath, isEraser: boolean) => void;
};

export function useSketchCanvasController({
	strokeColor,
	strokeWidth,
	eraserWidth,
	withTimestamp,
	onChange,
	onStroke,
}: UseSketchCanvasControllerOptions) {
	const [state, setState] = React.useState<SketchState>(createInitialSketchState);

	const currentPaths = state.currentPaths;
	const isDrawing = state.isDrawing;
	const drawMode = state.drawMode;

	// biome-ignore lint/correctness/useExhaustiveDependencies: preserve legacy stroke-lift timing tied only to drawing state changes.
	const liftStrokeUp = React.useCallback((): void => {
		const lastStroke = currentPaths.slice(-1)?.[0] ?? null;
		if (lastStroke === null) return;

		onStroke(lastStroke, !lastStroke.drawMode);
	}, [isDrawing]);

	React.useEffect(() => {
		liftStrokeUp();
	}, [liftStrokeUp]);

	React.useEffect(() => {
		onChange(currentPaths);
	}, [currentPaths, onChange]);

	React.useEffect(() => {
		if (state.isProcessingQueue || state.operationQueue.length === 0) return;

		setState((current) => {
			if (current.isProcessingQueue || current.operationQueue.length === 0) {
				return current;
			}

			const [operation, ...remainingQueue] = current.operationQueue;
			const processed = applyOperation(
				{ ...current, isProcessingQueue: true },
				operation,
			);

			return {
				...processed,
				operationQueue: remainingQueue,
				isProcessingQueue: false,
			};
		});
	}, [state.isProcessingQueue, state.operationQueue]);

	const enqueueOperation = useCallback((operation: Operation) => {
		setState((current) => enqueueOperationInState(current, operation));
	}, []);

	const setEraseMode = useCallback((erase: boolean): void => {
		setState((current) => ({ ...current, drawMode: !erase }));
	}, []);

	const resetCanvas = useCallback((): void => {
		setState({
			...createInitialSketchState(),
			history: [],
		});
	}, []);

	const handlePointerDown = useCallback(
		(point: Point, isEraser = false): void => {
			setState((current) => {
				const synced = addLastStrokeToHistory(current);
				const isDraw = !isEraser && synced.drawMode;
				const stroke = createStroke({
					point,
					drawMode: isDraw,
					strokeColor,
					strokeWidth,
					eraserWidth,
					withTimestamp,
					now: Date.now(),
				});

				return {
					...synced,
					isDrawing: true,
					historyPos: synced.historyPos + 1,
					historySynced: false,
					currentPaths: [...synced.currentPaths, stroke],
				};
			});
		},
		[eraserWidth, strokeColor, strokeWidth, withTimestamp],
	);

	const handlePointerMove = useCallback((point: Point): void => {
		setState((current) => {
			if (!current.isDrawing) return current;

			return {
				...current,
				currentPaths: appendPointToLastStroke(current.currentPaths, point),
			};
		});
	}, []);

	const handlePointerUp = useCallback((): void => {
		setState((current) => {
			if (!current.isDrawing) return current;

			return {
				...current,
				isDrawing: false,
				currentPaths: finishStroke(current.currentPaths, withTimestamp, Date.now()),
			};
		});
	}, [withTimestamp]);

	return {
		currentPaths,
		isDrawing,
		drawMode,
		setEraseMode,
		enqueueOperation,
		resetCanvas,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
	};
}
```

- [ ] **Step 3: Run controller hook tests**

Run:

```bash
pnpm --filter react-sketch-canvas exec vitest run tests/unit/react-sketch-canvas/useSketchCanvasController.spec.tsx
```

Expected: PASS.

- [ ] **Step 4: Write imperative hook tests**

Create `packages/react-sketch-canvas/tests/unit/react-sketch-canvas/useSketchCanvasImperativeHandle.spec.tsx`:

```tsx
import { render } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import type { CanvasRef } from "../../../src/Canvas/types";
import { useSketchCanvasImperativeHandle } from "../../../src/ReactSketchCanvas/hooks/useSketchCanvasImperativeHandle";
import type { ReactSketchCanvasRef } from "../../../src/ReactSketchCanvas/types";
import type { CanvasPath } from "../../../src/types";

const path: CanvasPath = {
	drawMode: true,
	strokeColor: "red",
	strokeWidth: 4,
	paths: [{ x: 0, y: 0 }],
	startTimestamp: 10,
	endTimestamp: 30,
};

const canvasApi: CanvasRef = {
	exportImage: vi.fn(async () => "data:image/png;base64,abc"),
	exportSvg: vi.fn(async () => "<svg></svg>"),
};

function Harness({
	forwardedRef,
	withTimestamp = true,
}: {
	forwardedRef: React.RefObject<ReactSketchCanvasRef>;
	withTimestamp?: boolean;
}) {
	const canvasRef = React.useRef<CanvasRef>(canvasApi);
	useSketchCanvasImperativeHandle(forwardedRef, {
		canvasRef,
		currentPaths: [path],
		withTimestamp,
		setEraseMode: vi.fn(),
		enqueueOperation: vi.fn(),
		resetCanvas: vi.fn(),
	});
	return null;
}

describe("useSketchCanvasImperativeHandle", () => {
	it("exposes export methods and current paths", async () => {
		const ref = React.createRef<ReactSketchCanvasRef>();
		render(<Harness forwardedRef={ref} />);

		await expect(ref.current?.exportImage("png")).resolves.toBe(
			"data:image/png;base64,abc",
		);
		await expect(ref.current?.exportSvg()).resolves.toBe("<svg></svg>");
		await expect(ref.current?.exportPaths()).resolves.toEqual([path]);
		await expect(ref.current?.getSketchingTime()).resolves.toBe(20);
	});

	it("rejects sketching time when timestamps are disabled", async () => {
		const ref = React.createRef<ReactSketchCanvasRef>();
		render(<Harness forwardedRef={ref} withTimestamp={false} />);

		await expect(ref.current?.getSketchingTime()).rejects.toThrow(
			"Set 'withTimestamp' prop to get sketching time",
		);
	});
});
```

- [ ] **Step 5: Create imperative hook**

Create `packages/react-sketch-canvas/src/ReactSketchCanvas/hooks/useSketchCanvasImperativeHandle.ts`:

```ts
import * as React from "react";
import type { CanvasRef } from "../../Canvas/types";
import type { CanvasPath, ExportImageOptions, ExportImageType } from "../../types";
import type { ReactSketchCanvasRef } from "../types";
import type { Operation } from "../state/operations";
import { getSketchingTime } from "../state/sketchingTime";

type UseSketchCanvasImperativeHandleOptions = {
	canvasRef: React.RefObject<CanvasRef>;
	currentPaths: CanvasPath[];
	withTimestamp: boolean;
	setEraseMode: (erase: boolean) => void;
	enqueueOperation: (operation: Operation) => void;
	resetCanvas: () => void;
};

export function useSketchCanvasImperativeHandle(
	ref: React.ForwardedRef<ReactSketchCanvasRef>,
	{
		canvasRef,
		currentPaths,
		withTimestamp,
		setEraseMode,
		enqueueOperation,
		resetCanvas,
	}: UseSketchCanvasImperativeHandleOptions,
): void {
	React.useImperativeHandle(
		ref,
		() => ({
			eraseMode: setEraseMode,
			clearCanvas: (): void => {
				enqueueOperation({ type: "clear" });
			},
			undo: (): void => {
				enqueueOperation({ type: "undo" });
			},
			redo: (): void => {
				enqueueOperation({ type: "redo" });
			},
			exportImage: (
				imageType: ExportImageType,
				options?: ExportImageOptions,
			): Promise<string> => {
				const exportImage = canvasRef.current?.exportImage;

				if (!exportImage) {
					throw Error("Export function called before canvas loaded");
				}

				return exportImage(imageType, options);
			},
			exportSvg: async (): Promise<string> => {
				const exportSvg = canvasRef.current?.exportSvg;

				if (!exportSvg) {
					throw Error("Export function called before canvas loaded");
				}

				return exportSvg();
			},
			exportPaths: async (): Promise<CanvasPath[]> => currentPaths,
			loadPaths: (paths: CanvasPath[]): void => {
				enqueueOperation({ type: "loadPaths", payload: paths });
			},
			getSketchingTime: async (): Promise<number> => {
				if (!withTimestamp) {
					throw new Error("Set 'withTimestamp' prop to get sketching time");
				}

				return getSketchingTime(currentPaths);
			},
			resetCanvas,
		}),
		[
			canvasRef,
			currentPaths,
			enqueueOperation,
			resetCanvas,
			setEraseMode,
			withTimestamp,
		],
	);
}
```

- [ ] **Step 6: Run imperative hook tests**

Run:

```bash
pnpm --filter react-sketch-canvas exec vitest run tests/unit/react-sketch-canvas/useSketchCanvasImperativeHandle.spec.tsx
```

Expected: PASS.

- [ ] **Step 7: Wire hooks into ReactSketchCanvas**

Replace the stateful internals of `packages/react-sketch-canvas/src/ReactSketchCanvas/index.tsx` while preserving prop defaults and the final `<Canvas />` props.

At the top, keep:

```ts
import * as React from "react";
import { Canvas } from "../Canvas";
import type { CanvasRef } from "../Canvas/types";
import type { ReactSketchCanvasProps, ReactSketchCanvasRef } from "./types";
import { useSketchCanvasController } from "./hooks/useSketchCanvasController";
import { useSketchCanvasImperativeHandle } from "./hooks/useSketchCanvasImperativeHandle";
```

Inside the component, after prop defaults, use:

```ts
const svgCanvas = React.createRef<CanvasRef>();
const {
	currentPaths,
	isDrawing,
	enqueueOperation,
	resetCanvas,
	setEraseMode,
	handlePointerDown,
	handlePointerMove,
	handlePointerUp,
} = useSketchCanvasController({
	strokeColor,
	strokeWidth,
	eraserWidth,
	withTimestamp,
	onChange,
	onStroke,
});

useSketchCanvasImperativeHandle(ref, {
	canvasRef: svgCanvas,
	currentPaths,
	withTimestamp,
	setEraseMode,
	enqueueOperation,
	resetCanvas,
});
```

Render `Canvas` with the same public props as before:

```tsx
return (
	<Canvas
		ref={svgCanvas}
		id={id}
		width={width}
		height={height}
		className={className}
		canvasColor={canvasColor}
		backgroundImage={backgroundImage}
		exportWithBackgroundImage={exportWithBackgroundImage}
		preserveBackgroundImageAspectRatio={preserveBackgroundImageAspectRatio}
		allowOnlyPointerType={allowOnlyPointerType}
		style={style}
		svgStyle={svgStyle}
		paths={currentPaths}
		isDrawing={isDrawing}
		onPointerDown={handlePointerDown}
		onPointerMove={handlePointerMove}
		onPointerUp={handlePointerUp}
		withViewBox={withViewBox}
		readOnly={readOnly}
	/>
);
```

- [ ] **Step 8: Run unit tests and action tests**

Run:

```bash
pnpm --filter react-sketch-canvas test:unit
pnpm --filter react-sketch-canvas test:ct -- tests/actions/undoRedo.spec.tsx tests/actions/import.spec.tsx tests/actions/erase.spec.tsx
```

Expected: PASS. These tests guard imperative ref behavior, operation sequencing, load paths, undo/redo, and eraser mode.

- [ ] **Step 9: Commit ReactSketchCanvas hook extraction**

Run:

```bash
git add packages/react-sketch-canvas/src/ReactSketchCanvas packages/react-sketch-canvas/tests/unit/react-sketch-canvas
git commit -m "refactor: extract sketch canvas controller hooks"
```

Expected: conventional commit succeeds.

---

## Task 8: Thin Canvas Index And Remove Dead Imports

**Files:**

- Modify: `packages/react-sketch-canvas/src/Canvas/index.tsx`
- Modify: `packages/react-sketch-canvas/src/ReactSketchCanvas/index.tsx`
- Modify: `packages/react-sketch-canvas/src/Paths/index.tsx`

- [ ] **Step 1: Inspect file sizes and unused imports**

Run:

```bash
wc -l packages/react-sketch-canvas/src/Canvas/index.tsx packages/react-sketch-canvas/src/ReactSketchCanvas/index.tsx packages/react-sketch-canvas/src/Paths/index.tsx
pnpm --filter react-sketch-canvas lint
```

Expected: lint identifies no unused imports. The three index files should be substantially smaller than the starting point: `Canvas/index.tsx` under 160 lines, `ReactSketchCanvas/index.tsx` under 140 lines, and `Paths/index.tsx` under 50 lines.

- [ ] **Step 2: Simplify Canvas imports and body**

Ensure `packages/react-sketch-canvas/src/Canvas/index.tsx` imports only:

```ts
import * as React from "react";
import { CanvasSvg } from "./svg/CanvasSvg";
import { useCanvasExportHandle } from "./hooks/useCanvasExportHandle";
import { useCanvasPointerHandlers } from "./hooks/useCanvasPointerHandlers";
import type { CanvasProps, CanvasRef } from "./types";
```

The component body should only:

- Apply prop defaults.
- Create `canvasRef` and `canvasSizeRef`.
- Call `useCanvasExportHandle`.
- Call `useCanvasPointerHandlers`.
- Compute `viewBox`.
- Render wrapper `div` and `CanvasSvg`.

- [ ] **Step 3: Simplify ReactSketchCanvas imports and body**

Ensure `packages/react-sketch-canvas/src/ReactSketchCanvas/index.tsx` imports only:

```ts
import * as React from "react";
import { Canvas } from "../Canvas";
import type { CanvasRef } from "../Canvas/types";
import { useSketchCanvasController } from "./hooks/useSketchCanvasController";
import { useSketchCanvasImperativeHandle } from "./hooks/useSketchCanvasImperativeHandle";
import type { ReactSketchCanvasProps, ReactSketchCanvasRef } from "./types";
```

The component body should only:

- Apply prop defaults.
- Create the `CanvasRef`.
- Call `useSketchCanvasController`.
- Call `useSketchCanvasImperativeHandle`.
- Render `Canvas`.

- [ ] **Step 4: Run unit tests and lint**

Run:

```bash
pnpm --filter react-sketch-canvas test:unit
pnpm --filter react-sketch-canvas lint
```

Expected: both commands PASS.

- [ ] **Step 5: Commit index cleanup**

Run:

```bash
git add packages/react-sketch-canvas/src/Canvas/index.tsx packages/react-sketch-canvas/src/ReactSketchCanvas/index.tsx packages/react-sketch-canvas/src/Paths/index.tsx
git commit -m "refactor: thin public component adapters"
```

Expected: conventional commit succeeds.

---

## Task 9: Full Behavior Verification

**Files:**

- Read: all modified files from Tasks 2-8.

- [ ] **Step 1: Run full unit test suite**

Run:

```bash
pnpm --filter react-sketch-canvas test:unit
```

Expected: PASS.

- [ ] **Step 2: Run full Playwright component suite**

Run:

```bash
pnpm --filter react-sketch-canvas test:ct
```

Expected: PASS.

- [ ] **Step 3: Run full Playwright e2e suite**

Run:

```bash
pnpm --filter react-sketch-canvas test:e2e
```

Expected: PASS.

- [ ] **Step 4: Run package build**

Run:

```bash
pnpm --filter react-sketch-canvas build
```

Expected: PASS and `packages/react-sketch-canvas/dist/` is generated.

- [ ] **Step 5: Run repo lint**

Run:

```bash
pnpm lint
```

Expected: PASS.

- [ ] **Step 6: Check public exports did not change**

Run:

```bash
git diff -- packages/react-sketch-canvas/src/index.tsx packages/react-sketch-canvas/src/ReactSketchCanvas/types.ts packages/react-sketch-canvas/src/Canvas/types.ts packages/react-sketch-canvas/src/types
```

Expected: no uncommitted public type/API changes unless they are import-only or internal comment changes. Also review the commits made in Tasks 2-8 for these same files; if public types changed, stop and review with the user before proceeding.

- [ ] **Step 7: Inspect final file sizes**

Run:

```bash
wc -l packages/react-sketch-canvas/src/Canvas/index.tsx packages/react-sketch-canvas/src/ReactSketchCanvas/index.tsx packages/react-sketch-canvas/src/Paths/index.tsx packages/react-sketch-canvas/src/Canvas/**/*.ts packages/react-sketch-canvas/src/Canvas/**/*.tsx packages/react-sketch-canvas/src/ReactSketchCanvas/**/*.ts packages/react-sketch-canvas/src/ReactSketchCanvas/**/*.tsx packages/react-sketch-canvas/src/Paths/**/*.ts packages/react-sketch-canvas/src/Paths/**/*.tsx
```

Expected: the old large index files are split into focused modules. No newly created source file should be larger than 220 lines unless there is a clear reason documented in the final response.

- [ ] **Step 8: Commit verification-only fixes if needed**

If verification required small internal fixes, commit them:

```bash
git add packages/react-sketch-canvas/src packages/react-sketch-canvas/tests/unit
git commit -m "test: verify source architecture refactor"
```

Expected: commit only if files changed after Task 8. If no files changed, do not create an empty commit.

---

## Final Notes For Execution

- Keep all commits conventional.
- Keep public API and behavior stable.
- If a test exposes a current behavior mismatch, add characterization coverage and ask before changing semantics.
- Prefer pure function tests over hook tests when both can cover the same rule.
- Hook tests should use Testing Library harness components and assert consumer-visible behavior.
- Do not broaden this into CI, docs, packaging, or release changes.
