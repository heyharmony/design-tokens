# @heyharmony/design-tokens

Unified design token system for Harmony apps — web, desktop (Electron), and mobile (React Native).

## Features

- **44 semantic design tokens** covering surfaces, foreground, borders, accent, tabs, and inputs
- **7 theme presets**: Default, Ocean, Forest, Berry, Doodles, Black (OLED), White
- **Light/dark/system modes** with preset-mode restrictions
- **W3C DTCG format** token source files for Figma/Tokens Studio compatibility
- **Multi-platform output**: CSS custom properties, TypeScript objects, React Native hsl() strings

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
| Surfaces | `surface0`–`surface4`, `surface2Hover` | Background layers by elevation |
| Foreground | `fg`, `fgSecondary`, `fgTertiary`, `fgDisabled`, `fgInverse`, `fgLink`, `fgSuccess`, `fgWarning`, `fgError` | Text and icon colors |
| Borders | `borderSubtle`, `borderDefault` | Dividers and borders |
| Accent | `accent`, `accentForeground`, `accentHover` | Primary interactive color |
| Sidebar | `sidebarAccent`, `sidebarAccentForeground`, `sidebarHover` | Sidebar-specific colors |
| Tabs | `tabBg`, `tabBgHover`, `tabOutline` | Tab component colors |
| Inputs | `inputBg`, `inputBorder`, `inputBorderHover`, `inputBorderFocus`, `inputBorderError`, `inputBgDisabled`, `inputPlaceholder` | Form input colors |

## License

MIT
