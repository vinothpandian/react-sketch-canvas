import {
  SandpackCodeEditor,
  type SandpackFiles,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import "./reset.css";

interface LiveCodeProps {
  files: SandpackFiles;
  editorClassName?: string;
  previewClassName?: string;
}

export function LiveCode({
  files,
  editorClassName = "h-64",
  previewClassName = "h-80",
}: LiveCodeProps) {
  return (
    <div className="reset-wrapper mt-4">
      <SandpackProvider
        template="react-ts"
        theme="dark"
        customSetup={{
          dependencies: {
            // TODO: Remove this once the issue is fixed
            "react-sketch-canvas": "next",
          },
        }}
        options={{
          externalResources: [
            "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
            "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js",
          ],
        }}
        files={files}
      >
        <SandpackLayout
          className={`!block !rounded-none !rounded-t-lg !-mx-4 sm:!mx-0 ${editorClassName}`}
        >
          <SandpackCodeEditor showTabs />
        </SandpackLayout>
        <div className="rounded-b-lg bg-zinc-900 p-2">
          <div className="overflow-hidden rounded bg-white p-1">
            <SandpackPreview
              className={previewClassName}
              showOpenInCodeSandbox
              showRefreshButton
            />
          </div>
        </div>
      </SandpackProvider>
    </div>
  );
}
