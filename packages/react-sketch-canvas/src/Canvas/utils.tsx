import { useCallback, useRef } from "react";

export function useThrottledCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
  dependencies: any[]
): (...args: Parameters<T>) => void {
  const lastCallRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      } else {
        clearTimeout(timeoutRef.current as ReturnType<typeof setTimeout>);
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callback(...args);
        }, delay - (now - lastCallRef.current));
      }
    },
    [callback, delay, ...dependencies]
  );

  return throttledCallback;
}
