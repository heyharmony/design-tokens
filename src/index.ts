/**
 * @heyharmony/design-tokens
 *
 * Unified design token system for Harmony apps.
 * Main entry point — exports types, token data, and resolve functions.
 *
 * For CSS/DOM operations (applyThemePreset), import from '@heyharmony/design-tokens/css-apply'.
 * For React Native (hsl() strings), import from '@heyharmony/design-tokens/react-native'.
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
} from './tokens.js';
export type {
  ThemeColors,
  ThemePresetId,
  ThemeMode,
  ThemePreset,
  ThemePresetColors,
  PresetPreview,
  SurfaceLevel,
  SurfaceContextualToken,
  SurfaceScopes,
} from './types.js';
