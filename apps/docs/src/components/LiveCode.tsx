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
}

export function LiveCode({ files }: LiveCodeProps) {
  return (
    <div className="reset-wrapper">
      <SandpackProvider
        template="react-ts"
        theme="dark"
        customSetup={{
          dependencies: {
            "react-sketch-canvas": "latest",
          },
        }}
        files={files}
      >
        <SandpackLayout className="!block !rounded-none !rounded-t-lg !-mx-4 sm:!mx-0">
          <SandpackCodeEditor showTabs />
        </SandpackLayout>
        <div className="rounded-b-lg bg-zinc-900 p-4">
          <div className="overflow-hidden rounded bg-white p-1">
            <SandpackPreview
              className="h-64"
              showOpenInCodeSandbox={false}
              showRefreshButton={false}
            />
          </div>
        </div>
      </SandpackProvider>
    </div>
  );
}
