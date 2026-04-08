/**
 * CSS/DOM entry point for web and Electron apps.
 * Provides applyThemePreset() which sets CSS custom properties on document.documentElement.
 */

import type { ThemeColors, ThemePresetId, ThemePresetColors, SurfaceLevel, SurfaceContextualToken } from './types.js';
import { resolveThemeExtended, resolveSurfaceScopes } from './resolve.js';

export { resolveTheme, resolveThemeExtended, resolveSurfaceScopes, isPresetAllowedForMode } from './resolve.js';
export { THEME_PRESETS, THEME_PRESET_IDS, BASE_LIGHT, BASE_DARK } from './tokens.js';
export type { ThemeColors, ThemePresetId, ThemeMode, ThemePreset, ThemePresetColors, PresetPreview, SurfaceLevel, SurfaceContextualToken, SurfaceScopes } from './types.js';

/**
 * Maps ThemeColors keys to CSS custom property names.
 * Accent/sidebar tokens omit the harmony- prefix for Shadcn/UI compatibility.
 */
const TOKEN_TO_CSS: Record<keyof ThemeColors, string> = {
  surface0: '--harmony-surface-0',
  surface0Hover: '--harmony-surface-0-hover',
  surface1: '--harmony-surface-1',
  surface1Hover: '--harmony-surface-1-hover',
  surface2: '--harmony-surface-2',
  surface2Hover: '--harmony-surface-2-hover',
  surface3: '--harmony-surface-3',
  surface3Hover: '--harmony-surface-3-hover',
  surface4: '--harmony-surface-4',
  surface4Hover: '--harmony-surface-4-hover',
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

/** Extended token CSS variable names */
const EXTENDED_CSS: Record<string, string> = {
  background: '--background',
  panelBackground: '--panel-bg',
  mainPanelBackground: '--main-panel-bg',
  ring: '--ring',
};

/** All CSS variables managed by this function (for cleanup on preset switch) */
const ALL_MANAGED_VARS = [
  ...Object.values(TOKEN_TO_CSS),
  ...Object.values(EXTENDED_CSS),
];

/**
 * Apply a theme preset's colors as CSS custom properties on document.documentElement.
 * Clears all managed variables first, then sets the resolved values.
 */
export function applyThemePreset(presetId: ThemePresetId, isDark: boolean): void {
  const root = document.documentElement;
  const mode = isDark ? 'dark' : 'light';
  const colors = resolveThemeExtended(presetId, mode);

  // Clear all managed variables
  for (const v of ALL_MANAGED_VARS) {
    root.style.removeProperty(v);
  }

  // Set core token variables
  for (const [key, cssVar] of Object.entries(TOKEN_TO_CSS)) {
    const value = colors[key as keyof ThemeColors];
    if (value) {
      root.style.setProperty(cssVar, value);
    }
  }

  // Set extended variables (only if present in preset overrides)
  for (const [key, cssVar] of Object.entries(EXTENDED_CSS)) {
    const value = (colors as unknown as Record<string, string | undefined>)[key];
    if (value) {
      root.style.setProperty(cssVar, value);
    }
  }

  root.setAttribute('data-theme-preset', presetId);
}

/** Get the CSS variable name for a given token key. */
export function getTokenCssVar(key: keyof ThemeColors): string {
  return TOKEN_TO_CSS[key];
}

/** All surface-contextual CSS variable names (for cleanup). */
const SURFACE_CONTEXTUAL_VARS: string[] = ([
  'inputBg', 'inputBorder', 'inputBorderHover', 'inputBorderFocus',
  'inputBorderError', 'inputBgDisabled', 'inputPlaceholder',
  'tabBg', 'tabBgHover', 'tabOutline',
  'borderSubtle', 'borderDefault',
] as SurfaceContextualToken[]).map((key) => TOKEN_TO_CSS[key]);

/**
 * Apply surface-scoped CSS variable overrides to an element.
 * Resolves the surface scopes for the given preset/mode, then sets the
 * contextual token CSS variables on the element for the requested level.
 */
export function applySurfaceScopeToElement(
  element: HTMLElement,
  presetId: ThemePresetId,
  isDark: boolean,
  surfaceLevel: SurfaceLevel,
): void {
  const mode = isDark ? 'dark' : 'light';
  const scopes = resolveSurfaceScopes(presetId, mode);
  const overrides = scopes[surfaceLevel];

  // Clear all surface-contextual CSS vars on the element
  for (const cssVar of SURFACE_CONTEXTUAL_VARS) {
    element.style.removeProperty(cssVar);
  }

  // Set overrides for the requested surface level
  if (overrides) {
    for (const [key, value] of Object.entries(overrides)) {
      const cssVar = TOKEN_TO_CSS[key as keyof ThemeColors];
      if (cssVar && value) {
        element.style.setProperty(cssVar, value);
      }
    }
  }

  element.setAttribute('data-surface', surfaceLevel);
}
