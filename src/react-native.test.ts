import { describe, it, expect } from 'vitest';
import { resolveTheme, resolveThemeForSurface } from './react-native.js';
import { THEME_PRESET_IDS } from './tokens.js';
import type { ThemeColors } from './types.js';
import { BASE_LIGHT } from './tokens.js';

const ALL_KEYS = Object.keys(BASE_LIGHT) as (keyof ThemeColors)[];

describe('React Native resolveTheme', () => {
  it('wraps all values in hsl() function syntax', () => {
    for (const preset of THEME_PRESET_IDS) {
      for (const mode of ['light', 'dark'] as const) {
        const colors = resolveTheme(preset, mode);
        for (const key of ALL_KEYS) {
          expect(colors[key], `${preset}/${mode}/${key}`).toMatch(/^hsl\(\d+,\s+\d+(\.\d+)?%,\s+\d+(\.\d+)?%\)$/);
        }
      }
    }
  });

  it('converts default light surface0 correctly', () => {
    const colors = resolveTheme('default', 'light');
    expect(colors.surface0).toBe('hsl(40, 10%, 94.1%)');
    expect(colors.fg).toBe('hsl(0, 0%, 3.9%)');
  });

  it('converts ocean dark accent correctly', () => {
    const colors = resolveTheme('ocean', 'dark');
    expect(colors.accent).toBe('hsl(210, 80%, 12%)');
  });
});

describe('React Native resolveThemeForSurface', () => {
  it('returns base theme for surface 0 (no overrides)', () => {
    const base = resolveTheme('default', 'dark');
    const surfaced = resolveThemeForSurface('default', 'dark', '0');
    expect(surfaced).toEqual(base);
  });

  it('overrides input tokens for surface 2 dark', () => {
    const base = resolveTheme('default', 'dark');
    const surfaced = resolveThemeForSurface('default', 'dark', '2');
    // inputBg should differ from base
    expect(surfaced.inputBg).not.toBe(base.inputBg);
    // Should be in hsl() format
    expect(surfaced.inputBg).toMatch(/^hsl\(/);
    // Non-contextual tokens should remain unchanged
    expect(surfaced.fg).toBe(base.fg);
    expect(surfaced.accent).toBe(base.accent);
  });

  it('overrides input tokens for surface 3 light', () => {
    const base = resolveTheme('default', 'light');
    const surfaced = resolveThemeForSurface('default', 'light', '3');
    expect(surfaced.inputBg).not.toBe(base.inputBg);
    expect(surfaced.inputBg).toMatch(/^hsl\(/);
  });

  it('applies black preset surface scopes', () => {
    const base = resolveTheme('black', 'dark');
    const surfaced = resolveThemeForSurface('black', 'dark', '2');
    expect(surfaced.inputBg).not.toBe(base.inputBg);
    expect(surfaced.inputBg).toBe('hsl(0, 0%, 13%)');
  });
});
