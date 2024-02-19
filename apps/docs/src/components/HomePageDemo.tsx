import { ReactSketchCanvas } from "react-sketch-canvas";
import paths from "../assets/initialSketch.json";
import { useEffect, useRef } from "react";

export function HomePageDemo() {
  const ref = useRef<ReactSketchCanvas>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.loadPaths(paths);
    }
  }, []);

  return (
    <ReactSketchCanvas
      ref={ref}
      canvasColor="transparent"
      height="400px"
      strokeWidth={4}
      strokeColor="red"
    />
  );
}
