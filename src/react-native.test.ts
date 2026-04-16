import { describe, it, expect } from 'vitest';
import { resolveTheme, resolveThemeForSurface } from './react-native.js';
import { THEME_PRESET_IDS } from './tokens.js';
import type { ThemeColors } from './types.js';
import { BASE_LIGHT } from './tokens.js';

const ALL_KEYS = Object.keys(BASE_LIGHT) as (keyof ThemeColors)[];

/** Hex color: #RRGGBB or #RRGGBBAA */
const HEX_REGEX = /^#[0-9a-f]{6,8}$/i;

describe('React Native resolveTheme', () => {
  it('wraps all values as hex strings', () => {
    for (const preset of THEME_PRESET_IDS) {
      for (const mode of ['light', 'dark'] as const) {
        const colors = resolveTheme(preset, mode);
        for (const key of ALL_KEYS) {
          expect(colors[key], `${preset}/${mode}/${key}: "${colors[key]}"`).toMatch(HEX_REGEX);
        }
      }
    }
  });

  it('returns hex strings for default light', () => {
    const colors = resolveTheme('default', 'light');
    expect(colors.surface0).toMatch(/^#[0-9a-f]{6}$/i);
    expect(colors.fg).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('includes new accent tokens as hex', () => {
    const colors = resolveTheme('default', 'light');
    expect(colors.accentActive).toMatch(HEX_REGEX);
    expect(colors.accentSubtle).toMatch(HEX_REGEX);
    expect(colors.accentMuted).toMatch(HEX_REGEX);
    expect(colors.accentBorder).toMatch(HEX_REGEX);
  });

  it('includes semantic tokens as hex', () => {
    const colors = resolveTheme('default', 'light');
    expect(colors.bgSuccess).toMatch(HEX_REGEX);
    expect(colors.bgWarning).toMatch(HEX_REGEX);
    expect(colors.bgError).toMatch(HEX_REGEX);
    expect(colors.borderSuccess).toMatch(HEX_REGEX);
  });
});

describe('React Native resolveThemeForSurface', () => {
  it('overrides input tokens for surface 2 dark', () => {
    const base = resolveTheme('default', 'dark');
    const surfaced = resolveThemeForSurface('default', 'dark', '2');
    // inputBg should differ from base
    expect(surfaced.inputBg).not.toBe(base.inputBg);
    // Should be hex format
    expect(surfaced.inputBg).toMatch(HEX_REGEX);
    // Non-contextual tokens should remain unchanged
    expect(surfaced.fg).toBe(base.fg);
    expect(surfaced.accent).toBe(base.accent);
  });

  it('overrides input tokens for surface 3 light', () => {
    const base = resolveTheme('default', 'light');
    const surfaced = resolveThemeForSurface('default', 'light', '3');
    expect(surfaced.inputBg).not.toBe(base.inputBg);
    expect(surfaced.inputBg).toMatch(HEX_REGEX);
  });

  it('applies ocean preset surface scopes as hex', () => {
    const base = resolveTheme('ocean', 'dark');
    const surfaced = resolveThemeForSurface('ocean', 'dark', '2');
    expect(surfaced.inputBg).not.toBe(base.inputBg);
    expect(surfaced.inputBg).toMatch(HEX_REGEX);
  });
});
