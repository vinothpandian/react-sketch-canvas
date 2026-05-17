import { render } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { useCanvasExportHandle } from "../../../src/Canvas/hooks/useCanvasExportHandle";
import type { CanvasRef } from "../../../src/Canvas/types";

function Harness({
	canvasRef,
}: {
	canvasRef: React.RefObject<CanvasRef | null>;
}) {
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
			<svg id="hook-canvas" aria-hidden="true">
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
