# @heyharmony/design-tokens

Unified design token system for Harmony apps — web, desktop (Electron), and mobile (React Native).

## Features

- **48 semantic design tokens** covering surfaces, foreground, borders, accent, tabs, and inputs
- **7 theme presets**: Default, Ocean, Forest, Berry, Doodles, Black (OLED), White
- **Light/dark/system modes** with preset-mode restrictions
- **W3C DTCG format** — all token source files use the standard `$value`/`$type` schema
- **Auto-generated code** — `src/types.ts` and `src/tokens.ts` are generated from JSON, never hand-edited
- **Multi-platform output**: CSS custom properties, TypeScript objects, React Native hsl() strings
- **Surface-contextual scoping** — input/tab/border tokens adjust per elevation level for contrast

## Architecture

```
tokens/                          ← Single source of truth (W3C DTCG JSON)
  base/light.json, dark.json    ← 38 core + 4 extended tokens per mode
  surface-scopes/light.json, dark.json  ← Contextual overrides per surface level
  presets/*.json                 ← Per-preset color overrides + surface scopes
  meta/presets.json              ← Preset metadata (names, previews, allowed modes)
  meta/css-vars.json             ← CSS variable name overrides (Shadcn/UI compat)

scripts/generate.ts              ← Reads JSON → generates src/types.ts + src/tokens.ts
scripts/build-css.ts             ← Generates dist/css/*.css from generated tokens

src/                             ← Generated + hand-written runtime code
  types.ts                       ← @generated — ThemeColors, ThemePresetId, etc.
  tokens.ts                      ← @generated — BASE_LIGHT/DARK, PRESET_OVERRIDES, TOKEN_TO_CSS
  resolve.ts                     ← resolveTheme(), resolveSurfaceScopes()
  css.ts                         ← applyThemePreset(), applySurfaceScopeToElement()
  react-native.ts                ← React Native entry point (hsl() strings)
  index.ts                       ← Core entry point

dist/                            ← Build output
  css/                           ← CSS custom properties
  js/                            ← ESM + CJS bundles with TypeScript definitions
```

### Data flow

```
tokens/*.json  →  npm run generate  →  src/types.ts + src/tokens.ts
                                              ↓
                                    npm run build:css  →  dist/css/*.css
                                    npm run build:js   →  dist/js/*.js
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

### React Native

```typescript
import { resolveTheme, isPresetAllowedForMode } from '@heyharmony/design-tokens/react-native';
import type { ThemeColors } from '@heyharmony/design-tokens/react-native';

const colors: ThemeColors = resolveTheme('ocean', 'dark');
// colors.surface0 === 'hsl(210, 60%, 5%)'
```

### Core (platform-agnostic)

```typescript
import { resolveTheme, BASE_LIGHT, BASE_DARK, THEME_PRESET_IDS } from '@heyharmony/design-tokens';

// Returns raw HSL triplets ("H S% L%")
const colors = resolveTheme('forest', 'light');
// colors.surface0 === '142 76% 97%'
```

## Token Categories

| Category | Tokens | Example |
|----------|--------|---------|
| Surfaces | `surface0`–`surface4`, `surface0Hover`–`surface4Hover` | Background layers by elevation |
| Foreground | `fg`, `fgSecondary`, `fgTertiary`, `fgDisabled`, `fgInverse`, `fgLink`, `fgSuccess`, `fgWarning`, `fgError` | Text and icon colors |
| Borders | `borderSubtle`, `borderDefault` | Dividers and borders |
| Accent | `accent`, `accentForeground`, `accentHover` | Primary interactive color |
| Sidebar | `sidebarAccent`, `sidebarAccentForeground`, `sidebarHover` | Sidebar-specific colors |
| Tabs | `tabBg`, `tabBgHover`, `tabOutline` | Tab component colors |
| Inputs | `inputBg`, `inputBorder`, `inputBorderHover`, `inputBorderFocus`, `inputBorderError`, `inputBgDisabled`, `inputPlaceholder` | Form input colors |
| Extended | `background`, `panelBackground`, `mainPanelBackground`, `ring` | Web/desktop layout tokens |

## Contributing

Token definitions live in `tokens/*.json` using the [W3C Design Tokens](https://tr.designtokens.org/format/) format. To make changes:

1. Edit the relevant JSON file in `tokens/`
2. Run `npm run generate` to regenerate `src/types.ts` and `src/tokens.ts`
3. Run `npm test` to verify
4. Run `npm run build` to produce the full output

Never edit `src/types.ts` or `src/tokens.ts` directly — they are generated files.

Use `npm run generate:check` in CI to detect stale generated files.

## License

MIT
