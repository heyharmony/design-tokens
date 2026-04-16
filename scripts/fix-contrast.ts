/**
 * Fix contrast issues identified by the audit.
 * Adjusts fg token values to meet WCAG AA thresholds.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const TOKENS_DIR = join(import.meta.dirname, '..', 'tokens');

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, 'utf-8'));
}
function writeJson(path: string, data: unknown): void {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

// Fix base light.json
const lightPath = join(TOKENS_DIR, 'base', 'light.json');
const light = readJson(lightPath);
const lh = (light as Record<string, unknown>).harmony as Record<string, unknown>;
const lfg = lh.fg as Record<string, unknown>;

// fgSecondary: darken from ~45% to ~40% (OKLCH ~0.53 -> 0.48)
(lfg.secondary as Record<string, unknown>).$value = '0.48 0 0';
// fgTertiary: darken from ~56% to ~50% (OKLCH ~0.65 -> 0.58)
(lfg.tertiary as Record<string, unknown>).$value = '0.58 0 0';
// fgDisabled: darken from ~70% to ~60% (OKLCH ~0.77 -> 0.68)
(lfg.disabled as Record<string, unknown>).$value = '0.68 0 0';
// fgWarning: darken for better contrast (OKLCH L ~0.61 -> 0.55)
(lfg.warning as Record<string, unknown>).$value = '0.55 0.16 75';

writeJson(lightPath, light);

// Fix base dark.json
const darkPath = join(TOKENS_DIR, 'base', 'dark.json');
const dark = readJson(darkPath);
const dh = (dark as Record<string, unknown>).harmony as Record<string, unknown>;
const dfg = dh.fg as Record<string, unknown>;

// fgDisabled: lighten for better contrast on dark surfaces (0.42 -> 0.48)
(dfg.disabled as Record<string, unknown>).$value = '0.48 0 0';
// fgTertiary: lighten slightly (0.555 -> 0.56) - mostly fine
(dfg.tertiary as Record<string, unknown>).$value = '0.56 0 0';
// fgError: lighten for dark mode (0.505 -> 0.56)
(dfg.error as Record<string, unknown>).$value = '0.56 0.19 25.4';

writeJson(darkPath, dark);

// Fix sidebar accent contrast in colored presets
for (const [preset, lightness] of [
  ['forest', '0.55'],
  ['ayu', '0.62'],
  ['sand', '0.5'],
] as const) {
  const path = join(TOKENS_DIR, 'presets', `${preset}.json`);
  const json = readJson(path);

  // Fix light mode sidebar accent — darken for white text contrast
  const lightObj = (json as Record<string, unknown>).light as Record<string, unknown> | undefined;
  if (lightObj?.sidebar && typeof lightObj.sidebar === 'object') {
    const sidebar = lightObj.sidebar as Record<string, unknown>;
    if (sidebar.accent && typeof sidebar.accent === 'object') {
      const token = sidebar.accent as Record<string, unknown>;
      const current = (token.$value as string).split(' ');
      // Lower the lightness to improve contrast with white text
      current[0] = lightness;
      token.$value = current.join(' ');
    }
  }

  writeJson(path, json);
}

console.log('Contrast fixes applied.');
