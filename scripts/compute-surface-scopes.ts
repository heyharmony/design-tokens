/**
 * Algorithmic surface scope computation.
 * Derives per-surface-level contextual tokens (input, tab, border) from
 * the base surface color and a derivation config. Eliminates the need
 * to hand-author 160+ values per preset.
 *
 * Exported for use in generate.ts.
 */

import { parseOklchString, formatOklchString, type OklchColor } from './color-utils.js';

export interface ScopeDerivationConfig {
  inputBg: { lOffset: number };
  inputBorder: { lOffset: number };
  inputBorderHover: { lOffset: number };
  inputBorderFocus: { strategy: 'accent' };  // always use accent/ring
  inputBorderError: { value: string };        // fixed red for errors
  inputBorderActive: { lOffset: number };
  inputBorderHighlight: { lOffset: number; cBoost: number };
  inputBgActive: { lOffset: number };
  inputBgHighlight: { lOffset: number; cBoost: number };
  inputBgDisabled: { lOffset: number };
  inputPlaceholder: { value: string };  // fixed across levels
  tabBg: { lOffset: number };
  tabBgHover: { lOffset: number };
  tabOutline: { lOffset: number };
  borderSubtle: { lOffset: number };
  borderDefault: { lOffset: number };
}

const LIGHT_CONFIG: ScopeDerivationConfig = {
  inputBg:              { lOffset: +0.06 },    // lighter than surface
  inputBorder:          { lOffset: -0.05 },
  inputBorderHover:     { lOffset: -0.12 },
  inputBorderFocus:     { strategy: 'accent' },
  inputBorderError:     { value: '0.636 0.2082 25.4' },
  inputBorderActive:    { lOffset: -0.17 },
  inputBorderHighlight: { lOffset: -0.12, cBoost: 0.005 },
  inputBgActive:        { lOffset: +0.03 },
  inputBgHighlight:     { lOffset: +0.03, cBoost: 0.005 },
  inputBgDisabled:      { lOffset: +0.02 },
  inputPlaceholder:     { value: '0.649 0 0' },
  tabBg:                { lOffset: -0.04 },
  tabBgHover:           { lOffset: -0.07 },
  tabOutline:           { lOffset: -0.12 },
  borderSubtle:         { lOffset: -0.04 },
  borderDefault:        { lOffset: -0.1 },
};

const DARK_CONFIG: ScopeDerivationConfig = {
  inputBg:              { lOffset: +0.03 },    // slightly lighter than surface
  inputBorder:          { lOffset: +0.07 },
  inputBorderHover:     { lOffset: +0.12 },
  inputBorderFocus:     { strategy: 'accent' },
  inputBorderError:     { value: '0.505 0.1847 25.4' },
  inputBorderActive:    { lOffset: +0.16 },
  inputBorderHighlight: { lOffset: +0.14, cBoost: 0.003 },
  inputBgActive:        { lOffset: +0.05 },
  inputBgHighlight:     { lOffset: +0.04, cBoost: 0.003 },
  inputBgDisabled:      { lOffset: -0.03 },
  inputPlaceholder:     { value: '0.555 0 0' },
  tabBg:                { lOffset: +0.04 },
  tabBgHover:           { lOffset: +0.08 },
  tabOutline:           { lOffset: +0.1 },
  borderSubtle:         { lOffset: +0.03 },
  borderDefault:        { lOffset: +0.07 },
};

type FlatScope = Record<string, string>;

/** Accents at or below this chroma are treated as achromatic for focus derivation. */
const ACHROMATIC_EPS = 0.02;

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function deriveScopeForLevel(
  surfaceValue: string,
  accentValue: string,
  config: ScopeDerivationConfig,
  mode: 'light' | 'dark',
): FlatScope {
  const surface = parseOklchString(surfaceValue);
  const accent = parseOklchString(accentValue);

  function offset(cfg: { lOffset: number; cBoost?: number }): string {
    const color: OklchColor = {
      L: clamp(surface.L + cfg.lOffset, 0, 1),
      C: surface.C + (cfg.cBoost ?? 0),
      H: surface.H,
    };
    return formatOklchString(color);
  }

  const inputBorderHoverStr = offset(config.inputBorderHover);
  const hoverParsed = parseOklchString(inputBorderHoverStr);

  let focusColor: OklchColor;
  if (mode === 'dark' && accent.C < ACHROMATIC_EPS) {
    // Avoid OKLCH "gray + forced chroma" (reads brown/red at hue 0): neutral, brighter than hover.
    let L = clamp(hoverParsed.L + 0.055, 0.38, 0.75);
    focusColor = { L, C: 0, H: 0 };
    let focusStr = formatOklchString(focusColor);
    while (focusStr === inputBorderHoverStr && L < 0.92) {
      L = clamp(L + 0.01, 0.38, 0.92);
      focusColor.L = L;
      focusStr = formatOklchString(focusColor);
    }
  } else {
    // Focus border uses accent color at medium lightness
    focusColor = {
      L: clamp(accent.L, 0.35, 0.65),
      C: Math.max(0.08, accent.C),
      H: accent.H,
    };
  }

  return {
    inputBg: offset(config.inputBg),
    inputBorder: offset(config.inputBorder),
    inputBorderHover: inputBorderHoverStr,
    inputBorderFocus: formatOklchString(focusColor),
    inputBorderError: config.inputBorderError.value,
    inputBorderActive: offset(config.inputBorderActive),
    inputBorderHighlight: offset(config.inputBorderHighlight),
    inputBgActive: offset(config.inputBgActive),
    inputBgHighlight: offset(config.inputBgHighlight),
    inputBgDisabled: offset(config.inputBgDisabled),
    inputPlaceholder: config.inputPlaceholder.value,
    tabBg: offset(config.tabBg),
    tabBgHover: offset(config.tabBgHover),
    tabOutline: offset(config.tabOutline),
    borderSubtle: offset(config.borderSubtle),
    borderDefault: offset(config.borderDefault),
  };
}

/**
 * Compute all surface scopes for a mode from the resolved surface values and accent.
 * @param surfaces - map of surface level ("0"-"4") to their OKLCH value
 * @param accent - the ring/accent OKLCH value for focus borders
 * @param mode - 'light' or 'dark'
 */
export function computeSurfaceScopes(
  surfaces: Record<string, string>,
  accent: string,
  mode: 'light' | 'dark',
): Record<string, FlatScope> {
  const config = mode === 'light' ? LIGHT_CONFIG : DARK_CONFIG;
  const result: Record<string, FlatScope> = {};

  for (const [level, surfaceValue] of Object.entries(surfaces)) {
    result[level] = deriveScopeForLevel(surfaceValue, accent, config, mode);
  }

  return result;
}

export { LIGHT_CONFIG, DARK_CONFIG };
