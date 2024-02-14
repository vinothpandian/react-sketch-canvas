import { test, expect } from "@playwright/experimental-ct-react";

test.use({ viewport: { width: 500, height: 500 } });

test("should work", async ({ mount }) => {
  const component = await mount(<span>Learn React</span>);
  await expect(component).toContainText("Learn React");
});
