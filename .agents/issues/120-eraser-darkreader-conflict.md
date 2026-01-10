# Issue #120: Eraser not working with DarkReader

**GitHub:** https://github.com/vinothpandian/react-sketch-canvas/issues/120
**Created:** 2023-04-27
**Labels:** None
**Type:** Bug / Third-Party Compatibility

## Description

When the DarkReader browser addon is installed and activated, the eraser functionality does not work correctly. The "erased" area shows inverted behavior - the drawn line becomes transparent and is only visible where it was "erased."

## Steps to Reproduce

1. Install and activate DarkReader addon
2. Draw some lines on canvas
3. Try to erase the lines

## Actual Behavior

The drawn line becomes transparent, and it is only visible in the areas where erasing was attempted.

## Expected Behavior

The erased areas should be hidden/removed as normal.

## Environment

- Browser: Chrome, Edge
- Version: 112
- DarkReader addon installed

## Evidence

Screenshots in the GitHub issue show:
- Before: Letter "P" drawn normally
- After "erasing": The letter becomes visible only where erasing was attempted

## Context

DarkReader is a very popular browser extension with millions of users. Compatibility with this addon would benefit many users.
