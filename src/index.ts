/**
 * @heyharmony/design-tokens
 *
 * Unified design token system for Harmony apps.
 * Main entry point — exports types, token data, and resolve functions.
 *
 * Color values are OKLCH triplets ("L C H") or ("L C H / A" for alpha).
 *
 * For CSS/DOM operations (applyThemePreset), import from '@heyharmony/design-tokens/css-apply'.
 * For React Native (hex strings), import from '@heyharmony/design-tokens/react-native'.
 */

export { resolveTheme, resolveThemeExtended, resolveSurfaceScopes, isPresetAllowedForMode } from './resolve.js';
export {
  BASE_LIGHT,
  BASE_DARK,
  PRESET_OVERRIDES,
  THEME_PRESETS,
  THEME_PRESET_IDS,
  SURFACE_SCOPES_LIGHT,
  SURFACE_SCOPES_DARK,
  SHADOWS_LIGHT,
  SHADOWS_DARK,
  SHADOW_TO_CSS,
  SPACING,
  BORDER_RADIUS,
  SPACING_TO_CSS,
  RADIUS_TO_CSS,
} from './tokens.js';
export type {
  ThemeColors,
  ThemePresetId,
  ThemeMode,
  ThemePreset,
  ThemePresetColors,
  ThemeShadows,
  PresetPreview,
  SurfaceLevel,
  SurfaceContextualToken,
  SurfaceScopes,
  ThemeSpacing,
  ThemeBorderRadius,
} from './types.js';
