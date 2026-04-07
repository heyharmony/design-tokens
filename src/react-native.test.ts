import { describe, it, expect } from 'vitest';
import { resolveTheme } from './react-native.js';
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
