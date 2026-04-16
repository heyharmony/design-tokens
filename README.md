# @heyharmony/design-tokens

Unified design token system for Harmony apps — web, desktop (Electron), and mobile (React Native).

## Features

- **63 semantic color tokens + 5 shadow tokens** covering surfaces, foreground, borders, accent, semantic states, tabs, inputs, and overlays
- **9 theme presets**: Default, Ocean, Forest, Berry, Sand, Ayu, Doodles, Black (OLED), White
- **OKLCH color space** — perceptually uniform, P3 wide gamut support on capable displays
- **Light/dark/system modes** with preset-mode restrictions
- **W3C DTCG format** — all token source files use the standard `$value`/`$type` schema
- **Auto-generated code** — `src/types.ts`, `src/tokens.ts`, and `src/tokens-rn.ts` are generated from JSON
- **Multi-platform output**: CSS `oklch()` custom properties, TypeScript objects, React Native hex strings
- **Surface-contextual scoping** — input/tab/border tokens adjust per elevation level (0-4) for contrast
- **WCAG contrast audit** — built-in tooling to validate AA compliance across all presets

## Architecture

```
tokens/                          <- Single source of truth (W3C DTCG JSON, OKLCH values)
  base/light.json, dark.json    <- Core + extended tokens per mode
  surface-scopes/               <- Contextual overrides per surface level
  presets/*.json                 <- Per-preset color overrides + surface scopes
  meta/presets.json              <- Preset metadata (names, previews, allowed modes)
  meta/css-vars.json             <- CSS variable name overrides

scripts/
  generate.ts                    <- Reads JSON -> generates src/types.ts + src/tokens.ts + src/tokens-rn.ts
  build-css.ts                   <- Generates dist/css/*.css from generated tokens
  color-utils.ts                 <- OKLCH math utilities (culori-based)
  compute-surface-scopes.ts      <- Algorithmic surface scope derivation
  audit-contrast.ts              <- WCAG AA contrast ratio validation

src/                             <- Generated + hand-written runtime code
  types.ts                       <- @generated -- ThemeColors, ThemeShadows, ThemePresetId, etc.
  tokens.ts                      <- @generated -- BASE_LIGHT/DARK, PRESET_OVERRIDES, TOKEN_TO_CSS
  tokens-rn.ts                   <- @generated -- Pre-computed hex values for React Native
  resolve.ts                     <- resolveTheme(), resolveSurfaceScopes()
  css.ts                         <- applyThemePreset(), applySurfaceScopeToElement()
  react-native.ts                <- React Native entry point (hex strings)
  index.ts                       <- Core entry point

dist/                            <- Build output
  css/                           <- CSS custom properties (oklch values)
  js/                            <- ESM + CJS bundles with TypeScript definitions
```

### Data flow

```
tokens/*.json  ->  npm run generate  ->  src/types.ts + src/tokens.ts + src/tokens-rn.ts
                                              |
                                    npm run build:css  ->  dist/css/*.css
                                    npm run build:js   ->  dist/js/*.js
```

## Installation

```bash
npm install @heyharmony/design-tokens
```

## Usage

### Web / Desktop (CSS variables)

```typescript
import { applyThemePreset, THEME_PRESETS, isPresetAllowedForMode } from '@heyharmony/design-tokens/css-apply';

// Apply preset colors as CSS custom properties
applyThemePreset('ocean', true /* isDark */);
```

Import base CSS variables:

```css
@import '@heyharmony/design-tokens/css/light';
@import '@heyharmony/design-tokens/css/dark';
```

CSS variables contain full `oklch()` values — use them directly with `var()`:

```css
.card {
  background: var(--harmony-surface-1);
  border: 1px solid var(--harmony-border-subtle);
  box-shadow: var(--harmony-shadow-1);
}
.card:hover {
  background: var(--harmony-surface-1-hover);
}
```

### React Native

```typescript
import { resolveTheme, isPresetAllowedForMode } from '@heyharmony/design-tokens/react-native';
import type { ThemeColors } from '@heyharmony/design-tokens/react-native';

const colors: ThemeColors = resolveTheme('ocean', 'dark');
// colors.surface0 === '#071a2b'  (hex, gamut-mapped from OKLCH)
// colors.accent === '#0f2847'
```

React Native values are pre-computed hex strings (`#RRGGBB` or `#RRGGBBAA` for alpha tokens) with zero runtime conversion overhead.

### Core (platform-agnostic)

```typescript
import { resolveTheme, BASE_LIGHT, BASE_DARK, THEME_PRESET_IDS } from '@heyharmony/design-tokens';

// Returns raw OKLCH triplets ("L C H" or "L C H / A")
const colors = resolveTheme('forest', 'light');
// colors.surface0 === '0.974 0.0265 153.1'
```

## Color Space: OKLCH

All token values use the **OKLCH** color space — a perceptually uniform model where equal numerical steps produce equal visual steps, regardless of hue. This ensures consistent contrast and appearance across all theme presets.

Format: `"L C H"` where:
- **L** (lightness): 0-1
- **C** (chroma): 0-0.4+ (higher values exceed sRGB gamut, displayable on P3 screens)
- **H** (hue): 0-360 degrees

Alpha tokens use `"L C H / A"` format (e.g., `"0 0 0 / 0.5"` for 50% black overlay).

### P3 wide gamut

Accent colors in themed presets (Ocean, Forest, Berry, Sand, Ayu) use OKLCH chroma values that exceed sRGB, enabling more vibrant colors on P3-capable displays. Browsers automatically gamut-map on sRGB screens. React Native hex output is clamped to sRGB.

## Token Categories

| Category | Tokens | Count | Description |
|----------|--------|-------|-------------|
| Surfaces | `surface0`-`surface4` + `Hover`, `Active`, `Highlight` | 20 | Background layers by elevation |
| Foreground | `fg`, `fgSecondary`, `fgTertiary`, `fgDisabled`, `fgInverse`, `fgLink`, `fgSuccess`, `fgWarning`, `fgError` | 9 | Text and icon colors |
| Borders | `borderSubtle`, `borderDefault`, `borderSuccess`, `borderWarning`, `borderError` | 5 | Dividers, borders, semantic borders |
| Accent | `accent`, `accentForeground`, `accentHover`, `accentActive`, `accentSubtle`, `accentMuted`, `accentBorder` | 7 | Primary interactive color system |
| Sidebar | `sidebarAccent`, `sidebarAccentForeground`, `sidebarHover` | 3 | Sidebar-specific colors |
| Tabs | `tabBg`, `tabBgHover`, `tabOutline` | 3 | Tab component colors |
| Inputs | `inputBg`, `inputBorder`, `inputBorderHover`, `inputBorderFocus`, `inputBorderError`, `inputBorderActive`, `inputBorderHighlight`, `inputBgActive`, `inputBgHighlight`, `inputBgDisabled`, `inputPlaceholder` | 11 | Form input colors |
| Semantic bg | `bgSuccess`, `bgWarning`, `bgError` | 3 | Alert/toast background colors |
| Extended | `background`, `panelBackground`, `mainPanelBackground`, `ring`, `overlay`, `surfaceGlass`, `skeleton` | 7 | Layout, overlays, loading states |
| Shadows | `shadow0`-`shadow4` | 5 | Elevation shadow scale (CSS box-shadow) |

### Accent system

The accent system provides 7 tokens for building interactive UI:

| Token | Use case |
|-------|----------|
| `accent` | Default accent background (e.g., badge, tag) |
| `accentForeground` | Text on accent background |
| `accentHover` | Hover state |
| `accentActive` | Pressed/active state |
| `accentSubtle` | Low-emphasis tinted background |
| `accentMuted` | Very low-emphasis, barely visible tint |
| `accentBorder` | Accent-tinted border for outlined elements |

### Semantic colors

Semantic tokens provide background, foreground, and border variants for success/warning/error states:

```css
.alert-success {
  background: var(--harmony-bg-success);
  color: var(--harmony-fg-success);
  border: 1px solid var(--harmony-border-success);
}
```

### Overlay and glass tokens

| Token | CSS variable | Use case |
|-------|-------------|----------|
| `overlay` | `--overlay` | Modal/dialog backdrop scrim (50-60% black with alpha) |
| `surfaceGlass` | `--surface-glass` | Frosted glass panel background (with alpha for blur-behind) |
| `skeleton` | `--skeleton` | Loading skeleton shimmer color |

### Shadow tokens

5 elevation levels matching the surface hierarchy:

```css
.card        { box-shadow: var(--harmony-shadow-1); }
.dropdown    { box-shadow: var(--harmony-shadow-2); }
.modal       { box-shadow: var(--harmony-shadow-3); }
.notification { box-shadow: var(--harmony-shadow-4); }
```

Shadow values use `oklch()` alpha colors for consistent appearance across themes. In dark mode, shadows are more opaque for visibility.

### Surface interaction states

Each surface level (0-4) provides three interaction state tokens:

| State | Token pattern | Use case |
|-------|--------------|----------|
| Hover | `surface{N}Hover` | Mouse hover |
| Active | `surface{N}Active` | Pressed/mouse-down |
| Highlight | `surface{N}Highlight` | Selected, focused row/item |

```css
.list-item {
  background: var(--harmony-surface-1);
}
.list-item:hover {
  background: var(--harmony-surface-1-hover);
}
.list-item:active {
  background: var(--harmony-surface-1-active);
}
.list-item[aria-selected="true"] {
  background: var(--harmony-surface-1-highlight);
}
```

### Surface-contextual scoping

Input, tab, and border tokens are scoped to every surface level (0-4) in both modes. Placing a form on any surface automatically yields the right contrast.

The following 16 tokens are surface-contextual with per-level overrides:

| Group | Tokens |
|-------|--------|
| Input bg | `inputBg`, `inputBgActive`, `inputBgHighlight`, `inputBgDisabled` |
| Input border | `inputBorder`, `inputBorderHover`, `inputBorderFocus`, `inputBorderError`, `inputBorderActive`, `inputBorderHighlight` |
| Input text | `inputPlaceholder` |
| Tab | `tabBg`, `tabBgHover`, `tabOutline` |
| Border | `borderSubtle`, `borderDefault` |

Use `resolveSurfaceScopes()` or `applySurfaceScopeToElement()` to apply scopes programmatically.

## Accessibility

### Focus states

`inputBorderFocus` is always visually distinct from `inputBorderHover` across all presets. Focus borders derive from the preset's accent/ring color, ensuring keyboard users can distinguish focused from hovered inputs (WCAG 2.4.7).

### Contrast audit

Run the built-in WCAG contrast audit:

```bash
npm run audit:contrast          # Report mode
npm run audit:contrast -- --strict  # CI mode (exits non-zero on failure)
```

The audit checks all fg-on-bg pairs across all 9 presets in both modes against WCAG AA thresholds (4.5:1 for normal text, 3:1 for large text).

## Contributing

Token definitions live in `tokens/*.json` using the [W3C Design Tokens](https://tr.designtokens.org/format/) format with OKLCH values. To make changes:

1. Edit the relevant JSON file in `tokens/`
2. Run `npm run generate` to regenerate `src/types.ts`, `src/tokens.ts`, and `src/tokens-rn.ts`
3. Run `npm test` to verify
4. Run `npm run audit:contrast` to check accessibility
5. Run `npm run build` to produce the full output

Never edit `src/types.ts`, `src/tokens.ts`, or `src/tokens-rn.ts` directly — they are generated files.

Use `npm run generate:check` in CI to detect stale generated files.

## License

MIT
