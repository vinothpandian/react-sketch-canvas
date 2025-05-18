---
"react-sketch-canvas": patch
---

Fix undo/redo behavior:
- Fix timing issues by moving history update logic into mouse-down/redo/undo/clear functions
- Prevent extra strokes from being recorded during history updates
- Fix bug where canvas couldn't undo to empty state
- Improve loadPath function to properly handle history state
- Add proper history handling when using loadPaths
- Fix reset canvas history logic
- Implement event queue for undo/redo operations
- Fix order of operations in history management
- Add tests for undo behavior after clear and with loadPaths

