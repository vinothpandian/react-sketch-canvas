# Issue #56: Optimize data structure and code while keeping backward compatibility

**GitHub:** https://github.com/vinothpandian/react-sketch-canvas/issues/56
**Created:** 2021-11-21
**Labels:** None
**Type:** Enhancement / Performance

## Description

The current implementation has to split eraser and pen strokes during render, which reduces performance.

## Proposed Optimizations

- [ ] Update `CanvasPath` to have both eraser and pen strokes separately (Reduce time complexity)
- [ ] Update undo/redo to action-based instead of replicating data (Reduce space complexity)
- [ ] Keep backward compatibility by adding a split method in `loadPaths`

## Impact

These optimizations would improve:
- Rendering performance
- Memory usage
- Overall responsiveness, especially with many strokes

## Related Issues

- #127 - Slow performance
- #163 - On pointer move is recording coordinates too frequent
