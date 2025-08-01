# Icons Directory

This directory contains PNG image files for the sessions and streak icons in the Dr. ChinTickle app.

## Required Files

You need to upload these PNG files to this directory:

### 1. `sessions.png` ✅ UPLOADED
- **Purpose**: Sessions icon (replaces the SVG trophy)
- **Style**: Minimalist monoline outline trophy design
- **Format**: PNG with transparent background
- **Colors**: Automatically tinted to gold (#ffd700) for Miami Vice palette

### 2. `streak.png` ✅ UPLOADED
- **Purpose**: Streak icon (replaces the SVG fire with rocket design)
- **Style**: Minimalist monoline outline rocket design
- **Format**: PNG with transparent background
- **Colors**: Automatically tinted to orange (#ff8c00) for Miami Vice palette

## Usage

These icons are used in:
- `DashboardScreen.js` - Stats cards showing sessions and streak counts
- Components: `NeonTrophyIcon.js` and `NeonRocketIcon.js`

## Features

Both icons include:
- Smooth animations (pulsing for trophy, upward drift for rocket)
- Automatic color tinting based on Miami Vice color scheme
- Glow effects using CSS filters
- Web and mobile compatibility

## Animations

- **Trophy Icon**: Gentle pulsing animation to show achievement
- **Rocket Icon**: Subtle upward drift animation to show momentum and progress

## Notes

- The icons automatically scale and tint to match the app's color scheme
- Trophy icon uses gold (#ffd700) by default
- Rocket icon uses orange (#ff8c00) by default
- Both support custom colors via the `color` prop 