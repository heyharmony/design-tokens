/**
 * Generates CSS files from the token source data.
 * Outputs:
 *   dist/css/variables-light.css   — :root { all 44 base tokens }
 *   dist/css/variables-dark.css    — .dark { all 44 base tokens }
 *   dist/css/presets/<id>-<mode>.css — [data-theme-preset='<id>'] overrides
 */

import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { BASE_LIGHT, BASE_DARK, PRESET_OVERRIDES, THEME_PRESET_IDS } from '../src/tokens.js';
import type { ThemeColors, ThemePresetId } from '../src/types.js';

const DIST = join(import.meta.dirname, '..', 'dist', 'css');
const PRESETS_DIR = join(DIST, 'presets');

mkdirSync(PRESETS_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Token key → CSS variable name mapping
// ---------------------------------------------------------------------------

const TOKEN_TO_CSS: Record<keyof ThemeColors, string> = {
  surface0: '--harmony-surface-0',
  surface1: '--harmony-surface-1',
  surface2: '--harmony-surface-2',
  surface2Hover: '--harmony-surface-2-hover',
  surface3: '--harmony-surface-3',
  surface4: '--harmony-surface-4',
  fg: '--harmony-fg',
  fgSecondary: '--harmony-fg-secondary',
  fgTertiary: '--harmony-fg-tertiary',
  fgDisabled: '--harmony-fg-disabled',
  fgInverse: '--harmony-fg-inverse',
  fgLink: '--harmony-fg-link',
  fgSuccess: '--harmony-fg-success',
  fgWarning: '--harmony-fg-warning',
  fgError: '--harmony-fg-error',
  borderSubtle: '--harmony-border-subtle',
  borderDefault: '--harmony-border-default',
  accent: '--accent',
  accentForeground: '--accent-foreground',
  accentHover: '--accent-hover',
  sidebarAccent: '--sidebar-accent',
  sidebarAccentForeground: '--sidebar-accent-foreground',
  sidebarHover: '--sidebar-hover',
  tabBg: '--harmony-tab-bg',
  tabBgHover: '--harmony-tab-bg-hover',
  tabOutline: '--harmony-tab-outline',
  inputBg: '--harmony-input-bg',
  inputBorder: '--harmony-input-border',
  inputBorderHover: '--harmony-input-border-hover',
  inputBorderFocus: '--harmony-input-border-focus',
  inputBorderError: '--harmony-input-border-error',
  inputBgDisabled: '--harmony-input-bg-disabled',
  inputPlaceholder: '--harmony-input-placeholder',
};

const EXTENDED_CSS: Record<string, string> = {
  background: '--background',
  panelBackground: '--panel-bg',
  mainPanelBackground: '--main-panel-bg',
  ring: '--ring',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatVars(tokens: Record<string, string>, indent = '  '): string {
  return Object.entries(tokens)
    .map(([prop, value]) => `${indent}${prop}: ${value};`)
    .join('\n');
}

function baseToVars(base: ThemeColors): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, cssVar] of Object.entries(TOKEN_TO_CSS)) {
    vars[cssVar] = base[key as keyof ThemeColors];
  }
  return vars;
}

function overridesToVars(overrides: Record<string, string>): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(overrides)) {
    const cssVar = TOKEN_TO_CSS[key as keyof ThemeColors] ?? EXTENDED_CSS[key];
    if (cssVar) {
      vars[cssVar] = value;
    }
  }
  return vars;
}

// ---------------------------------------------------------------------------
// Generate base CSS files
// ---------------------------------------------------------------------------

const lightCss = `/* @harmony/design-tokens — light mode base tokens */\n:root {\n${formatVars(baseToVars(BASE_LIGHT))}\n}\n`;
writeFileSync(join(DIST, 'variables-light.css'), lightCss);

const darkCss = `/* @harmony/design-tokens — dark mode base tokens */\n.dark {\n${formatVars(baseToVars(BASE_DARK))}\n}\n`;
writeFileSync(join(DIST, 'variables-dark.css'), darkCss);

// ---------------------------------------------------------------------------
// Generate preset override CSS files
// ---------------------------------------------------------------------------

for (const id of THEME_PRESET_IDS) {
  const preset = PRESET_OVERRIDES[id];

  if (preset.light && Object.keys(preset.light).length > 0) {
    const vars = overridesToVars(preset.light as Record<string, string>);
    const selector = `[data-theme-preset='${id}']`;
    const css = `/* @harmony/design-tokens — ${id} preset, light mode */\n${selector} {\n${formatVars(vars)}\n}\n`;
    writeFileSync(join(PRESETS_DIR, `${id}-light.css`), css);
  }

  if (preset.dark && Object.keys(preset.dark).length > 0) {
    const vars = overridesToVars(preset.dark as Record<string, string>);
    const selector = `.dark[data-theme-preset='${id}']`;
    const css = `/* @harmony/design-tokens — ${id} preset, dark mode */\n${selector} {\n${formatVars(vars)}\n}\n`;
    writeFileSync(join(PRESETS_DIR, `${id}-dark.css`), css);
  }
}

console.log('CSS generated successfully in dist/css/');
