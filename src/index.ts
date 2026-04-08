/**
 * @heyharmony/design-tokens
 *
 * Unified design token system for Harmony apps.
 * Main entry point — exports types, token data, and resolve functions.
 *
 * For CSS/DOM operations (applyThemePreset), import from '@heyharmony/design-tokens/css-apply'.
 * For React Native (hsl() strings), import from '@heyharmony/design-tokens/react-native'.
 */

export { resolveTheme, resolveThemeExtended, isPresetAllowedForMode } from './resolve.js';
export {
  BASE_LIGHT,
  BASE_DARK,
  PRESET_OVERRIDES,
  THEME_PRESETS,
  THEME_PRESET_IDS,
} from './tokens.js';
export type {
  ThemeColors,
  ThemePresetId,
  ThemeMode,
  ThemePreset,
  ThemePresetColors,
  PresetPreview,
} from './types.js';
