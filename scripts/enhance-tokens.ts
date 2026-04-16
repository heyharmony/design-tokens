/**
 * Token enhancement script — applies all SOTA improvements to token JSON files:
 * 1. Fix inputBorderFocus !== inputBorderHover (a11y)
 * 2. Add new token categories (accent extended, semantic bg/border, overlay)
 * 3. Fix dark mode saturation ramp
 * 4. Differentiate surface 3 vs 4 in light mode
 * 5. Add P3 wide gamut accent values
 * 6. Add shadow tokens
 *
 * Run: npx tsx scripts/enhance-tokens.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { formatOklchString, parseOklchString, type OklchColor } from './color-utils.js';

const TOKENS_DIR = join(import.meta.dirname, '..', 'tokens');

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, 'utf-8'));
}
function writeJson(path: string, data: unknown): void {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

// Helper to create a DTCG color leaf
function c(value: string): { $value: string; $type: string } {
  return { $value: value, $type: 'color' };
}
function s(value: string): { $value: string; $type: string } {
  return { $value: value, $type: 'shadow' };
}

// ---------------------------------------------------------------------------
// 1. Fix focus borders — derive from ring/accent color
// ---------------------------------------------------------------------------

const RING_ACHROMATIC_EPS = 0.02;

function fixFocusBordersInFile(filePath: string): void {
  const json = readJson(filePath);

  // Walk and find input.border-focus at various levels and set it
  // from the ring or accent color at reduced lightness
  fixFocusInObject(json, null);
  writeJson(filePath, json);
}

function fixFocusInObject(obj: Record<string, unknown>, parentRing: string | null): void {
  // Try to find ring or accent to derive focus color
  let ring = parentRing;

  // Check for ring at this level
  if (obj.ring && typeof obj.ring === 'object' && '$value' in (obj.ring as Record<string, unknown>)) {
    ring = (obj.ring as Record<string, unknown>).$value as string;
  }
  // Check for accent.default or sidebar.accent
  if (obj.accent && typeof obj.accent === 'object') {
    const accent = obj.accent as Record<string, unknown>;
    if (accent.default && typeof accent.default === 'object' && '$value' in (accent.default as Record<string, unknown>)) {
      // For presets, use sidebar.accent as ring-like reference
    }
  }
  if (obj.sidebar && typeof obj.sidebar === 'object') {
    const sidebar = obj.sidebar as Record<string, unknown>;
    if (sidebar.accent && typeof sidebar.accent === 'object' && '$value' in (sidebar.accent as Record<string, unknown>)) {
      ring = (sidebar.accent as Record<string, unknown>).$value as string;
    }
  }

  // Fix input.border-focus if it exists
  if (obj.input && typeof obj.input === 'object') {
    const input = obj.input as Record<string, unknown>;
    if (input['border-focus'] && typeof input['border-focus'] === 'object') {
      const borderFocus = input['border-focus'] as Record<string, unknown>;
      if (ring && borderFocus.$value) {
        // Derive focus color from ring
        const ringColor = parseOklchString(ring);
        // For focus border: use ring hue/chroma but at medium lightness for visibility.
        // Do not force chroma when the ring is achromatic — OKLCH hue 0 + low C reads brown/red.
        const achromatic = ringColor.C < RING_ACHROMATIC_EPS;
        const focusColor: OklchColor = {
          L: Math.max(0.35, Math.min(0.65, ringColor.L)),
          C: achromatic ? 0 : Math.max(0.08, ringColor.C),
          H: achromatic ? 0 : ringColor.H,
        };
        borderFocus.$value = formatOklchString(focusColor);
      }
    }
  }

  // Recurse into light/dark/surfaceScopes etc
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    if (typeof value === 'object' && value !== null && !('$value' in (value as Record<string, unknown>))) {
      fixFocusInObject(value as Record<string, unknown>, ring);
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Add new tokens to base files
// ---------------------------------------------------------------------------

function addNewTokensToBase(lightPath: string, darkPath: string): void {
  const light = readJson(lightPath);
  const dark = readJson(darkPath);
  const lh = light.harmony as Record<string, unknown>;
  const dh = dark.harmony as Record<string, unknown>;

  // --- Accent extended tokens ---
  const accentGroup = lh.accent as Record<string, unknown>;
  accentGroup.active = c('0.921 0.003 0');       // pressed state, darker than default
  accentGroup.subtle = c('0.965 0.005 90');       // very light warm tint
  accentGroup.muted = c('0.975 0.003 90');        // barely visible tint
  accentGroup.border = c('0.85 0.01 90');         // accent-tinted border

  const accentGroupDark = dh.accent as Record<string, unknown>;
  accentGroupDark.active = c('0.2 0.003 0');      // pressed state, lighter than default
  accentGroupDark.subtle = c('0.18 0.005 90');    // subtle tint
  accentGroupDark.muted = c('0.15 0.003 90');     // barely visible
  accentGroupDark.border = c('0.35 0.01 90');     // accent-tinted border

  // --- Semantic bg/border colors ---
  lh.bg = {
    success: c('0.945 0.06 155'),     // light green background
    warning: c('0.95 0.06 85'),       // light yellow background
    error: c('0.935 0.04 25'),        // light red background
  };

  dh.bg = {
    success: c('0.22 0.04 155'),      // dark green background
    warning: c('0.23 0.04 85'),       // dark yellow background
    error: c('0.22 0.035 25'),        // dark red background
  };

  // Add semantic borders
  const borderGroup = lh.border as Record<string, unknown>;
  borderGroup.success = c('0.7 0.12 155');
  borderGroup.warning = c('0.75 0.12 85');
  borderGroup.error = c('0.65 0.15 25');

  const borderGroupDark = dh.border as Record<string, unknown>;
  borderGroupDark.success = c('0.5 0.1 155');
  borderGroupDark.warning = c('0.55 0.1 85');
  borderGroupDark.error = c('0.45 0.12 25');

  // --- Alpha/overlay tokens ---
  lh.overlay = c('0 0 0 / 0.5');
  lh['surface-glass'] = c('0.985 0.003 90 / 0.75');
  lh.skeleton = c('0.92 0 0 / 1');

  dh.overlay = c('0 0 0 / 0.6');
  dh['surface-glass'] = c('0.2 0.003 90 / 0.75');
  dh.skeleton = c('0.25 0 0 / 1');

  // --- Shadow tokens ---
  lh.shadow = {
    '0': s('0 1px 2px oklch(0 0 0 / 0.05)'),
    '1': s('0 1px 3px oklch(0 0 0 / 0.1), 0 1px 2px oklch(0 0 0 / 0.06)'),
    '2': s('0 4px 6px oklch(0 0 0 / 0.1), 0 2px 4px oklch(0 0 0 / 0.06)'),
    '3': s('0 10px 15px oklch(0 0 0 / 0.1), 0 4px 6px oklch(0 0 0 / 0.05)'),
    '4': s('0 20px 25px oklch(0 0 0 / 0.1), 0 8px 10px oklch(0 0 0 / 0.04)'),
  };

  dh.shadow = {
    '0': s('0 1px 2px oklch(0 0 0 / 0.2)'),
    '1': s('0 1px 3px oklch(0 0 0 / 0.3), 0 1px 2px oklch(0 0 0 / 0.2)'),
    '2': s('0 4px 6px oklch(0 0 0 / 0.3), 0 2px 4px oklch(0 0 0 / 0.2)'),
    '3': s('0 10px 15px oklch(0 0 0 / 0.3), 0 4px 6px oklch(0 0 0 / 0.2)'),
    '4': s('0 20px 25px oklch(0 0 0 / 0.3), 0 8px 10px oklch(0 0 0 / 0.15)'),
  };

  writeJson(lightPath, light);
  writeJson(darkPath, dark);
}

// ---------------------------------------------------------------------------
// 3. Fix dark mode saturation ramp (chroma ramp in OKLCH)
// ---------------------------------------------------------------------------

interface PresetDarkConfig {
  baseHue: number;
  baseChroma: number; // chroma for surface0
  chromaDecay: number; // multiplier per level
}

const DARK_PRESET_CONFIGS: Record<string, PresetDarkConfig> = {
  ocean: { baseHue: 255, baseChroma: 0.045, chromaDecay: 0.22 },
  forest: { baseHue: 155, baseChroma: 0.04, chromaDecay: 0.22 },
  berry: { baseHue: 300, baseChroma: 0.045, chromaDecay: 0.22 },
  sand: { baseHue: 60, baseChroma: 0.03, chromaDecay: 0.2 },
  ayu: { baseHue: 255, baseChroma: 0.03, chromaDecay: 0.2 },
};

function fixDarkSaturationRamp(filePath: string, config: PresetDarkConfig): void {
  const json = readJson(filePath);
  const dark = (json as Record<string, unknown>).dark as Record<string, unknown> | undefined;
  if (!dark) return;

  const surface = dark.surface as Record<string, unknown> | undefined;
  if (!surface) return;

  // Update surface 2-4 to have gentle chroma ramp instead of cliff
  const levels = [0, 1, 2, 3, 4];
  for (const level of levels) {
    const chroma = config.baseChroma * (1 - level * config.chromaDecay);
    const key = String(level);
    const hoverKey = `${level}-hover`;
    const activeKey = `${level}-active`;
    const highlightKey = `${level}-highlight`;

    // Only update levels 2+ (0 and 1 are already fine)
    if (level < 2) continue;

    // Read existing values to preserve lightness
    for (const k of [key, hoverKey, activeKey, highlightKey]) {
      const token = surface[k];
      if (token && typeof token === 'object' && '$value' in (token as Record<string, unknown>)) {
        const existing = parseOklchString((token as Record<string, unknown>).$value as string);
        const updated: OklchColor = {
          L: existing.L,
          C: Math.max(0.005, chroma),
          H: config.baseHue,
        };
        (token as Record<string, unknown>).$value = formatOklchString(updated);
      }
    }
  }

  writeJson(filePath, json);
}

// ---------------------------------------------------------------------------
// 4. Differentiate surface 3 vs 4 in light mode
// ---------------------------------------------------------------------------

function differentiateSurface4Light(filePath: string, tintHue: number): void {
  const json = readJson(filePath);

  // Find light mode surfaces
  let lightObj: Record<string, unknown> | null = null;
  if ((json as Record<string, unknown>).harmony) {
    lightObj = (json as Record<string, unknown>).harmony as Record<string, unknown>;
  } else if ((json as Record<string, unknown>).light) {
    lightObj = (json as Record<string, unknown>).light as Record<string, unknown>;
  }
  if (!lightObj) return;

  const surface = lightObj.surface as Record<string, unknown> | undefined;
  if (!surface) return;

  // Make surface4 slightly different from surface3
  const s4 = surface['4'] as Record<string, unknown> | undefined;
  const s4h = surface['4-hover'] as Record<string, unknown> | undefined;
  const s4a = surface['4-active'] as Record<string, unknown> | undefined;
  const s4hl = surface['4-highlight'] as Record<string, unknown> | undefined;

  if (s4?.$value) {
    const parsed = parseOklchString(s4.$value as string);
    s4.$value = formatOklchString({ L: 0.985, C: 0.003, H: tintHue });
  }
  if (s4h?.$value) {
    s4h.$value = formatOklchString({ L: 0.965, C: 0.004, H: tintHue });
  }
  if (s4a?.$value) {
    s4a.$value = formatOklchString({ L: 0.945, C: 0.005, H: tintHue });
  }
  if (s4hl?.$value) {
    s4hl.$value = formatOklchString({ L: 0.96, C: 0.006, H: tintHue });
  }

  writeJson(filePath, json);
}

// ---------------------------------------------------------------------------
// 5. P3 wide gamut accent values
// ---------------------------------------------------------------------------

function enhanceP3AccentInPreset(filePath: string, hue: number, p3Chroma: number): void {
  const json = readJson(filePath);

  // Boost sidebar.accent and ring chroma for P3
  for (const mode of ['light', 'dark']) {
    const modeObj = (json as Record<string, unknown>)[mode] as Record<string, unknown> | undefined;
    if (!modeObj) continue;

    const sidebar = modeObj.sidebar as Record<string, unknown> | undefined;
    if (sidebar?.accent && typeof sidebar.accent === 'object') {
      const token = sidebar.accent as Record<string, unknown>;
      if (token.$value) {
        const existing = parseOklchString(token.$value as string);
        token.$value = formatOklchString({
          L: existing.L,
          C: Math.max(existing.C, p3Chroma),
          H: hue,
        });
      }
    }

    const ring = modeObj.ring as Record<string, unknown> | undefined;
    if (ring && '$value' in ring) {
      const existing = parseOklchString(ring.$value as string);
      ring.$value = formatOklchString({
        L: existing.L,
        C: Math.max(existing.C, p3Chroma),
        H: hue,
      });
    }
  }

  writeJson(filePath, json);
}

// ---------------------------------------------------------------------------
// Execute all enhancements
// ---------------------------------------------------------------------------

console.log('=== Enhancing design tokens ===\n');

// 1. Add new tokens to base files
console.log('1. Adding new tokens (accent, semantic, overlay, shadow)...');
addNewTokensToBase(
  join(TOKENS_DIR, 'base', 'light.json'),
  join(TOKENS_DIR, 'base', 'dark.json'),
);
console.log('   Done.');

// 2. Fix focus borders
console.log('2. Fixing focus borders (a11y)...');
fixFocusBordersInFile(join(TOKENS_DIR, 'base', 'light.json'));
fixFocusBordersInFile(join(TOKENS_DIR, 'base', 'dark.json'));
for (const preset of ['ocean', 'forest', 'berry', 'sand', 'ayu', 'black', 'white']) {
  fixFocusBordersInFile(join(TOKENS_DIR, 'presets', `${preset}.json`));
}
// Also fix surface scopes
fixFocusBordersInFile(join(TOKENS_DIR, 'surface-scopes', 'light.json'));
fixFocusBordersInFile(join(TOKENS_DIR, 'surface-scopes', 'dark.json'));
console.log('   Done.');

// 3. Fix dark saturation ramp
console.log('3. Fixing dark mode saturation ramp...');
for (const [id, config] of Object.entries(DARK_PRESET_CONFIGS)) {
  fixDarkSaturationRamp(join(TOKENS_DIR, 'presets', `${id}.json`), config);
}
console.log('   Done.');

// 4. Differentiate surface 3 vs 4 in light mode
console.log('4. Differentiating surface 3 vs 4 in light mode...');
differentiateSurface4Light(join(TOKENS_DIR, 'base', 'light.json'), 84.6);
differentiateSurface4Light(join(TOKENS_DIR, 'presets', 'ocean.json'), 248);
differentiateSurface4Light(join(TOKENS_DIR, 'presets', 'forest.json'), 155);
differentiateSurface4Light(join(TOKENS_DIR, 'presets', 'berry.json'), 300);
differentiateSurface4Light(join(TOKENS_DIR, 'presets', 'sand.json'), 60);
differentiateSurface4Light(join(TOKENS_DIR, 'presets', 'ayu.json'), 248);
differentiateSurface4Light(join(TOKENS_DIR, 'presets', 'white.json'), 0);
console.log('   Done.');

// 5. P3 wide gamut accents
console.log('5. Enhancing P3 gamut accent colors...');
enhanceP3AccentInPreset(join(TOKENS_DIR, 'presets', 'ocean.json'), 255, 0.2);
enhanceP3AccentInPreset(join(TOKENS_DIR, 'presets', 'forest.json'), 155, 0.2);
enhanceP3AccentInPreset(join(TOKENS_DIR, 'presets', 'berry.json'), 300, 0.2);
enhanceP3AccentInPreset(join(TOKENS_DIR, 'presets', 'sand.json'), 60, 0.15);
enhanceP3AccentInPreset(join(TOKENS_DIR, 'presets', 'ayu.json'), 70, 0.2);
console.log('   Done.');

console.log('\n=== All enhancements applied! ===');
console.log('Run `npm run generate && npm run build` to regenerate.');
