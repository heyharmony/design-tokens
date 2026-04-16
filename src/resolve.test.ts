import { describe, it, expect } from 'vitest';
import { resolveTheme, resolveThemeExtended, resolveSurfaceScopes, isPresetAllowedForMode } from './resolve.js';
import { THEME_PRESET_IDS, BASE_LIGHT, BASE_DARK, SURFACE_SCOPES_LIGHT, SURFACE_SCOPES_DARK } from './tokens.js';
import type { ThemeColors, ThemePresetId } from './types.js';

const ALL_KEYS = Object.keys(BASE_LIGHT) as (keyof ThemeColors)[];

/** OKLCH triplet: L C H (optionally L C H / A) */
const OKLCH_REGEX = /^\d+(\.\d+)?\s+\d+(\.\d+)?\s+\d+(\.\d+)?(\s*\/\s*\d+(\.\d+)?)?$/;

describe('resolveTheme', () => {
  it('returns all token keys for every preset/mode combination', () => {
    for (const preset of THEME_PRESET_IDS) {
      for (const mode of ['light', 'dark'] as const) {
        const colors = resolveTheme(preset, mode);
        for (const key of ALL_KEYS) {
          expect(colors[key], `${preset}/${mode}/${key}`).toBeDefined();
          expect(typeof colors[key]).toBe('string');
          expect(colors[key].length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('values are valid OKLCH triplet strings', () => {
    for (const preset of THEME_PRESET_IDS) {
      for (const mode of ['light', 'dark'] as const) {
        const colors = resolveTheme(preset, mode);
        for (const key of ALL_KEYS) {
          expect(colors[key], `${preset}/${mode}/${key}: "${colors[key]}"`).toMatch(OKLCH_REGEX);
        }
      }
    }
  });

  it('returns base values for default preset', () => {
    expect(resolveTheme('default', 'light')).toEqual(BASE_LIGHT);
    expect(resolveTheme('default', 'dark')).toEqual(BASE_DARK);
  });

  it('applies ocean light overrides correctly', () => {
    const colors = resolveTheme('ocean', 'light');
    // Ocean surface0 should differ from base
    expect(colors.surface0).not.toBe(BASE_LIGHT.surface0);
    // Non-overridden tokens should fall back to base
    expect(colors.fg).toBe(BASE_LIGHT.fg);
  });

  it('applies ocean dark overrides correctly', () => {
    const colors = resolveTheme('ocean', 'dark');
    expect(colors.surface0).not.toBe(BASE_DARK.surface0);
    expect(colors.fg).toBe(BASE_DARK.fg);
  });

  it('applies black preset overrides (dark only)', () => {
    const colors = resolveTheme('black', 'dark');
    expect(colors.surface0).not.toBe(BASE_DARK.surface0);
    // Light should be unchanged base
    expect(resolveTheme('black', 'light')).toEqual(BASE_LIGHT);
  });

  it('applies white preset overrides (light only)', () => {
    const colors = resolveTheme('white', 'light');
    expect(colors.surface0).not.toBe(BASE_LIGHT.surface0);
    // Dark should be unchanged base
    expect(resolveTheme('white', 'dark')).toEqual(BASE_DARK);
  });

  it('includes new accent tokens', () => {
    const colors = resolveTheme('default', 'light');
    expect(colors.accentActive).toBeDefined();
    expect(colors.accentSubtle).toBeDefined();
    expect(colors.accentMuted).toBeDefined();
    expect(colors.accentBorder).toBeDefined();
  });

  it('includes semantic background tokens', () => {
    const colors = resolveTheme('default', 'light');
    expect(colors.bgSuccess).toBeDefined();
    expect(colors.bgWarning).toBeDefined();
    expect(colors.bgError).toBeDefined();
  });

  it('includes semantic border tokens', () => {
    const colors = resolveTheme('default', 'light');
    expect(colors.borderSuccess).toBeDefined();
    expect(colors.borderWarning).toBeDefined();
    expect(colors.borderError).toBeDefined();
  });

  it('inputBorderFocus differs from inputBorderHover', () => {
    for (const preset of THEME_PRESET_IDS) {
      for (const mode of ['light', 'dark'] as const) {
        const colors = resolveTheme(preset, mode);
        expect(
          colors.inputBorderFocus,
          `${preset}/${mode}: focus should differ from hover`,
        ).not.toBe(colors.inputBorderHover);
      }
    }
  });

  it('surface4 differs from surface3 in light mode', () => {
    for (const preset of THEME_PRESET_IDS) {
      const colors = resolveTheme(preset, 'light');
      expect(
        colors.surface4,
        `${preset}: surface4 should differ from surface3`,
      ).not.toBe(colors.surface3);
    }
  });
});

describe('resolveThemeExtended', () => {
  it('includes extended tokens for ocean preset', () => {
    const colors = resolveThemeExtended('ocean', 'light');
    expect(colors.background).toBeDefined();
    expect(colors.panelBackground).toBeDefined();
    expect(colors.ring).toBeDefined();
  });

  it('does not have extended tokens for default preset', () => {
    const colors = resolveThemeExtended('default', 'light');
    expect(colors.background).toBeUndefined();
  });
});

describe('resolveSurfaceScopes', () => {
  it('returns base scopes for default preset', () => {
    expect(resolveSurfaceScopes('default', 'light')).toEqual(SURFACE_SCOPES_LIGHT);
    expect(resolveSurfaceScopes('default', 'dark')).toEqual(SURFACE_SCOPES_DARK);
  });

  it('returns hue-tinted surface scopes for themed presets', () => {
    for (const preset of ['ocean', 'forest', 'berry'] as ThemePresetId[]) {
      const lightScopes = resolveSurfaceScopes(preset, 'light');
      const darkScopes = resolveSurfaceScopes(preset, 'dark');
      expect(lightScopes['3'], `${preset} light surface 3`).toBeDefined();
      expect(darkScopes['2'], `${preset} dark surface 2`).toBeDefined();
      // Themed scopes should differ from base neutral scopes
      expect(lightScopes['3']!.inputBg).not.toBe(SURFACE_SCOPES_LIGHT['3']!.inputBg);
      expect(darkScopes['2']!.inputBg).not.toBe(SURFACE_SCOPES_DARK['2']!.inputBg);
    }
  });

  it('surface scoped values differ from flat defaults for overridden surfaces', () => {
    const darkScopes = resolveSurfaceScopes('default', 'dark');
    expect(darkScopes['2']!.inputBg).not.toBe(BASE_DARK.inputBg);

    const lightScopes = resolveSurfaceScopes('default', 'light');
    expect(lightScopes['3']!.inputBg).not.toBe(BASE_LIGHT.inputBg);
  });
});

describe('isPresetAllowedForMode', () => {
  it('allows default for both modes', () => {
    expect(isPresetAllowedForMode('default', 'light')).toBe(true);
    expect(isPresetAllowedForMode('default', 'dark')).toBe(true);
  });

  it('restricts black to dark only', () => {
    expect(isPresetAllowedForMode('black', 'light')).toBe(false);
    expect(isPresetAllowedForMode('black', 'dark')).toBe(true);
  });

  it('restricts white to light only', () => {
    expect(isPresetAllowedForMode('white', 'light')).toBe(true);
    expect(isPresetAllowedForMode('white', 'dark')).toBe(false);
  });
});
