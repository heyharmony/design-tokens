/**
 * One-time migration: converts all HSL token values to OKLCH format.
 * Run: npx tsx scripts/migrate-hsl-to-oklch.ts
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { hslStringToOklchString } from './color-utils.js';

const TOKENS_DIR = join(import.meta.dirname, '..', 'tokens');

/** Recursively walk a JSON object and convert any DTCG color $value from HSL to OKLCH. */
function convertValues(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) return obj;

  const record = obj as Record<string, unknown>;

  // DTCG leaf with color type
  if ('$value' in record && '$type' in record && record.$type === 'color' && typeof record.$value === 'string') {
    const hslValue = record.$value as string;
    // Skip if it already looks like OKLCH (starts with 0. or 1.)
    if (/^\d+\.\d+\s+\d/.test(hslValue)) {
      return record;
    }
    try {
      const oklchValue = hslStringToOklchString(hslValue);
      return { ...record, $value: oklchValue };
    } catch (e) {
      console.warn(`  WARN: Could not convert "${hslValue}": ${e}`);
      return record;
    }
  }

  // Recurse into nested objects
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    result[key] = convertValues(value);
  }
  return result;
}

function processFile(filePath: string): void {
  const content = readFileSync(filePath, 'utf-8');
  const json = JSON.parse(content);
  const converted = convertValues(json);
  writeFileSync(filePath, JSON.stringify(converted, null, 2) + '\n');
  console.log(`  Converted: ${filePath}`);
}

// Process base tokens
console.log('Converting base tokens...');
processFile(join(TOKENS_DIR, 'base', 'light.json'));
processFile(join(TOKENS_DIR, 'base', 'dark.json'));

// Process surface scopes
console.log('Converting surface scopes...');
processFile(join(TOKENS_DIR, 'surface-scopes', 'light.json'));
processFile(join(TOKENS_DIR, 'surface-scopes', 'dark.json'));

// Process all presets
console.log('Converting presets...');
const presetFiles = readdirSync(join(TOKENS_DIR, 'presets')).filter(f => f.endsWith('.json'));
for (const file of presetFiles) {
  processFile(join(TOKENS_DIR, 'presets', file));
}

console.log('\nMigration complete! All HSL values converted to OKLCH.');
console.log('Run `npm run generate && npm run build` to regenerate.');
