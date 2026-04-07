import type { ThemeColors, ThemePresetId, ThemePresetColors } from './types.js';
import { BASE_LIGHT, BASE_DARK, PRESET_OVERRIDES, THEME_PRESETS } from './tokens.js';

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
 * Check if a preset is allowed for a given mode.
 */
export function isPresetAllowedForMode(id: ThemePresetId, mode: 'light' | 'dark'): boolean {
  const preset = THEME_PRESETS[id];
  return !preset?.allowedModes || preset.allowedModes.includes(mode);
}
