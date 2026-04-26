/**
 * WCAG contrast ratio audit for all theme presets.
 * Validates that fg-on-bg pairs meet WCAG AA thresholds.
 *
 * Run: npm run audit:contrast
 * Strict mode (CI): npm run audit:contrast -- --strict
 */

import { contrastRatio } from './color-utils.js';
import { resolveTheme } from '../src/resolve.js';
import { THEME_PRESET_IDS } from '../src/tokens.js';
import type { ThemeColors, ThemePresetId } from '../src/types.js';

const STRICT = process.argv.includes('--strict');

// WCAG AA thresholds
const AA_NORMAL = 4.5;  // normal text
const AA_LARGE = 3.0;   // large text (18px+ or 14px+ bold)

interface AuditPair {
  fg: keyof ThemeColors;
  bg: keyof ThemeColors;
  threshold: number;
  label: string;
}

// Define all fg-on-bg pairs to check
function getAuditPairs(): AuditPair[] {
  const pairs: AuditPair[] = [];
  const surfaces: (keyof ThemeColors)[] = ['surface0', 'surface1', 'surface2', 'surface3', 'surface4'];

  // Primary text on all surfaces
  for (const bg of surfaces) {
    pairs.push({ fg: 'fg', bg, threshold: AA_NORMAL, label: `fg on ${bg}` });
    pairs.push({ fg: 'fgSecondary', bg, threshold: AA_NORMAL, label: `fgSecondary on ${bg}` });
    pairs.push({ fg: 'fgTertiary', bg, threshold: AA_LARGE, label: `fgTertiary on ${bg} (large)` });
    pairs.push({ fg: 'fgDisabled', bg, threshold: AA_LARGE, label: `fgDisabled on ${bg} (large)` });
  }

  // Semantic colors on surfaces
  for (const bg of surfaces) {
    pairs.push({ fg: 'fgSuccess', bg, threshold: AA_LARGE, label: `fgSuccess on ${bg} (large)` });
    pairs.push({ fg: 'fgWarning', bg, threshold: AA_LARGE, label: `fgWarning on ${bg} (large)` });
    pairs.push({ fg: 'fgError', bg, threshold: AA_LARGE, label: `fgError on ${bg} (large)` });
  }

  // Accent foreground on accent
  pairs.push({ fg: 'accentForeground', bg: 'accent', threshold: AA_NORMAL, label: 'accentForeground on accent' });

  // CTA foreground on CTA background (base, non-surface-scoped)
  pairs.push({ fg: 'ctaFg', bg: 'ctaBg', threshold: AA_NORMAL, label: 'ctaFg on ctaBg' });

  // Placeholder on input bg
  pairs.push({ fg: 'inputPlaceholder', bg: 'inputBg', threshold: AA_LARGE, label: 'inputPlaceholder on inputBg (large)' });

  // Primary text on semantic backgrounds
  pairs.push({ fg: 'fg', bg: 'bgSuccess', threshold: AA_NORMAL, label: 'fg on bgSuccess' });
  pairs.push({ fg: 'fg', bg: 'bgWarning', threshold: AA_NORMAL, label: 'fg on bgWarning' });
  pairs.push({ fg: 'fg', bg: 'bgError', threshold: AA_NORMAL, label: 'fg on bgError' });

  // Sidebar accent foreground on sidebar accent
  pairs.push({ fg: 'sidebarAccentForeground', bg: 'sidebarAccent', threshold: AA_NORMAL, label: 'sidebarAccentFg on sidebarAccent' });

  return pairs;
}

const pairs = getAuditPairs();
let totalChecks = 0;
let totalFails = 0;

console.log('WCAG Contrast Audit');
console.log('='.repeat(80));

for (const presetId of THEME_PRESET_IDS) {
  for (const mode of ['light', 'dark'] as const) {
    const colors = resolveTheme(presetId, mode);
    const fails: string[] = [];

    for (const pair of pairs) {
      const fgValue = colors[pair.fg];
      const bgValue = colors[pair.bg];

      if (!fgValue || !bgValue) continue;

      // Skip alpha values for contrast checking (overlay etc.)
      if (fgValue.includes('/') || bgValue.includes('/')) continue;

      try {
        const ratio = contrastRatio(fgValue, bgValue);
        totalChecks++;

        if (ratio < pair.threshold) {
          fails.push(`  FAIL ${pair.label}: ${ratio.toFixed(2)}:1 (need ${pair.threshold}:1)`);
          totalFails++;
        }
      } catch {
        // Skip tokens that can't be parsed (e.g., shadow values)
      }
    }

    if (fails.length > 0) {
      console.log(`\n${presetId}/${mode} — ${fails.length} failures:`);
      for (const f of fails) {
        console.log(f);
      }
    }
  }
}

console.log('\n' + '='.repeat(80));
console.log(`Checked ${totalChecks} pairs across ${THEME_PRESET_IDS.length} presets x 2 modes.`);

if (totalFails > 0) {
  console.log(`\n${totalFails} FAILURES found.`);
  if (STRICT) {
    process.exit(1);
  }
} else {
  console.log('\nAll pairs pass WCAG AA! ✓');
}
