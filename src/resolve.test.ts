import { describe, it, expect } from 'vitest';
import { resolveTheme, resolveThemeExtended, resolveSurfaceScopes, isPresetAllowedForMode } from './resolve.js';
import { THEME_PRESET_IDS, BASE_LIGHT, BASE_DARK, SURFACE_SCOPES_LIGHT, SURFACE_SCOPES_DARK } from './tokens.js';
import type { ThemeColors, ThemePresetId } from './types.js';

const ALL_KEYS = Object.keys(BASE_LIGHT) as (keyof ThemeColors)[];

describe('resolveTheme', () => {
  it('returns all 34 token keys for every preset/mode combination', () => {
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

  it('returns base values for default preset', () => {
    expect(resolveTheme('default', 'light')).toEqual(BASE_LIGHT);
    expect(resolveTheme('default', 'dark')).toEqual(BASE_DARK);
  });

  it('applies ocean light overrides correctly', () => {
    const colors = resolveTheme('ocean', 'light');
    expect(colors.surface0).toBe('210 100% 97%');
    expect(colors.surface1).toBe('210 50% 99%');
    expect(colors.accent).toBe('210 100% 94%');
    expect(colors.sidebarAccent).toBe('210 100% 50%');
    // Non-overridden tokens should fall back to base
    expect(colors.fg).toBe(BASE_LIGHT.fg);
    expect(colors.inputBg).toBe(BASE_LIGHT.inputBg);
  });

  it('applies ocean dark overrides correctly', () => {
    const colors = resolveTheme('ocean', 'dark');
    expect(colors.surface0).toBe('210 60% 5%');
    expect(colors.accent).toBe('210 80% 12%');
    expect(colors.fg).toBe(BASE_DARK.fg);
  });

  it('applies black preset overrides (dark only)', () => {
    const colors = resolveTheme('black', 'dark');
    expect(colors.surface0).toBe('0 0% 2.7%');
    expect(colors.fg).toBe('0 0% 85%');
    expect(colors.inputBg).toBe('0 0% 7%');
    // Light should be unchanged base
    expect(resolveTheme('black', 'light')).toEqual(BASE_LIGHT);
  });

  it('applies white preset overrides (light only)', () => {
    const colors = resolveTheme('white', 'light');
    expect(colors.surface0).toBe('0 0% 95%');
    expect(colors.surface1).toBe('0 0% 100%');
    // Dark should be unchanged base
    expect(resolveTheme('white', 'dark')).toEqual(BASE_DARK);
  });

  it('doodles only overrides surface0/surface1 in dark', () => {
    const colors = resolveTheme('doodles', 'dark');
    expect(colors.surface0).toBe('0 0% 10%');
    expect(colors.surface1).toBe('0 0% 10%');
    expect(colors.fg).toBe(BASE_DARK.fg);
  });
});

describe('resolveThemeExtended', () => {
  it('includes extended tokens for ocean preset', () => {
    const colors = resolveThemeExtended('ocean', 'light');
    expect(colors.background).toBe('210 100% 97%');
    expect(colors.panelBackground).toBe('210 50% 99%');
    expect(colors.ring).toBe('210 100% 50%');
  });

  it('does not have extended tokens for default preset', () => {
    const colors = resolveThemeExtended('default', 'light');
    expect(colors.background).toBeUndefined();
    expect(colors.panelBackground).toBeUndefined();
  });
});

describe('resolveSurfaceScopes', () => {
  it('returns base scopes for default preset', () => {
    expect(resolveSurfaceScopes('default', 'light')).toEqual(SURFACE_SCOPES_LIGHT);
    expect(resolveSurfaceScopes('default', 'dark')).toEqual(SURFACE_SCOPES_DARK);
  });

  it('returns base scopes for presets without surface scope overrides', () => {
    expect(resolveSurfaceScopes('ocean', 'light')).toEqual(SURFACE_SCOPES_LIGHT);
    expect(resolveSurfaceScopes('ocean', 'dark')).toEqual(SURFACE_SCOPES_DARK);
  });

  it('merges black preset surface scopes over base dark scopes', () => {
    const scopes = resolveSurfaceScopes('black', 'dark');
    // Black preset has custom surface scopes for dark mode
    expect(scopes['2']).toBeDefined();
    expect(scopes['2']!.inputBg).toBe('0 0% 13%'); // black override, not base '0 0% 22%'
    expect(scopes['4']).toBeDefined();
    expect(scopes['4']!.inputBg).toBe('0 0% 16%'); // black override, not base '0 0% 24%'
  });

  it('returns base scopes for black preset in light mode (no light overrides)', () => {
    expect(resolveSurfaceScopes('black', 'light')).toEqual(SURFACE_SCOPES_LIGHT);
  });

  it('merges white preset surface scopes over base light scopes', () => {
    const scopes = resolveSurfaceScopes('white', 'light');
    // White preset adds surface 1 which base doesn't have
    expect(scopes['1']).toBeDefined();
    expect(scopes['1']!.inputBg).toBe('0 0% 96%');
    // Also has surface 3 and 4
    expect(scopes['3']).toBeDefined();
    expect(scopes['4']).toBeDefined();
  });

  it('surface scoped values differ from flat defaults for overridden surfaces', () => {
    const darkScopes = resolveSurfaceScopes('default', 'dark');
    // surface2 dark: inputBg should be lifted above 18% L surface
    expect(darkScopes['2']!.inputBg).not.toBe(BASE_DARK.inputBg);

    const lightScopes = resolveSurfaceScopes('default', 'light');
    // surface3 light: inputBg should differ from flat 100% L
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

  it('allows colored presets for both modes', () => {
    for (const preset of ['ocean', 'forest', 'berry'] as ThemePresetId[]) {
      expect(isPresetAllowedForMode(preset, 'light')).toBe(true);
      expect(isPresetAllowedForMode(preset, 'dark')).toBe(true);
    }
  });
});
