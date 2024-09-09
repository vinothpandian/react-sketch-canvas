import { useCallback, useRef } from "react";

export function useThrottledCallback<
  T extends (event: MouseEvent | TouchEvent) => void,
>(
  callback: T,
  delay: number,
  dependencies: unknown[],
): (...args: Parameters<T>) => void {
  const lastCallRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const throttledCallback = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(event);
      } else {
        clearTimeout(timeoutRef.current as ReturnType<typeof setTimeout>);
        timeoutRef.current = setTimeout(
          () => {
            lastCallRef.current = Date.now();
            callback(event);
          },
          delay - (now - lastCallRef.current),
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callback, delay, ...dependencies],
  );

  return throttledCallback;
}
