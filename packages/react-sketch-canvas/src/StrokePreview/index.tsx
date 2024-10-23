// borrowed from https://github.com/vinothpandian/react-sketch-canvas/issues/169

import { ReactSketchCanvasRef } from "../ReactSketchCanvas/types";
import React, {
  RefObject,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";

interface StrokePreviewProps {
  top: string;
  left: string;
  strokeWidth: number;
}
const StrokePreview = forwardRef<HTMLDivElement, StrokePreviewProps>(
  ({ top, left, strokeWidth }, ref) => (
    <div
      style={{
        top,
        left,
        width: `${strokeWidth}px`,
        height: `${strokeWidth}px`,
        transform: "translate(-50%, -50%)",
        position: "absolute",
        borderRadius: "50%",
        backgroundColor: "rgba(182,146,146,0.75)",
      }}
      ref={ref}
    />
  ),
);

function useStrokePreview(canvasRef: RefObject<ReactSketchCanvasRef>) {
  const [cursorTop, setCursorTop] = useState<string>("0px");
  const [cursorLeft, setCursorLeft] = useState<string>("0px");
  const [isDrawing, setIsDrawing] = useState(true);
  const cursorFollowerRef = useRef<HTMLDivElement>(null);
  const timeoutId = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const canvasWrapper = canvasRef.current?.getEl() as HTMLDivElement;

    const positionCursorFollower = (e: MouseEvent | PointerEvent) => {
      timeoutId.current = setTimeout(() => {
        if (canvasWrapper) {
          const { offsetHeight, offsetWidth } = canvasWrapper;
          setCursorTop(`${Math.min(offsetHeight, Math.max(0, e.offsetY))}px`);
          setCursorLeft(`${Math.min(offsetWidth, Math.max(0, e.offsetX))}px`);
        }
      }, 1);
    };

    const hoverStart = () => setIsDrawing(true);
    const hoverEnd = () => setIsDrawing(false);

    if (canvasWrapper) {
      canvasWrapper.addEventListener("mousemove", positionCursorFollower);
      canvasWrapper.addEventListener("pointermove", positionCursorFollower);
      canvasWrapper.addEventListener("mouseenter", hoverStart);
      canvasWrapper.addEventListener("mouseleave", hoverEnd);
    }

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }

      // this needs to be re-queried here
      const canvasWrapper = canvasRef.current?.getEl() as HTMLDivElement;
      canvasWrapper?.removeEventListener("mousemove", positionCursorFollower);
      canvasWrapper?.removeEventListener("mouseenter", hoverStart);
      canvasWrapper?.removeEventListener("mouseleave", hoverEnd);
      canvasWrapper?.removeEventListener("pointermove", positionCursorFollower);
    };
  }, []);

  return { cursorTop, cursorLeft, isDrawing, cursorFollowerRef };
}

export default StrokePreview;
export { useStrokePreview, StrokePreview };
