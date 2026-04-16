/**
 * OKLCH color math utilities for the design token pipeline.
 * Uses culori for accurate color space conversions and gamut mapping.
 */

import { oklch, formatHex, formatHex8, wcagContrast, displayable, toGamut, parse } from 'culori';
import type { Oklch } from 'culori';

export interface OklchColor {
  L: number;  // 0–1
  C: number;  // 0–0.4+
  H: number;  // 0–360
  alpha?: number; // 0–1
}

/** Parse an OKLCH string "L C H" or "L C H / A" into components. */
export function parseOklchString(value: string): OklchColor {
  const parts = value.trim().split(/\s*\/\s*/);
  const [lStr, cStr, hStr] = parts[0].trim().split(/\s+/);
  const alpha = parts[1] ? parseFloat(parts[1]) : undefined;
  return {
    L: parseFloat(lStr),
    C: parseFloat(cStr),
    H: parseFloat(hStr) || 0,
    alpha,
  };
}

/** Format an OKLCH color to the canonical string "L C H" or "L C H / A". */
export function formatOklchString(color: OklchColor): string {
  const l = roundTo(color.L, 3);
  const c = roundTo(color.C, 4);
  const h = roundTo(color.H, 1);
  const base = `${l} ${c} ${h}`;
  if (color.alpha !== undefined && color.alpha < 1) {
    return `${base} / ${roundTo(color.alpha, 2)}`;
  }
  return base;
}

/** Parse an HSL triplet string "H S% L%" into components. */
export function parseHslString(value: string): { h: number; s: number; l: number } {
  const parts = value.trim().split(/\s+/);
  return {
    h: parseFloat(parts[0]),
    s: parseFloat(parts[1]),  // includes % but parseFloat ignores it
    l: parseFloat(parts[2]),
  };
}

/** Convert an HSL triplet string to an OKLCH string. */
export function hslStringToOklchString(hslValue: string): string {
  const { h, s, l } = parseHslString(hslValue);
  const color = oklch(parse(`hsl(${h}, ${s}%, ${l}%)`));
  if (!color) throw new Error(`Failed to convert HSL: ${hslValue}`);
  return formatOklchString({
    L: color.l,
    C: color.c,
    H: color.h ?? 0,
  });
}

/** Convert an OKLCH string to hex (#RRGGBB or #RRGGBBAA). */
export function oklchStringToHex(oklchValue: string): string {
  const parsed = parseOklchString(oklchValue);
  const color: Oklch = {
    mode: 'oklch',
    l: parsed.L,
    c: parsed.C,
    h: parsed.H,
    alpha: parsed.alpha,
  };

  // Gamut-map to sRGB for hex output
  const clamped = toGamut('rgb')(color);

  if (parsed.alpha !== undefined && parsed.alpha < 1) {
    return formatHex8({ ...clamped, alpha: parsed.alpha });
  }
  return formatHex(clamped);
}

/** Check if an OKLCH color is within the sRGB gamut. */
export function isInSrgbGamut(oklchValue: string): boolean {
  const parsed = parseOklchString(oklchValue);
  return displayable({
    mode: 'oklch',
    l: parsed.L,
    c: parsed.C,
    h: parsed.H,
  });
}

/** Compute WCAG 2.x contrast ratio between two OKLCH strings. */
export function contrastRatio(oklch1: string, oklch2: string): number {
  const c1 = parseOklchToCulori(oklch1);
  const c2 = parseOklchToCulori(oklch2);
  return wcagContrast(c1, c2);
}

function parseOklchToCulori(value: string): Oklch {
  const parsed = parseOklchString(value);
  return {
    mode: 'oklch',
    l: parsed.L,
    c: parsed.C,
    h: parsed.H,
    alpha: parsed.alpha,
  };
}

function roundTo(n: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}
