# Issue #163: On pointer move is recording coordinates too frequent, adding a throttling to optimise

**GitHub:** https://github.com/vinothpandian/react-sketch-canvas/issues/163
**Created:** 2024-08-01
**Labels:** None
**Type:** Enhancement / Performance

## Description

The current interval of recording coordinates on pointer move is around 1ms (as fast as the browser can run), which causes:

1. Recording too many unnecessary coordinates
2. Reduced smoothing effectiveness due to points being too close together
3. Potential performance issues

## Current Status

**Note:** This issue appears to have been addressed in PR #164 which added throttling to pointer move events.

## Analysis from Reporter

Testing showed that throttling of 10-20ms works best:
- Reduces the number of coordinate points recorded
- Makes lines smoother
- Improves performance

## Implementation Approach

The reporter suggested using a reference to store an interval for move event throttling, clearing the interval on pointer up.

## Recommendation

Consider making the throttle duration a configurable prop to allow users to tune performance vs precision based on their use case.
