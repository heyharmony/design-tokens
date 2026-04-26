/**
 * Generates CSS files from the token source data.
 * Outputs:
 *   dist/css/variables-light.css   — :root { all 48 base tokens }
 *   dist/css/variables-dark.css    — .dark { all 48 base tokens }
 *   dist/css/presets/<id>-<mode>.css — [data-theme-preset='<id>'] overrides
 */

import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { BASE_LIGHT, BASE_DARK, PRESET_OVERRIDES, THEME_PRESET_IDS, SURFACE_SCOPES_LIGHT, SURFACE_SCOPES_DARK, TOKEN_TO_CSS, EXTENDED_CSS, SHADOWS_LIGHT, SHADOWS_DARK, SHADOW_TO_CSS, SPACING, BORDER_RADIUS, SPACING_TO_CSS, RADIUS_TO_CSS } from '../src/tokens.js';
import type { ThemeSpacing, ThemeBorderRadius } from '../src/types.js';
import type { ThemeColors, ThemeShadows, ThemePresetId, SurfaceScopes, SurfaceLevel } from '../src/types.js';

const DIST = join(import.meta.dirname, '..', 'dist', 'css');
const PRESETS_DIR = join(DIST, 'presets');

mkdirSync(PRESETS_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wrap a raw OKLCH triplet as a CSS oklch() function value. */
function formatCssValue(raw: string): string {
  // Handle alpha: "L C H / A" → oklch(L C H / A)
  return `oklch(${raw})`;
}

function formatVars(tokens: Record<string, string>, indent = '  '): string {
  return Object.entries(tokens)
    .map(([prop, value]) => `${indent}${prop}: ${formatCssValue(value)};`)
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

function shadowToVars(shadows: ThemeShadows): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, cssVar] of Object.entries(SHADOW_TO_CSS)) {
    vars[cssVar] = shadows[key as keyof ThemeShadows];
  }
  return vars;
}

/** Format shadow vars WITHOUT oklch() wrapping (shadow values already contain oklch). */
function formatRawVars(tokens: Record<string, string>, indent = '  '): string {
  return Object.entries(tokens)
    .map(([prop, value]) => `${indent}${prop}: ${value};`)
    .join('\n');
}

// ---------------------------------------------------------------------------
// Generate base CSS files
// ---------------------------------------------------------------------------

const lightColorVars = formatVars(baseToVars(BASE_LIGHT));
const lightShadowVars = formatRawVars(shadowToVars(SHADOWS_LIGHT));
const lightCss = `/* @heyharmony/design-tokens — light mode base tokens */\n:root {\n${lightColorVars}\n${lightShadowVars}\n}\n`;
writeFileSync(join(DIST, 'variables-light.css'), lightCss);

const darkColorVars = formatVars(baseToVars(BASE_DARK));
const darkShadowVars = formatRawVars(shadowToVars(SHADOWS_DARK));
const darkCss = `/* @heyharmony/design-tokens — dark mode base tokens */\n.dark {\n${darkColorVars}\n${darkShadowVars}\n}\n`;
writeFileSync(join(DIST, 'variables-dark.css'), darkCss);

// ---------------------------------------------------------------------------
// Generate preset override CSS files
// ---------------------------------------------------------------------------

for (const id of THEME_PRESET_IDS) {
  const preset = PRESET_OVERRIDES[id];

  if (preset.light && Object.keys(preset.light).length > 0) {
    const vars = overridesToVars(preset.light as Record<string, string>);
    const selector = `[data-theme-preset='${id}']`;
    const css = `/* @heyharmony/design-tokens — ${id} preset, light mode */\n${selector} {\n${formatVars(vars)}\n}\n`;
    writeFileSync(join(PRESETS_DIR, `${id}-light.css`), css);
  }

  if (preset.dark && Object.keys(preset.dark).length > 0) {
    const vars = overridesToVars(preset.dark as Record<string, string>);
    const selector = `.dark[data-theme-preset='${id}']`;
    const css = `/* @heyharmony/design-tokens — ${id} preset, dark mode */\n${selector} {\n${formatVars(vars)}\n}\n`;
    writeFileSync(join(PRESETS_DIR, `${id}-dark.css`), css);
  }
}

// ---------------------------------------------------------------------------
// Generate surface scope CSS files
// ---------------------------------------------------------------------------

function scopeToVars(scope: Partial<Pick<ThemeColors, string>>): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(scope)) {
    const cssVar = TOKEN_TO_CSS[key as keyof ThemeColors];
    if (cssVar) vars[cssVar] = value;
  }
  return vars;
}

function generateSurfaceScopeCss(
  scopes: SurfaceScopes,
  selectorPrefix: string,
  comment: string,
): string {
  const blocks: string[] = [`/* @heyharmony/design-tokens — ${comment} */`];
  for (const [level, scope] of Object.entries(scopes) as [SurfaceLevel, Partial<Pick<ThemeColors, string>>][]) {
    if (!scope || Object.keys(scope).length === 0) continue;
    const vars = scopeToVars(scope);
    const selector = selectorPrefix
      ? `${selectorPrefix} [data-surface="${level}"]`
      : `[data-surface="${level}"]`;
    blocks.push(`${selector} {\n${formatVars(vars)}\n}`);
  }
  return blocks.join('\n') + '\n';
}

// Base surface scopes
const surfaceLightCss = generateSurfaceScopeCss(
  SURFACE_SCOPES_LIGHT,
  '',
  'surface scopes, light mode',
);
writeFileSync(join(DIST, 'surface-scopes-light.css'), surfaceLightCss);

const surfaceDarkCss = generateSurfaceScopeCss(
  SURFACE_SCOPES_DARK,
  '.dark',
  'surface scopes, dark mode',
);
writeFileSync(join(DIST, 'surface-scopes-dark.css'), surfaceDarkCss);

// Preset-specific surface scopes
for (const id of THEME_PRESET_IDS) {
  const preset = PRESET_OVERRIDES[id];

  if (preset.surfaceScopesLight && Object.keys(preset.surfaceScopesLight).length > 0) {
    const css = generateSurfaceScopeCss(
      preset.surfaceScopesLight,
      `[data-theme-preset='${id}']`,
      `${id} preset surface scopes, light mode`,
    );
    writeFileSync(join(PRESETS_DIR, `${id}-surface-scopes-light.css`), css);
  }

  if (preset.surfaceScopesDark && Object.keys(preset.surfaceScopesDark).length > 0) {
    const css = generateSurfaceScopeCss(
      preset.surfaceScopesDark,
      `.dark[data-theme-preset='${id}']`,
      `${id} preset surface scopes, dark mode`,
    );
    writeFileSync(join(PRESETS_DIR, `${id}-surface-scopes-dark.css`), css);
  }
}

// ---------------------------------------------------------------------------
// Generate layout CSS (spacing + border-radius) — universal, no mode scoping
// ---------------------------------------------------------------------------

function layoutToVars(): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, cssVar] of Object.entries(SPACING_TO_CSS)) {
    vars[cssVar] = SPACING[key as keyof ThemeSpacing];
  }
  for (const [key, cssVar] of Object.entries(RADIUS_TO_CSS)) {
    vars[cssVar] = BORDER_RADIUS[key as keyof ThemeBorderRadius];
  }
  return vars;
}

const layoutVars = formatRawVars(layoutToVars());
const layoutCss = `/* @heyharmony/design-tokens — layout tokens (spacing & border-radius) */\n:root {\n${layoutVars}\n}\n`;
writeFileSync(join(DIST, 'layout.css'), layoutCss);

console.log('CSS generated successfully in dist/css/');
