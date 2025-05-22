import { test, expect } from '@playwright/test';

test.describe('ReactSketchCanvas - E2E Custom Path Generation', () => {
  test('should render with straight line custom path generator', async ({ page }) => {
    await page.goto('/?name=straightLine'); // Navigate to the new test case

    const canvas = page.locator('#straight-line-canvas');
    await expect(canvas).toBeVisible();

    // Simulate drawing
    const canvasBoundingBox = await canvas.boundingBox();
    if (!canvasBoundingBox) throw new Error('Canvas not found or not visible');

    await page.mouse.move(canvasBoundingBox.x + 10, canvasBoundingBox.y + 10);
    await page.mouse.down();
    await page.mouse.move(canvasBoundingBox.x + 50, canvasBoundingBox.y + 50);
    await page.mouse.move(canvasBoundingBox.x + 100, canvasBoundingBox.y + 20);
    await page.mouse.up();

    // The path ID is constructed by the component like: {canvasId}__{strokeGroupIndex}__{pathIndex}
    // For a single stroke, this should be {canvasId}__0__0 if using older versions,
    // or more likely {canvasId}__stroke-group-0__paths__0
    // We'll use a selector that finds the path within the specific canvas.
    const pathElement = page.locator('#straight-line-canvas path');
    await expect(pathElement).toHaveCount(1); // Ensure only one path is drawn
    const dAttribute = await pathElement.getAttribute('d');
    expect(dAttribute).toBe('M 10 10 L 50 50 L 100 20');
  });

  test('should render with zig-zag line custom path generator', async ({ page }) => {
    await page.goto('/?name=zigZagLine'); // Navigate to the other new test case

    const canvas = page.locator('#zigzag-line-canvas');
    await expect(canvas).toBeVisible();
    
    const canvasBoundingBox = await canvas.boundingBox();
    if (!canvasBoundingBox) throw new Error('Canvas not found or not visible');

    await page.mouse.move(canvasBoundingBox.x + 10, canvasBoundingBox.y + 10);
    await page.mouse.down();
    await page.mouse.move(canvasBoundingBox.x + 50, canvasBoundingBox.y + 50);
    await page.mouse.move(canvasBoundingBox.x + 100, canvasBoundingBox.y + 20);
    await page.mouse.up();
    
    const pathElement = page.locator('#zigzag-line-canvas path');
    await expect(pathElement).toHaveCount(1);
    const dAttribute = await pathElement.getAttribute('d');
    // Expected path: M 10 10 L 50 50+5 L 100 20
    expect(dAttribute).toBe('M 10 10 L 50 55 L 100 20'); 
  });
});
