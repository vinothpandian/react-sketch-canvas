import { expect, test } from "@playwright/experimental-ct-react";
import { drawLine } from "../commands";
import { WithSizedExportButton } from "../fixtures/WithSizedExportButton.fixture";

test.use({ viewport: { width: 500, height: 500 } });

test("exportImage uses explicit output dimensions when provided", async ({
	mount,
}) => {
	const component = await mount(<WithSizedExportButton />);
	const canvas = component.locator("#rsc");

	await drawLine(canvas, { length: 50, originX: 10, originY: 10 });
	await component.locator("#export-sized-image").click();

	await expect(component.locator("#image-size")).toHaveText("123x77");
});
