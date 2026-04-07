/**
 * React Native entry point.
 * Re-exports everything from the main module, but resolveTheme returns
 * hsl() wrapped strings instead of raw HSL triplets.
 */

import type { ThemeColors, ThemePresetId } from './types.js';
import { resolveTheme as resolveThemeRaw } from './resolve.js';

export { isPresetAllowedForMode } from './resolve.js';
export { THEME_PRESETS, THEME_PRESET_IDS } from './tokens.js';
export type { ThemeColors, ThemePresetId, ThemeMode, ThemePreset, PresetPreview } from './types.js';

/** Convert HSL triplet "H S% L%" to "hsl(H, S%, L%)" for React Native StyleSheet use. */
function toHslFunction(triplet: string): string {
  const [h, s, l] = triplet.trim().split(/\s+/);
  return `hsl(${h}, ${s}, ${l})`;
}

/**
 * Resolve theme colors for React Native.
 * Returns ThemeColors with values wrapped as hsl() function strings.
 */
export function resolveTheme(preset: ThemePresetId, mode: 'light' | 'dark'): ThemeColors {
  const raw = resolveThemeRaw(preset, mode);
  const result = {} as ThemeColors;
  for (const key of Object.keys(raw) as (keyof ThemeColors)[]) {
    result[key] = toHslFunction(raw[key]);
  }
  return result;
}
