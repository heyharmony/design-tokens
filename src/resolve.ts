import type { ThemeColors, ThemePresetId, ThemePresetColors, SurfaceScopes, SurfaceLevel } from './types.js';
import { BASE_LIGHT, BASE_DARK, PRESET_OVERRIDES, THEME_PRESETS, SURFACE_SCOPES_LIGHT, SURFACE_SCOPES_DARK } from './tokens.js';

/**
 * Resolve the full set of theme colors for a given preset and mode.
 * Returns HSL triplet strings ("H S% L%") — the canonical format for CSS variables.
 */
export function resolveTheme(preset: ThemePresetId, mode: 'light' | 'dark'): ThemeColors {
  const base = mode === 'light' ? BASE_LIGHT : BASE_DARK;
  const overrides = PRESET_OVERRIDES[preset]?.[mode] ?? {};
  const result = { ...base };
  for (const key of Object.keys(base) as (keyof ThemeColors)[]) {
    if (key in overrides) {
      result[key] = (overrides as Record<string, string>)[key];
    }
  }
  return result;
}

/**
 * Resolve preset colors including optional extended tokens (background, panelBackground, etc.).
 * Used by web/desktop apps that need these additional CSS variables.
 */
export function resolveThemeExtended(preset: ThemePresetId, mode: 'light' | 'dark'): ThemePresetColors {
  const base = mode === 'light' ? BASE_LIGHT : BASE_DARK;
  const overrides = PRESET_OVERRIDES[preset]?.[mode] ?? {};
  return { ...base, ...overrides } as ThemePresetColors;
}

/**
 * Resolve the surface-contextual token scopes for a given preset and mode.
 * Returns a mapping of surface levels to their contextual token overrides.
 */
export function resolveSurfaceScopes(preset: ThemePresetId, mode: 'light' | 'dark'): SurfaceScopes {
  const baseScopes = mode === 'light' ? SURFACE_SCOPES_LIGHT : SURFACE_SCOPES_DARK;
  const presetKey = mode === 'light' ? 'surfaceScopesLight' : 'surfaceScopesDark';
  const presetScopes = PRESET_OVERRIDES[preset]?.[presetKey];

  if (!presetScopes) return baseScopes;

  const allLevels = new Set([
    ...Object.keys(baseScopes),
    ...Object.keys(presetScopes),
  ]) as Set<SurfaceLevel>;

  const merged: SurfaceScopes = {};
  for (const level of allLevels) {
    merged[level] = {
      ...baseScopes[level],
      ...presetScopes[level],
    };
  }
  return merged;
}

/**
 * Check if a preset is allowed for a given mode.
 */
export function isPresetAllowedForMode(id: ThemePresetId, mode: 'light' | 'dark'): boolean {
  const preset = THEME_PRESETS[id];
  return !preset?.allowedModes || preset.allowedModes.includes(mode);
}
