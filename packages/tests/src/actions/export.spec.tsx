import { expect, MountOptions, test } from "@playwright/experimental-ct-react";
import type { Locator } from "playwright/test";
import { ExportImageType } from "react-sketch-canvas";
import { drawSquares, getCanvasIds } from "../commands";
import { WithExportButton } from "../stories/WithExportButton.story";

test.use({ viewport: { width: 500, height: 500 } });

const canvasId = "rsc";
const exportButtonId = "export-button";
const exportSVGButtonId = "export-svg-button";
const eraserButtonId = "eraser-button";

interface MountCanvasForExportArgs<HooksConfig extends object> {
  mount: (
    component: React.ReactElement,
    options?: MountOptions<HooksConfig>,
  ) => Promise<Locator>;
  imageType?: ExportImageType;
  handleExport?: (size: number) => void;
  backgroundUrl?: string;
  exportWithBackgroundImage?: boolean;
  handleExportSVG?: (svg: string | undefined) => void;
}

async function mountCanvasForExport<HooksConfig extends object>({
  mount,
  imageType,
  handleExport,
  backgroundUrl,
  exportWithBackgroundImage,
  handleExportSVG,
}: MountCanvasForExportArgs<HooksConfig>) {
  const component = await mount(
    <WithExportButton
      id={canvasId}
      imageType={imageType ?? "png"}
      eraserButtonId={eraserButtonId}
      exportButtonId={exportButtonId}
      exportSVGButtonId={exportSVGButtonId}
      onExport={handleExport}
      backgroundImage={backgroundUrl}
      exportWithBackgroundImage={exportWithBackgroundImage}
      onExportSVG={handleExportSVG}
    />,
  );

  const canvas = component.locator(`#${canvasId}`);

  const exportButton = component.locator(`#${exportButtonId}`);

  const eraserButton = component.locator(`#${eraserButtonId}`);

  const exportSVGButton = component.locator(`#${exportSVGButtonId}`);

  return { canvas, exportButton, eraserButton, exportSVGButton };
}

const backgroundUrl = "https://placehold.co/600x400.png";
test.describe("exportImage", () => {
  (["png", "jpeg"] as const).forEach((imageType) => {
    test.describe(`exportImage - ${imageType}`, () => {
      test.describe("without background image", () => {
        test(`should export ${imageType} with stroke`, async ({ mount }) => {
          let size = 0;
          const handleExport = (kbs: number) => {
            size = kbs;
          };

          const { canvas, exportButton } = await mountCanvasForExport({
            mount,
            imageType,
            handleExport,
          });

          await exportButton.click();
          const emptyCanvasSize = size;

          await drawSquares(canvas);

          await exportButton.click();
          expect(size).toBeGreaterThan(emptyCanvasSize);
        });

        test(`should export ${imageType} with stroke and eraser`, async ({
          mount,
        }) => {
          let size = 0;
          const handleExport = (kbs: number) => {
            size = kbs;
          };

          const { canvas, exportButton, eraserButton } =
            await mountCanvasForExport({ mount, imageType, handleExport });

          await exportButton.click();
          const emptyCanvasSize = size;

          await drawSquares(canvas);

          await exportButton.click();
          expect(size).toBeGreaterThan(emptyCanvasSize);
          const canvasWithStrokeSize = size;

          await eraserButton.click();
          await drawSquares(canvas);

          await exportButton.click();
          expect(size).toBeGreaterThanOrEqual(emptyCanvasSize);
          expect(size).toBeLessThan(canvasWithStrokeSize);
        });
      });

      test.describe("with background image", () => {
        test(`should export ${imageType} with stroke`, async ({ mount }) => {
          let size = 0;
          const handleExport = (kbs: number) => {
            size = kbs;
          };

          const { canvas, exportButton } = await mountCanvasForExport({
            mount,
            imageType,
            handleExport,
            backgroundUrl,
            exportWithBackgroundImage: true,
          });

          await exportButton.click();
          const emptyCanvasSize = size;

          await drawSquares(canvas);

          await exportButton.click();
          expect(size).toBeGreaterThan(emptyCanvasSize);
        });

        test(`should export ${imageType} with stroke and eraser`, async ({
          mount,
        }) => {
          let size = 0;
          const handleExport = (kbs: number) => {
            size = kbs;
          };

          const { canvas, exportButton, eraserButton } =
            await mountCanvasForExport({
              mount,
              imageType,
              handleExport,
              backgroundUrl,
              exportWithBackgroundImage: true,
            });

          await exportButton.click();
          const emptyCanvasSize = size;

          await drawSquares(canvas);

          await exportButton.click();
          expect(size).toBeGreaterThan(emptyCanvasSize);
          const canvasWithStrokeSize = size;

          await eraserButton.click();
          await drawSquares(canvas);

          await exportButton.click();
          expect(size).toBeGreaterThanOrEqual(emptyCanvasSize);
          expect(size).toBeLessThan(canvasWithStrokeSize);
        });

        test(`should export ${imageType} with entire background image correctly`, async ({
          mount,
        }) => {
          let size = 0;
          const handleExport = (kbs: number) => {
            size = kbs;
          };

          const { canvas, exportButton } = await mountCanvasForExport({
            mount,
            imageType,
            handleExport,
            backgroundUrl,
            exportWithBackgroundImage: true,
          });

          await exportButton.click();
          const emptyCanvasSize = size;

          await drawSquares(canvas);

          await exportButton.click();
          expect(size).toBeGreaterThan(emptyCanvasSize);
        });

        test(`should export ${imageType} without 'NA' symbol`, async ({
          mount,
        }) => {
          let size = 0;
          const handleExport = (kbs: number) => {
            size = kbs;
          };

          const { canvas, exportButton } = await mountCanvasForExport({
            mount,
            imageType,
            handleExport,
            backgroundUrl,
            exportWithBackgroundImage: true,
          });

          await exportButton.click();
          const emptyCanvasSize = size;

          await drawSquares(canvas);

          await exportButton.click();
          expect(size).toBeGreaterThan(emptyCanvasSize);
        });

        test(`should resolve issue for both public and protected URLs`, async ({
          mount,
        }) => {
          let size = 0;
          const handleExport = (kbs: number) => {
            size = kbs;
          };

          const { canvas, exportButton } = await mountCanvasForExport({
            mount,
            imageType,
            handleExport,
            backgroundUrl,
            exportWithBackgroundImage: true,
          });

          await exportButton.click();
          const emptyCanvasSize = size;

          await drawSquares(canvas);

          await exportButton.click();
          expect(size).toBeGreaterThan(emptyCanvasSize);
        });
      });

      test.describe("with background image, but exportWithBackgroundImage is set false", () => {
        test(`should export ${imageType} with stroke`, async ({ mount }) => {
          let size = 0;
          const handleExport = (kbs: number) => {
            size = kbs;
          };

          const { canvas, exportButton } = await mountCanvasForExport({
            mount,
            imageType,
            handleExport,
            backgroundUrl,
            exportWithBackgroundImage: false,
          });

          await exportButton.click();
          const emptyCanvasSize = size;
          // The canvas should be empty without the background image, so the size should be less than 3KB
          expect(emptyCanvasSize).toBeLessThan(3);

          await drawSquares(canvas);

          await exportButton.click();
          expect(size).toBeGreaterThan(emptyCanvasSize);
        });

        test(`should export ${imageType} with stroke and eraser`, async ({
          mount,
        }) => {
          let size = 0;
          const handleExport = (kbs: number) => {
            size = kbs;
          };

          const { canvas, exportButton, eraserButton } =
            await mountCanvasForExport({
              mount,
              imageType,
              handleExport,
              backgroundUrl,
              exportWithBackgroundImage: false,
            });

          await exportButton.click();
          const emptyCanvasSize = size;
          // The canvas should be empty without the background image, so the size should be less than 3KB
          expect(emptyCanvasSize).toBeLessThan(3);

          await drawSquares(canvas);

          await exportButton.click();
          expect(size).toBeGreaterThan(emptyCanvasSize);
          const canvasWithStrokeSize = size;

          await eraserButton.click();
          await drawSquares(canvas);

          await exportButton.click();
          expect(size).toBeGreaterThanOrEqual(emptyCanvasSize);
          expect(size).toBeLessThan(canvasWithStrokeSize);
        });
      });
    });
  });
});

test.describe("export SVG", () => {
  test.describe("without background image", () => {
    test("should export svg with stroke", async ({ mount }) => {
      let svg: string | undefined;
      const handleExportSVG = (exportedSvg: string | undefined) => {
        svg = exportedSvg;
      };

      const { canvas, exportSVGButton } = await mountCanvasForExport({
        mount,
        handleExportSVG,
      });

      const { firstStrokePathId } = getCanvasIds(canvasId);

      await exportSVGButton.click();
      expect(svg).not.toContain(firstStrokePathId.slice(1));

      await drawSquares(canvas);

      await exportSVGButton.click();
      expect(svg).toContain(firstStrokePathId.slice(1));
    });

    test("should export svg with stroke and eraser", async ({ mount }) => {
      let svg: string | undefined;
      const handleExportSVG = (exportedSvg: string | undefined) => {
        svg = exportedSvg;
      };

      const { canvas, exportSVGButton, eraserButton } =
        await mountCanvasForExport({
          mount,
          handleExportSVG,
        });

      const { firstStrokePathId, firstEraserStrokeId } = getCanvasIds(canvasId);

      await exportSVGButton.click();
      expect(svg).not.toContain(firstStrokePathId.slice(1));
      expect(svg).not.toContain(firstEraserStrokeId.slice(1));

      await drawSquares(canvas);

      await exportSVGButton.click();
      expect(svg).toContain(firstStrokePathId.slice(1));
      expect(svg).not.toContain(firstEraserStrokeId.slice(1));

      await eraserButton.click();
      await drawSquares(canvas);

      await exportSVGButton.click();
      expect(svg).toContain(firstEraserStrokeId.slice(1));
    });
  });

  test.describe("with background image", () => {
    test("should export svg with stroke", async ({ mount }) => {
      let svg: string | undefined;
      const handleExportSVG = (exportedSvg: string | undefined) => {
        svg = exportedSvg;
      };

      const { canvas, exportSVGButton } = await mountCanvasForExport({
        mount,
        handleExportSVG,
        backgroundUrl,
        exportWithBackgroundImage: true,
      });

      const { canvasBackgroundId, firstStrokePathId } = getCanvasIds(canvasId);

      await exportSVGButton.click();
      expect(svg).toContain(backgroundUrl);
      expect(svg).toContain(canvasBackgroundId.slice(1));
      expect(svg).not.toContain(firstStrokePathId.slice(1));

      await drawSquares(canvas);

      await exportSVGButton.click();
      expect(svg).toContain(backgroundUrl);
      expect(svg).toContain(canvasBackgroundId.slice(1));
      expect(svg).toContain(firstStrokePathId.slice(1));
    });

    test("should export svg with stroke and eraser", async ({ mount }) => {
      let svg: string | undefined;
      const handleExportSVG = (exportedSvg: string | undefined) => {
        svg = exportedSvg;
      };

      const { canvas, exportSVGButton, eraserButton } =
        await mountCanvasForExport({
          mount,
          handleExportSVG,
          backgroundUrl,
          exportWithBackgroundImage: true,
        });

      const { canvasBackgroundId, firstStrokePathId, firstEraserStrokeId } =
        getCanvasIds(canvasId);

      await exportSVGButton.click();
      expect(svg).toContain(backgroundUrl);
      expect(svg).toContain(canvasBackgroundId.slice(1));
      expect(svg).not.toContain(firstStrokePathId.slice(1));
      expect(svg).not.toContain(firstEraserStrokeId.slice(1));

      await drawSquares(canvas);

      await exportSVGButton.click();
      expect(svg).toContain(backgroundUrl);
      expect(svg).toContain(canvasBackgroundId.slice(1));
      expect(svg).toContain(firstStrokePathId.slice(1));
      expect(svg).not.toContain(firstEraserStrokeId.slice(1));

      await eraserButton.click();
      await drawSquares(canvas);

      await exportSVGButton.click();
      expect(svg).toContain(backgroundUrl);
      expect(svg).toContain(canvasBackgroundId.slice(1));
      expect(svg).toContain(firstEraserStrokeId.slice(1));
    });
  });

  test.describe("with background image, but exportWithBackgroundImage is set false", () => {
    test("should export svg with stroke", async ({ mount }) => {
      let svg: string | undefined;
      const handleExportSVG = (exportedSvg: string | undefined) => {
        svg = exportedSvg;
      };

      const { canvas, exportSVGButton } = await mountCanvasForExport({
        mount,
        handleExportSVG,
        backgroundUrl,
        exportWithBackgroundImage: false,
      });

      const { canvasBackgroundId, firstStrokePathId } = getCanvasIds(canvasId);

      await exportSVGButton.click();
      expect(svg).not.toContain(backgroundUrl);
      expect(svg).not.toContain(firstStrokePathId.slice(1));

      await drawSquares(canvas);

      await exportSVGButton.click();
      expect(svg).not.toContain(backgroundUrl);
      expect(svg).toContain(canvasBackgroundId.slice(1));
      expect(svg).toContain(firstStrokePathId.slice(1));
    });

    test("should export svg with stroke and eraser", async ({ mount }) => {
      let svg: string | undefined;
      const handleExportSVG = (exportedSvg: string | undefined) => {
        svg = exportedSvg;
      };

      const { canvas, exportSVGButton, eraserButton } =
        await mountCanvasForExport({
          mount,
          handleExportSVG,
          backgroundUrl,
          exportWithBackgroundImage: false,
        });

      const { canvasBackgroundId, firstStrokePathId, firstEraserStrokeId } =
        getCanvasIds(canvasId);

      await exportSVGButton.click();
      expect(svg).not.toContain(backgroundUrl);
      expect(svg).toContain(canvasBackgroundId.slice(1));
      expect(svg).not.toContain(firstStrokePathId.slice(1));
      expect(svg).not.toContain(firstEraserStrokeId.slice(1));

      await drawSquares(canvas);

      await exportSVGButton.click();
      expect(svg).not.toContain(backgroundUrl);
      expect(svg).toContain(canvasBackgroundId.slice(1));
      expect(svg).toContain(firstStrokePathId.slice(1));
      expect(svg).not.toContain(firstEraserStrokeId.slice(1));

      await eraserButton.click();
      await drawSquares(canvas);

      await exportSVGButton.click();
      expect(svg).not.toContain(backgroundUrl);
      expect(svg).toContain(canvasBackgroundId.slice(1));
      expect(svg).toContain(firstEraserStrokeId.slice(1));
    });
  });
});
