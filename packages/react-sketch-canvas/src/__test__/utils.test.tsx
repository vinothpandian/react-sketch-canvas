import { describe, expect, it, mock } from "bun:test";
import { act, renderHook } from "@testing-library/react";

import { useThrottledCallback } from "../utils";

describe("useThrottledCallback", () => {
  it("should call the callback immediately if delay is 0", () => {
    const callback = mock();
    const { result } = renderHook(() => useThrottledCallback(callback, 0, []));

    act(() => {
      result.current();
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should throttle the callback", async () => {
    const callback = mock();
    const delay = 20;
    const { result } = renderHook(() =>
      useThrottledCallback(callback, delay, []),
    );

    act(() => {
      result.current();
      result.current();
      result.current();
    });

    // First call is immediate
    expect(callback).toHaveBeenCalledTimes(1);

    // Wait for throttle delay to pass
    await new Promise((resolve) => setTimeout(resolve, delay + 10));

    // Throttled call should have fired
    expect(callback).toHaveBeenCalledTimes(2);
  });
});
