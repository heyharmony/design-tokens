/**
 * React Native entry point.
 * Returns pre-computed hex color strings (gamut-mapped from OKLCH to sRGB).
 * Zero runtime color conversion overhead.
 */

import type { ThemeColors, ThemePresetId, SurfaceLevel } from './types.js';
import {
  BASE_LIGHT_HEX, BASE_DARK_HEX,
  PRESET_OVERRIDES_HEX,
  SURFACE_SCOPES_LIGHT_HEX, SURFACE_SCOPES_DARK_HEX,
  SPACING_PX, BORDER_RADIUS_PX,
} from './tokens-rn.js';

export { isPresetAllowedForMode } from './resolve.js';
export { THEME_PRESETS, THEME_PRESET_IDS } from './tokens.js';
export { SPACING_PX, BORDER_RADIUS_PX };
export type { ThemeColors, ThemePresetId, ThemeMode, ThemePreset, PresetPreview, SurfaceLevel, ThemeSpacingNumeric, ThemeBorderRadiusNumeric } from './types.js';

/**
 * Resolve theme colors for React Native.
 * Returns ThemeColors with hex string values (#RRGGBB or #RRGGBBAA).
 */
export function resolveTheme(preset: ThemePresetId, mode: 'light' | 'dark'): ThemeColors {
  const base = mode === 'light' ? BASE_LIGHT_HEX : BASE_DARK_HEX;
  const overrides = PRESET_OVERRIDES_HEX[preset]?.[mode] ?? {};
  const result = { ...base };
  for (const key of Object.keys(base) as (keyof ThemeColors)[]) {
    if (key in overrides) {
      result[key] = (overrides as Record<string, string>)[key];
    }
  }
  return result;
}

/**
 * Resolve theme colors for a specific surface level in React Native.
 * Returns ThemeColors with surface-contextual tokens overridden for the given surface.
 */
export function resolveThemeForSurface(
  preset: ThemePresetId,
  mode: 'light' | 'dark',
  surfaceLevel: SurfaceLevel,
): ThemeColors {
  const base = resolveTheme(preset, mode);

  const baseScopes = mode === 'light' ? SURFACE_SCOPES_LIGHT_HEX : SURFACE_SCOPES_DARK_HEX;
  const presetKey = mode === 'light' ? 'surfaceScopesLight' : 'surfaceScopesDark';
  const presetScopes = PRESET_OVERRIDES_HEX[preset]?.[presetKey];

  // Merge base + preset scopes for this level
  const scopeOverrides = {
    ...baseScopes[surfaceLevel],
    ...presetScopes?.[surfaceLevel],
  };

  if (!scopeOverrides || Object.keys(scopeOverrides).length === 0) return base;

  const result = { ...base };
  for (const [key, value] of Object.entries(scopeOverrides)) {
    result[key as keyof ThemeColors] = value;
  }
  return result;
}
