import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useThrottledCallback } from "../utils";

describe("useThrottledCallback", () => {
  it("should call the callback immediately if delay is 0", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(callback, 0, []));

    act(() => {
      result.current();
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should throttle the callback", () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(callback, 20, []));

    act(() => {
      result.current();
      result.current();
      result.current();
    });

    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(20);
    });

    expect(callback).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});
