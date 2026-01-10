# Issue #180: Double touches needed to make buttons respond after drawing on canvas

**GitHub:** https://github.com/vinothpandian/react-sketch-canvas/issues/180
**Created:** 2024-12-17
**Labels:** None
**Type:** Bug

## Description

After drawing a stroke on the canvas, there is a certain probability that the first click on a button on the page will require two touches to take effect. The first touch is swallowed/ignored.

## Steps to Reproduce

1. Draw a stroke on the canvas
2. Immediately tap a button outside the canvas
3. Notice that sometimes the first tap doesn't register
4. A second tap is required to trigger the button action

## Expected Behavior

Buttons should respond to the first touch immediately after drawing on the canvas.

## Environment

**Desktop:**
- OS: Windows 11
- Browser: Chrome (with device mode)
- Version: 131.0.6778.140

**Tablet:**
- OS: Windows 11 (Tablet)
- Browser: Edge
- Version: 129.0.2792.89

**Smartphone:**
- Device: Redmi Note 12 Turbo
- OS: HyperOS 1.0.9.0 (Android 14)
- Browser: Chrome
- Version: 131.0.6778.135

## Evidence

Video demonstration available in the GitHub issue showing the behavior with logged click and touchstart events.
