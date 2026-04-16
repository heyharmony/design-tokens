/**
 * Token generator — reads W3C DTCG JSON files from tokens/ and produces:
 *   - src/types.ts  (ThemeColors, ThemePresetId, SurfaceContextualToken, etc.)
 *   - src/tokens.ts (BASE_LIGHT, BASE_DARK, PRESET_OVERRIDES, SURFACE_SCOPES, THEME_PRESETS, etc.)
 *
 * Run: npm run generate
 * Check mode: npm run generate:check  (exits non-zero if generated files are stale)
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { oklchStringToHex } from './color-utils.js';

const ROOT = join(import.meta.dirname, '..');
const TOKENS_DIR = join(ROOT, 'tokens');
const SRC_DIR = join(ROOT, 'src');

const CHECK_MODE = process.argv.includes('--check');

// ---------------------------------------------------------------------------
// JSON helpers
// ---------------------------------------------------------------------------

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

/** Check if a value is a DTCG leaf token (has $value and $type). */
function isDtcgLeaf(obj: unknown): obj is { $value: string; $type: string } {
  return typeof obj === 'object' && obj !== null && '$value' in obj && '$type' in obj;
}

/**
 * Get object keys in a stable order that preserves the intended grouping.
 * JavaScript reorders integer-like keys ("0", "1", "2") before string keys,
 * which breaks the interleaved ordering like "0", "0-hover", "1", "1-hover".
 * This function restores the intended order by grouping by base number.
 */
function orderedKeys(obj: Record<string, unknown>): string[] {
  const keys = Object.keys(obj);
  const hasNumericKeys = keys.some((k) => /^\d+$/.test(k));
  if (!hasNumericKeys) return keys;

  // Re-sort: group by base number, then base key before variants
  return [...keys].sort((a, b) => {
    const aMatch = a.match(/^(\d+)/);
    const bMatch = b.match(/^(\d+)/);
    const aBase = aMatch ? parseInt(aMatch[1]) : 9999;
    const bBase = bMatch ? parseInt(bMatch[1]) : 9999;
    if (aBase !== bBase) return aBase - bBase;
    // Same base number: shorter key first (e.g., "0" before "0-hover")
    return a.length - b.length || a.localeCompare(b);
  });
}

/**
 * Flatten a nested DTCG object into a flat Record<camelCaseKey, value>.
 * Walks the tree, collecting path segments, then converts to camelCase key.
 * @param typeFilter - if provided, only include leaves with this $type
 */
function flattenDtcg(
  obj: Record<string, unknown>,
  parentPath: string[] = [],
  typeFilter?: string,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of orderedKeys(obj)) {
    const value = obj[key];
    if (key.startsWith('$')) continue; // skip $description, $type at group level, etc.
    if (isDtcgLeaf(value)) {
      if (typeFilter && value.$type !== typeFilter) continue;
      const camelKey = pathToCamelCase([...parentPath, key]);
      result[camelKey] = value.$value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenDtcg(value as Record<string, unknown>, [...parentPath, key], typeFilter));
    }
  }
  return result;
}

/**
 * Flatten a nested DTCG surface scope object.
 * Top-level keys are surface levels ("0"-"4"), each containing nested DTCG tokens.
 */
function flattenSurfaceScopes(
  obj: Record<string, unknown>,
): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};
  for (const [level, scopeObj] of Object.entries(obj)) {
    if (typeof scopeObj === 'object' && scopeObj !== null) {
      result[level] = flattenDtcg(scopeObj as Record<string, unknown>);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Naming conventions
// ---------------------------------------------------------------------------

/**
 * Convert a JSON path like ["surface", "0-hover"] to camelCase "surface0Hover".
 * Special cases:
 *   - "fg.default" → "fg" (drop "default" for fg)
 *   - "border.default" → "borderDefault" (keep for border)
 *   - "accent.default" → "accent" (drop "default" for accent)
 *   - "panel-background" → "panelBackground"
 *   - "main-panel-background" → "mainPanelBackground"
 */
function pathToCamelCase(path: string[]): string {
  // Handle top-level extended tokens (background, panel-background, etc.)
  if (path.length === 1) {
    return kebabToCamel(path[0]);
  }

  const group = path[0];
  const rest = path.slice(1);

  // Special: drop "default" suffix for certain groups
  if (rest.length === 1 && rest[0] === 'default') {
    if (group === 'fg' || group === 'accent') {
      return group;
    }
  }

  // Build camelCase: group + capitalized rest segments
  const segments = rest.map((seg) => kebabToCamel(seg));
  return group + segments.map(capitalize).join('');
}

function kebabToCamel(s: string): string {
  return s.replace(/-([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Convert camelCase key to CSS variable name using the --harmony- convention
 * with exceptions from css-vars.json.
 */
function camelToCssVar(
  key: string,
  overrides: Record<string, string>,
  extended: Record<string, string>,
): string {
  if (overrides[key]) return overrides[key];
  if (extended[key]) return extended[key];
  // Default: --harmony- prefix + camelCase to kebab
  const kebab = key.replace(/([A-Z0-9])/g, (m) => '-' + m.toLowerCase());
  return '--harmony-' + kebab;
}

// ---------------------------------------------------------------------------
// Read all source data
// ---------------------------------------------------------------------------

// Base tokens
const baseLightRaw = readJson(join(TOKENS_DIR, 'base', 'light.json')) as Record<string, unknown>;
const baseDarkRaw = readJson(join(TOKENS_DIR, 'base', 'dark.json')) as Record<string, unknown>;

const baseLight = flattenDtcg((baseLightRaw as { harmony: Record<string, unknown> }).harmony, [], 'color');
const baseDark = flattenDtcg((baseDarkRaw as { harmony: Record<string, unknown> }).harmony, [], 'color');

// Shadow tokens (separate type)
const baseLightShadows = flattenDtcg((baseLightRaw as { harmony: Record<string, unknown> }).harmony, [], 'shadow');
const baseDarkShadows = flattenDtcg((baseDarkRaw as { harmony: Record<string, unknown> }).harmony, [], 'shadow');
const shadowTokenKeys = Object.keys(baseLightShadows);

// Validate both bases have the same keys
// Use JSON key order (from light.json) as canonical order, sorted only for comparison
const baseLightKeysOrdered = Object.keys(baseLight);
const baseDarkKeysOrdered = Object.keys(baseDark);
const baseLightKeysSorted = [...baseLightKeysOrdered].sort();
const baseDarkKeysSorted = [...baseDarkKeysOrdered].sort();
if (JSON.stringify(baseLightKeysSorted) !== JSON.stringify(baseDarkKeysSorted)) {
  console.error('ERROR: Base light and dark token keys do not match!');
  console.error('  Light-only:', baseLightKeysOrdered.filter((k) => !baseDarkKeysOrdered.includes(k)));
  console.error('  Dark-only:', baseDarkKeysOrdered.filter((k) => !baseLightKeysOrdered.includes(k)));
  process.exit(1);
}

// Use light.json key order as the canonical ordering
const allTokenKeys = baseLightKeysOrdered;

// Separate core vs extended tokens
// Extended tokens are the ones at the top level (not inside a group like surface, fg, etc.)
const EXTENDED_TOKEN_KEYS = ['background', 'panelBackground', 'mainPanelBackground', 'ring', 'overlay', 'surfaceGlass', 'skeleton'];
const coreTokenKeys = allTokenKeys.filter((k) => !EXTENDED_TOKEN_KEYS.includes(k));
const extendedTokenKeys = allTokenKeys.filter((k) => EXTENDED_TOKEN_KEYS.includes(k));

// Surface scopes
const surfaceScopesLightRaw = readJson(join(TOKENS_DIR, 'surface-scopes', 'light.json')) as Record<string, unknown>;
const surfaceScopesDarkRaw = readJson(join(TOKENS_DIR, 'surface-scopes', 'dark.json')) as Record<string, unknown>;

const surfaceScopesLight = flattenSurfaceScopes(surfaceScopesLightRaw);
const surfaceScopesDark = flattenSurfaceScopes(surfaceScopesDarkRaw);

// Derive surface contextual token keys from surface scopes
const surfaceContextualTokenKeys = new Set<string>();
for (const scope of [...Object.values(surfaceScopesLight), ...Object.values(surfaceScopesDark)]) {
  for (const key of Object.keys(scope)) {
    surfaceContextualTokenKeys.add(key);
  }
}
const sortedSurfaceContextualKeys = [...surfaceContextualTokenKeys].sort();

// Preset metadata (read first to get canonical ordering)
const presetsMeta = readJson(join(TOKENS_DIR, 'meta', 'presets.json')) as {
  presets: Array<{
    id: string;
    name: string;
    description: string;
    allowedModes?: string[];
    preview: {
      light: { bg: string; accent: string; text: string };
      dark: { bg: string; accent: string; text: string };
    };
  }>;
};

// Use metadata order as canonical preset ordering
const presetIds = presetsMeta.presets.map((p) => p.id);
const presetFiles = presetIds.map((id) => `${id}.json`);

interface PresetData {
  light?: Record<string, string>;
  dark?: Record<string, string>;
  surfaceScopesLight?: Record<string, Record<string, string>>;
  surfaceScopesDark?: Record<string, Record<string, string>>;
}

const presetOverrides: Record<string, PresetData> = {};

for (const file of presetFiles) {
  const id = basename(file, '.json');
  const raw = readJson(join(TOKENS_DIR, 'presets', file)) as Record<string, unknown>;
  const data: PresetData = {};

  if (raw.light && typeof raw.light === 'object') {
    data.light = flattenDtcg(raw.light as Record<string, unknown>);
  }
  if (raw.dark && typeof raw.dark === 'object') {
    data.dark = flattenDtcg(raw.dark as Record<string, unknown>);
  }
  if (raw.surfaceScopes && typeof raw.surfaceScopes === 'object') {
    const ss = raw.surfaceScopes as Record<string, unknown>;
    if (ss.light && typeof ss.light === 'object') {
      data.surfaceScopesLight = flattenSurfaceScopes(ss.light as Record<string, unknown>);
    }
    if (ss.dark && typeof ss.dark === 'object') {
      data.surfaceScopesDark = flattenSurfaceScopes(ss.dark as Record<string, unknown>);
    }
  }

  presetOverrides[id] = data;
}

// Validate preset keys are subset of base keys
for (const [id, data] of Object.entries(presetOverrides)) {
  for (const mode of ['light', 'dark'] as const) {
    const overrides = data[mode];
    if (!overrides) continue;
    for (const key of Object.keys(overrides)) {
      if (!allTokenKeys.includes(key)) {
        console.error(`ERROR: Preset "${id}" ${mode} has unknown token "${key}" (not in base)`);
        process.exit(1);
      }
    }
  }
}

// Validate all presets in metadata have corresponding JSON files
for (const id of presetIds) {
  const filePath = join(TOKENS_DIR, 'presets', `${id}.json`);
  if (!existsSync(filePath)) {
    console.error(`ERROR: Preset "${id}" listed in meta/presets.json but no file at presets/${id}.json`);
    process.exit(1);
  }
}

// CSS variable overrides
const cssVarsConfig = readJson(join(TOKENS_DIR, 'meta', 'css-vars.json')) as {
  overrides: Record<string, string>;
  extended: Record<string, string>;
};

// ---------------------------------------------------------------------------
// Generate src/types.ts
// ---------------------------------------------------------------------------

function generateTypes(): string {
  const lines: string[] = [
    '// @generated — do not edit manually. Run `npm run generate` to regenerate.',
    '',
    `export type ThemePresetId = ${presetIds.map((id) => `'${id}'`).join(' | ')};`,
    // Note: presetIds order comes from meta/presets.json
    '',
    '// Surface scoping',
    "export type SurfaceLevel = '0' | '1' | '2' | '3' | '4';",
    '',
    'export type SurfaceContextualToken =',
  ];

  // Add surface contextual token union (sorted for stable output)
  const sctLines = sortedSurfaceContextualKeys.map((k, i) => {
    const prefix = i === 0 ? '  | ' : '  | ';
    const suffix = i === sortedSurfaceContextualKeys.length - 1 ? ';' : '';
    return `${prefix}'${k}'${suffix}`;
  });
  lines.push(...sctLines);

  lines.push(
    '',
    'export type SurfaceScopes = Partial<',
    '  Record<SurfaceLevel, Partial<Pick<ThemeColors, SurfaceContextualToken>>>',
    '>;',
    '',
    "export type ThemeMode = 'light' | 'dark' | 'system';",
    '',
    'export interface ThemeColors {',
  );

  // Group core tokens by category for readability
  const groups: { label: string; prefix: string }[] = [
    { label: 'Surfaces', prefix: 'surface' },
    { label: 'Foreground', prefix: 'fg' },
    { label: 'Borders', prefix: 'border' },
    { label: 'Accent', prefix: 'accent' },
    { label: 'Sidebar', prefix: 'sidebar' },
    { label: 'Tabs', prefix: 'tab' },
    { label: 'Inputs', prefix: 'input' },
    { label: 'Semantic backgrounds', prefix: 'bg' },
  ];

  for (const group of groups) {
    const keys = coreTokenKeys.filter((k) => k.startsWith(group.prefix));
    if (keys.length === 0) continue;
    lines.push(`  // ${group.label}`);
    for (const key of keys) {
      lines.push(`  ${key}: string;`);
    }
  }

  lines.push('}');
  lines.push('');

  // ThemePresetColors with extended tokens
  lines.push('export interface ThemePresetColors extends ThemeColors {');
  lines.push('  // Optional extended tokens for web/desktop presets');
  for (const key of extendedTokenKeys) {
    lines.push(`  ${key}?: string;`);
  }
  lines.push('}');
  lines.push('');

  // PresetPreview, ThemePreset
  lines.push(
    'export interface PresetPreview {',
    '  bg: string;',
    '  accent: string;',
    '  text: string;',
    '}',
    '',
    'export interface ThemePreset {',
    '  id: ThemePresetId;',
    '  name: string;',
    '  description: string;',
    "  allowedModes?: ('light' | 'dark')[];",
    '  preview: {',
    '    light: PresetPreview;',
    '    dark: PresetPreview;',
    '  };',
    '}',
    '',
  );

  // ThemeShadows interface
  if (shadowTokenKeys.length > 0) {
    lines.push('export interface ThemeShadows {');
    for (const key of shadowTokenKeys) {
      lines.push(`  ${key}: string;`);
    }
    lines.push('}');
    lines.push('');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Generate src/tokens.ts
// ---------------------------------------------------------------------------

function formatObj(obj: Record<string, string>, indent: string): string {
  const entries = Object.entries(obj);
  if (entries.length === 0) return '{}';
  return '{\n' +
    entries.map(([k, v]) => `${indent}  ${k}: '${v}',`).join('\n') +
    `\n${indent}}`;
}

function formatScopeObj(scopes: Record<string, Record<string, string>>, indent: string): string {
  const entries = Object.entries(scopes);
  if (entries.length === 0) return '{}';
  const blocks = entries.map(([level, tokens]) => {
    return `${indent}  '${level}': ${formatObj(tokens, indent + '  ')},`;
  });
  return '{\n' + blocks.join('\n') + `\n${indent}}`;
}

function generateTokens(): string {
  const lines: string[] = [
    '// @generated — do not edit manually. Run `npm run generate` to regenerate.',
    '',
    "import type { ThemeColors, ThemePresetId, ThemePreset, ThemeShadows, SurfaceScopes } from './types.js';",
    '',
    '// ---------------------------------------------------------------------------',
    '// Base token sets',
    '// ---------------------------------------------------------------------------',
    '',
  ];

  // BASE_LIGHT
  lines.push(`export const BASE_LIGHT: ThemeColors = ${formatObj(
    Object.fromEntries(coreTokenKeys.map((k) => [k, baseLight[k]])),
    '',
  )};`);
  lines.push('');

  // BASE_DARK
  lines.push(`export const BASE_DARK: ThemeColors = ${formatObj(
    Object.fromEntries(coreTokenKeys.map((k) => [k, baseDark[k]])),
    '',
  )};`);
  lines.push('');

  // Surface scopes
  lines.push(
    '// ---------------------------------------------------------------------------',
    '// Surface-contextual scopes',
    '// ---------------------------------------------------------------------------',
    '',
  );

  lines.push(`export const SURFACE_SCOPES_LIGHT: SurfaceScopes = ${formatScopeObj(surfaceScopesLight, '')};`);
  lines.push('');
  lines.push(`export const SURFACE_SCOPES_DARK: SurfaceScopes = ${formatScopeObj(surfaceScopesDark, '')};`);
  lines.push('');

  // Preset overrides
  lines.push(
    '// ---------------------------------------------------------------------------',
    '// Per-preset overrides (only tokens that differ from the base)',
    '// ---------------------------------------------------------------------------',
    '',
    'type PartialColors = Partial<ThemeColors> & {',
  );
  for (const key of extendedTokenKeys) {
    lines.push(`  ${key}?: string;`);
  }
  lines.push(
    '};',
    '',
    'export const PRESET_OVERRIDES: Record<ThemePresetId, {',
    '  light?: PartialColors;',
    '  dark?: PartialColors;',
    '  surfaceScopesLight?: SurfaceScopes;',
    '  surfaceScopesDark?: SurfaceScopes;',
    '}> = {',
  );

  for (const id of presetIds) {
    const data = presetOverrides[id];
    const hasAny = data.light || data.dark || data.surfaceScopesLight || data.surfaceScopesDark;
    if (!hasAny) {
      lines.push(`  ${id}: {},`);
      lines.push('');
      continue;
    }

    lines.push(`  ${id}: {`);
    if (data.light && Object.keys(data.light).length > 0) {
      lines.push(`    light: ${formatObj(data.light, '    ')},`);
    }
    if (data.dark && Object.keys(data.dark).length > 0) {
      lines.push(`    dark: ${formatObj(data.dark, '    ')},`);
    }
    if (data.surfaceScopesLight && Object.keys(data.surfaceScopesLight).length > 0) {
      lines.push(`    surfaceScopesLight: ${formatScopeObj(data.surfaceScopesLight, '    ')},`);
    }
    if (data.surfaceScopesDark && Object.keys(data.surfaceScopesDark).length > 0) {
      lines.push(`    surfaceScopesDark: ${formatScopeObj(data.surfaceScopesDark, '    ')},`);
    }
    lines.push('  },');
    lines.push('');
  }

  lines.push('};');
  lines.push('');

  // Preset metadata
  lines.push(
    '// ---------------------------------------------------------------------------',
    '// Preset metadata',
    '// ---------------------------------------------------------------------------',
    '',
    'export const THEME_PRESETS: Record<ThemePresetId, ThemePreset> = {',
  );

  for (const preset of presetsMeta.presets) {
    lines.push(`  ${preset.id}: {`);
    lines.push(`    id: '${preset.id}',`);
    lines.push(`    name: '${preset.name}',`);
    lines.push(`    description: '${preset.description}',`);
    if (preset.allowedModes) {
      lines.push(`    allowedModes: [${preset.allowedModes.map((m) => `'${m}'`).join(', ')}],`);
    }
    lines.push(`    preview: {`);
    lines.push(`      light: { bg: '${preset.preview.light.bg}', accent: '${preset.preview.light.accent}', text: '${preset.preview.light.text}' },`);
    lines.push(`      dark: { bg: '${preset.preview.dark.bg}', accent: '${preset.preview.dark.accent}', text: '${preset.preview.dark.text}' },`);
    lines.push(`    },`);
    lines.push(`  },`);
  }

  lines.push('};');
  lines.push('');

  lines.push(`export const THEME_PRESET_IDS: ThemePresetId[] = [`);
  lines.push(`  ${presetIds.map((id) => `'${id}'`).join(', ')},`);
  lines.push('];');
  lines.push('');

  // Shadow tokens
  if (shadowTokenKeys.length > 0) {
    lines.push(
      '// ---------------------------------------------------------------------------',
      '// Shadow tokens',
      '// ---------------------------------------------------------------------------',
      '',
    );
    lines.push(`export const SHADOWS_LIGHT: ThemeShadows = ${formatObj(baseLightShadows, '')};`);
    lines.push('');
    lines.push(`export const SHADOWS_DARK: ThemeShadows = ${formatObj(baseDarkShadows, '')};`);
    lines.push('');

    lines.push('export const SHADOW_TO_CSS: Record<keyof ThemeShadows, string> = {');
    for (const key of shadowTokenKeys) {
      const cssVar = camelToCssVar(key, cssVarsConfig.overrides, {});
      lines.push(`  ${key}: '${cssVar}',`);
    }
    lines.push('};');
    lines.push('');
  }

  // TOKEN_TO_CSS mapping
  lines.push(
    '// ---------------------------------------------------------------------------',
    '// CSS variable name mappings',
    '// ---------------------------------------------------------------------------',
    '',
    'export const TOKEN_TO_CSS: Record<keyof ThemeColors, string> = {',
  );
  for (const key of coreTokenKeys) {
    const cssVar = camelToCssVar(key, cssVarsConfig.overrides, {});
    lines.push(`  ${key}: '${cssVar}',`);
  }
  lines.push('};');
  lines.push('');

  lines.push('export const EXTENDED_CSS: Record<string, string> = {');
  for (const key of extendedTokenKeys) {
    const cssVar = camelToCssVar(key, {}, cssVarsConfig.extended);
    lines.push(`  ${key}: '${cssVar}',`);
  }
  lines.push('};');
  lines.push('');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Write or check
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Generate src/tokens-rn.ts — pre-computed hex values for React Native
// ---------------------------------------------------------------------------

function convertObjToHex(obj: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = oklchStringToHex(value);
  }
  return result;
}

function formatHexObj(obj: Record<string, string>, indent: string): string {
  const entries = Object.entries(obj);
  if (entries.length === 0) return '{}';
  return '{\n' +
    entries.map(([k, v]) => `${indent}  ${k}: '${v}',`).join('\n') +
    `\n${indent}}`;
}

function formatHexScopeObj(scopes: Record<string, Record<string, string>>, indent: string): string {
  const entries = Object.entries(scopes);
  if (entries.length === 0) return '{}';
  const blocks = entries.map(([level, tokens]) => {
    return `${indent}  '${level}': ${formatHexObj(convertObjToHex(tokens), indent + '  ')},`;
  });
  return '{\n' + blocks.join('\n') + `\n${indent}}`;
}

function generateTokensRn(): string {
  const lines: string[] = [
    '// @generated — do not edit manually. Run `npm run generate` to regenerate.',
    '// Pre-computed hex values for React Native (OKLCH → sRGB gamut-mapped → hex).',
    '',
    "import type { ThemeColors, ThemePresetColors, ThemePresetId, SurfaceScopes } from './types.js';",
    '',
  ];

  // BASE_LIGHT_HEX
  const baseLightHex = convertObjToHex(
    Object.fromEntries(coreTokenKeys.map((k) => [k, baseLight[k]])),
  );
  lines.push(`export const BASE_LIGHT_HEX: ThemeColors = ${formatHexObj(baseLightHex, '')};`);
  lines.push('');

  // BASE_DARK_HEX
  const baseDarkHex = convertObjToHex(
    Object.fromEntries(coreTokenKeys.map((k) => [k, baseDark[k]])),
  );
  lines.push(`export const BASE_DARK_HEX: ThemeColors = ${formatHexObj(baseDarkHex, '')};`);
  lines.push('');

  // SURFACE_SCOPES_LIGHT_HEX
  lines.push(`export const SURFACE_SCOPES_LIGHT_HEX: SurfaceScopes = ${formatHexScopeObj(surfaceScopesLight, '')};`);
  lines.push('');
  lines.push(`export const SURFACE_SCOPES_DARK_HEX: SurfaceScopes = ${formatHexScopeObj(surfaceScopesDark, '')};`);
  lines.push('');

  // PRESET_OVERRIDES_HEX
  lines.push('export const PRESET_OVERRIDES_HEX: Record<ThemePresetId, {');
  lines.push('  light?: Partial<ThemePresetColors>;');
  lines.push('  dark?: Partial<ThemePresetColors>;');
  lines.push('  surfaceScopesLight?: SurfaceScopes;');
  lines.push('  surfaceScopesDark?: SurfaceScopes;');
  lines.push('}> = {');

  for (const id of presetIds) {
    const data = presetOverrides[id];
    const hasAny = data.light || data.dark || data.surfaceScopesLight || data.surfaceScopesDark;
    if (!hasAny) {
      lines.push(`  ${id}: {},`);
      lines.push('');
      continue;
    }

    lines.push(`  ${id}: {`);
    if (data.light && Object.keys(data.light).length > 0) {
      lines.push(`    light: ${formatHexObj(convertObjToHex(data.light), '    ')},`);
    }
    if (data.dark && Object.keys(data.dark).length > 0) {
      lines.push(`    dark: ${formatHexObj(convertObjToHex(data.dark), '    ')},`);
    }
    if (data.surfaceScopesLight && Object.keys(data.surfaceScopesLight).length > 0) {
      lines.push(`    surfaceScopesLight: ${formatHexScopeObj(data.surfaceScopesLight, '    ')},`);
    }
    if (data.surfaceScopesDark && Object.keys(data.surfaceScopesDark).length > 0) {
      lines.push(`    surfaceScopesDark: ${formatHexScopeObj(data.surfaceScopesDark, '    ')},`);
    }
    lines.push('  },');
    lines.push('');
  }

  lines.push('};');
  lines.push('');

  return lines.join('\n');
}

const typesContent = generateTypes();
const tokensContent = generateTokens();
const tokensRnContent = generateTokensRn();

const typesPath = join(SRC_DIR, 'types.ts');
const tokensPath = join(SRC_DIR, 'tokens.ts');
const tokensRnPath = join(SRC_DIR, 'tokens-rn.ts');

if (CHECK_MODE) {
  let stale = false;

  if (!existsSync(typesPath) || readFileSync(typesPath, 'utf-8') !== typesContent) {
    console.error('src/types.ts is stale — run `npm run generate` to update.');
    stale = true;
  }

  if (!existsSync(tokensPath) || readFileSync(tokensPath, 'utf-8') !== tokensContent) {
    console.error('src/tokens.ts is stale — run `npm run generate` to update.');
    stale = true;
  }

  if (!existsSync(tokensRnPath) || readFileSync(tokensRnPath, 'utf-8') !== tokensRnContent) {
    console.error('src/tokens-rn.ts is stale — run `npm run generate` to update.');
    stale = true;
  }

  if (stale) {
    process.exit(1);
  }

  console.log('Generated files are up to date.');
} else {
  writeFileSync(typesPath, typesContent);
  writeFileSync(tokensPath, tokensContent);
  writeFileSync(tokensRnPath, tokensRnContent);
  console.log('Generated src/types.ts, src/tokens.ts, and src/tokens-rn.ts from token JSON files.');
}
