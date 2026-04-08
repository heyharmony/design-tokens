/**
 * AGENT-NOTE: This file contains all token values as raw HSL triplets ("H S% L%").
 * It is the single source of truth, transcribed from the W3C DTCG JSON files.
 * Values match mobile/constants/themes.ts BASE_LIGHT/BASE_DARK/PRESET_OVERRIDES.
 */

import type { ThemeColors, ThemePresetId, ThemePreset, SurfaceScopes } from './types.js';

// ---------------------------------------------------------------------------
// Base token sets
// ---------------------------------------------------------------------------

export const BASE_LIGHT: ThemeColors = {
  surface0: '40 10% 94.1%',
  surface1: '40 10% 94.1%',
  surface2: '0 0% 91%',
  surface2Hover: '0 0% 93%',
  surface3: '0 0% 100%',
  surface4: '0 0% 100%',
  fg: '0 0% 3.9%',
  fgSecondary: '0 0% 45.1%',
  fgTertiary: '0 0% 56%',
  fgDisabled: '0 0% 70%',
  fgInverse: '0 0% 98%',
  fgLink: '0 0% 9%',
  fgSuccess: '142 71% 35%',
  fgWarning: '38 92% 40%',
  fgError: '0 84% 60%',
  borderSubtle: '0 0% 87%',
  borderDefault: '0 0% 80%',
  accent: '0 0% 96.1%',
  accentForeground: '0 0% 9%',
  accentHover: '0 0% 90%',
  sidebarAccent: '0 0% 96.1%',
  sidebarAccentForeground: '0 0% 9%',
  sidebarHover: '0 0% 95%',
  tabBg: '40 8% 89%',
  tabBgHover: '40 8% 86%',
  tabOutline: '0 0% 78%',
  inputBg: '0 0% 100%',
  inputBorder: '0 0% 87%',
  inputBorderHover: '0 0% 80%',
  inputBorderFocus: '0 0% 80%',
  inputBorderError: '0 84% 60%',
  inputBgDisabled: '0 0% 96%',
  inputPlaceholder: '0 0% 56%',
};

export const BASE_DARK: ThemeColors = {
  surface0: '0 0% 12%',
  surface1: '0 0% 14.5%',
  surface2: '0 0% 18%',
  surface2Hover: '0 0% 22%',
  surface3: '0 0% 16.5%',
  surface4: '0 0% 20%',
  fg: '0 0% 90%',
  fgSecondary: '0 0% 63.9%',
  fgTertiary: '0 0% 48%',
  fgDisabled: '0 0% 35%',
  fgInverse: '0 0% 9%',
  fgLink: '0 0% 98%',
  fgSuccess: '142 71% 45%',
  fgWarning: '38 92% 50%',
  fgError: '0 62.8% 50%',
  borderSubtle: '0 0% 20%',
  borderDefault: '0 0% 25%',
  accent: '0 0% 10%',
  accentForeground: '0 0% 90%',
  accentHover: '0 0% 15%',
  sidebarAccent: '0 0% 10%',
  sidebarAccentForeground: '0 0% 90%',
  sidebarHover: '0 0% 9%',
  tabBg: '0 0% 18%',
  tabBgHover: '0 0% 22%',
  tabOutline: '0 0% 30%',
  inputBg: '0 0% 15%',
  inputBorder: '0 0% 22%',
  inputBorderHover: '0 0% 28%',
  inputBorderFocus: '0 0% 28%',
  inputBorderError: '0 62.8% 50%',
  inputBgDisabled: '0 0% 13%',
  inputPlaceholder: '0 0% 48%',
};

// ---------------------------------------------------------------------------
// Surface-contextual scopes
// ---------------------------------------------------------------------------
// Only surfaces where flat defaults produce poor contrast need overrides.
// Light: surface3/4 are 100% L — same as inputBg, so controls are invisible.
// Dark: surface2/3/4 are 18-20% L — inputBg at 15% sits below them.

export const SURFACE_SCOPES_LIGHT: SurfaceScopes = {
  // surfaces 0, 1, 2: flat defaults work fine
  '3': {
    inputBg: '0 0% 96%',
    inputBorder: '0 0% 82%',
    inputBorderHover: '0 0% 75%',
    inputBorderFocus: '0 0% 75%',
    inputBorderError: '0 84% 60%',
    inputBgDisabled: '0 0% 93%',
    inputPlaceholder: '0 0% 56%',
    tabBg: '0 0% 94%',
    tabBgHover: '0 0% 91%',
    tabOutline: '0 0% 78%',
    borderSubtle: '0 0% 85%',
    borderDefault: '0 0% 78%',
  },
  '4': {
    inputBg: '0 0% 96%',
    inputBorder: '0 0% 82%',
    inputBorderHover: '0 0% 75%',
    inputBorderFocus: '0 0% 75%',
    inputBorderError: '0 84% 60%',
    inputBgDisabled: '0 0% 93%',
    inputPlaceholder: '0 0% 56%',
    tabBg: '0 0% 94%',
    tabBgHover: '0 0% 91%',
    tabOutline: '0 0% 78%',
    borderSubtle: '0 0% 85%',
    borderDefault: '0 0% 78%',
  },
};

export const SURFACE_SCOPES_DARK: SurfaceScopes = {
  // surface 0, 1: flat defaults work fine
  '2': {
    // surface2 is 18% L — lift controls above it
    inputBg: '0 0% 22%',
    inputBorder: '0 0% 28%',
    inputBorderHover: '0 0% 34%',
    inputBorderFocus: '0 0% 34%',
    inputBorderError: '0 62.8% 50%',
    inputBgDisabled: '0 0% 16%',
    inputPlaceholder: '0 0% 48%',
    tabBg: '0 0% 24%',
    tabBgHover: '0 0% 28%',
    tabOutline: '0 0% 30%',
    borderSubtle: '0 0% 26%',
    borderDefault: '0 0% 30%',
  },
  '3': {
    // surface3 is 16.5% L
    inputBg: '0 0% 20%',
    inputBorder: '0 0% 26%',
    inputBorderHover: '0 0% 32%',
    inputBorderFocus: '0 0% 32%',
    inputBorderError: '0 62.8% 50%',
    inputBgDisabled: '0 0% 14%',
    inputPlaceholder: '0 0% 48%',
    tabBg: '0 0% 22%',
    tabBgHover: '0 0% 26%',
    tabOutline: '0 0% 28%',
    borderSubtle: '0 0% 24%',
    borderDefault: '0 0% 28%',
  },
  '4': {
    // surface4 is 20% L — highest elevation
    inputBg: '0 0% 24%',
    inputBorder: '0 0% 30%',
    inputBorderHover: '0 0% 36%',
    inputBorderFocus: '0 0% 36%',
    inputBorderError: '0 62.8% 50%',
    inputBgDisabled: '0 0% 18%',
    inputPlaceholder: '0 0% 48%',
    tabBg: '0 0% 26%',
    tabBgHover: '0 0% 30%',
    tabOutline: '0 0% 32%',
    borderSubtle: '0 0% 28%',
    borderDefault: '0 0% 32%',
  },
};

// ---------------------------------------------------------------------------
// Per-preset overrides (only tokens that differ from the base)
// ---------------------------------------------------------------------------

type PartialColors = Partial<ThemeColors> & {
  background?: string;
  panelBackground?: string;
  mainPanelBackground?: string;
  ring?: string;
};

export const PRESET_OVERRIDES: Record<ThemePresetId, {
  light?: PartialColors;
  dark?: PartialColors;
  surfaceScopesLight?: SurfaceScopes;
  surfaceScopesDark?: SurfaceScopes;
}> = {
  default: {},

  ocean: {
    light: {
      surface0: '210 100% 97%',
      surface1: '210 50% 99%',
      accent: '210 100% 94%',
      accentForeground: '210 100% 25%',
      accentHover: '210 100% 88%',
      sidebarAccent: '210 100% 50%',
      sidebarAccentForeground: '0 0% 100%',
      sidebarHover: '210 100% 92%',
      background: '210 100% 97%',
      panelBackground: '210 50% 99%',
      mainPanelBackground: '210 50% 99%',
      ring: '210 100% 50%',
    },
    dark: {
      surface0: '210 60% 5%',
      surface1: '210 50% 8%',
      accent: '210 80% 12%',
      accentForeground: '210 100% 90%',
      accentHover: '210 80% 18%',
      sidebarAccent: '210 100% 45%',
      sidebarAccentForeground: '0 0% 100%',
      sidebarHover: '210 60% 10%',
      background: '210 60% 5%',
      panelBackground: '210 50% 8%',
      mainPanelBackground: '210 50% 8%',
      ring: '210 100% 45%',
    },
  },

  forest: {
    light: {
      surface0: '142 76% 97%',
      surface1: '142 40% 99%',
      accent: '142 50% 92%',
      accentForeground: '142 70% 20%',
      accentHover: '142 50% 85%',
      sidebarAccent: '142 70% 40%',
      sidebarAccentForeground: '0 0% 100%',
      sidebarHover: '142 50% 90%',
      background: '142 76% 97%',
      panelBackground: '142 40% 99%',
      mainPanelBackground: '142 40% 99%',
      ring: '142 70% 40%',
    },
    dark: {
      surface0: '142 50% 4%',
      surface1: '142 40% 7%',
      accent: '142 40% 10%',
      accentForeground: '142 60% 85%',
      accentHover: '142 40% 16%',
      sidebarAccent: '142 60% 35%',
      sidebarAccentForeground: '0 0% 100%',
      sidebarHover: '142 40% 8%',
      background: '142 50% 4%',
      panelBackground: '142 40% 7%',
      mainPanelBackground: '142 40% 7%',
      ring: '142 60% 35%',
    },
  },

  berry: {
    light: {
      surface0: '280 100% 98%',
      surface1: '280 50% 99%',
      accent: '280 80% 94%',
      accentForeground: '280 80% 30%',
      accentHover: '280 80% 88%',
      sidebarAccent: '280 70% 55%',
      sidebarAccentForeground: '0 0% 100%',
      sidebarHover: '280 80% 92%',
      background: '280 100% 98%',
      panelBackground: '280 50% 99%',
      mainPanelBackground: '280 50% 99%',
      ring: '280 70% 55%',
    },
    dark: {
      surface0: '270 60% 5%',
      surface1: '270 50% 8%',
      accent: '280 50% 12%',
      accentForeground: '280 70% 90%',
      accentHover: '280 50% 18%',
      sidebarAccent: '280 60% 45%',
      sidebarAccentForeground: '0 0% 100%',
      sidebarHover: '280 50% 10%',
      background: '270 60% 5%',
      panelBackground: '270 50% 8%',
      mainPanelBackground: '270 50% 8%',
      ring: '280 60% 45%',
    },
  },

  doodles: {
    dark: {
      surface0: '0 0% 10%',
      surface1: '0 0% 10%',
    },
  },

  black: {
    dark: {
      surface0: '0 0% 2.7%',
      surface1: '240 6% 6.3%',
      surface2: '0 0% 9%',
      surface2Hover: '0 0% 13%',
      surface3: '240 4% 8%',
      surface4: '0 0% 12%',
      fg: '0 0% 85%',
      fgSecondary: '0 0% 55%',
      fgTertiary: '0 0% 42%',
      fgDisabled: '0 0% 28%',
      borderSubtle: '0 0% 12%',
      borderDefault: '0 0% 18%',
      accent: '0 0% 7%',
      accentForeground: '0 0% 90%',
      accentHover: '0 0% 11%',
      sidebarAccent: '0 0% 7%',
      sidebarAccentForeground: '0 0% 90%',
      sidebarHover: '0 0% 4%',
      tabBg: '0 0% 9%',
      tabBgHover: '0 0% 13%',
      tabOutline: '0 0% 20%',
      inputBg: '0 0% 7%',
      inputBorder: '0 0% 14%',
      inputBorderHover: '0 0% 20%',
      inputBorderFocus: '0 0% 20%',
      inputBgDisabled: '0 0% 5%',
      inputPlaceholder: '0 0% 42%',
      background: '0 0% 2.7%',
      panelBackground: '240 6% 4.5%',
      mainPanelBackground: '240 6% 6.3%',
    },
    surfaceScopesDark: {
      // black preset: surface2=9%, surface3=8%, surface4=12%
      '2': {
        inputBg: '0 0% 13%',
        inputBorder: '0 0% 18%',
        inputBorderHover: '0 0% 24%',
        inputBorderFocus: '0 0% 24%',
        inputBorderError: '0 62.8% 50%',
        inputBgDisabled: '0 0% 7%',
        inputPlaceholder: '0 0% 42%',
        tabBg: '0 0% 14%',
        tabBgHover: '0 0% 18%',
        tabOutline: '0 0% 22%',
        borderSubtle: '0 0% 16%',
        borderDefault: '0 0% 20%',
      },
      '3': {
        inputBg: '0 0% 12%',
        inputBorder: '0 0% 16%',
        inputBorderHover: '0 0% 22%',
        inputBorderFocus: '0 0% 22%',
        inputBorderError: '0 62.8% 50%',
        inputBgDisabled: '0 0% 6%',
        inputPlaceholder: '0 0% 42%',
        tabBg: '0 0% 13%',
        tabBgHover: '0 0% 17%',
        tabOutline: '0 0% 20%',
        borderSubtle: '0 0% 15%',
        borderDefault: '0 0% 18%',
      },
      '4': {
        inputBg: '0 0% 16%',
        inputBorder: '0 0% 22%',
        inputBorderHover: '0 0% 28%',
        inputBorderFocus: '0 0% 28%',
        inputBorderError: '0 62.8% 50%',
        inputBgDisabled: '0 0% 10%',
        inputPlaceholder: '0 0% 42%',
        tabBg: '0 0% 18%',
        tabBgHover: '0 0% 22%',
        tabOutline: '0 0% 26%',
        borderSubtle: '0 0% 20%',
        borderDefault: '0 0% 24%',
      },
    },
  },

  white: {
    light: {
      surface0: '0 0% 95%',
      surface1: '0 0% 100%',
      surface2: '0 0% 96.1%',
      surface2Hover: '0 0% 96%',
      surface3: '0 0% 100%',
      surface4: '0 0% 100%',
      borderSubtle: '0 0% 88%',
      borderDefault: '0 0% 80%',
      accent: '0 0% 96.1%',
      accentForeground: '0 0% 9%',
      accentHover: '0 0% 90%',
      sidebarAccent: '0 0% 96.1%',
      sidebarAccentForeground: '0 0% 9%',
      sidebarHover: '0 0% 95%',
      tabBg: '0 0% 93%',
      tabBgHover: '0 0% 90%',
      tabOutline: '0 0% 82%',
      inputBg: '0 0% 100%',
      inputBorder: '0 0% 88%',
      inputBorderHover: '0 0% 80%',
      inputBorderFocus: '0 0% 80%',
      inputBgDisabled: '0 0% 96%',
      inputPlaceholder: '0 0% 56%',
      background: '0 0% 95%',
      panelBackground: '0 0% 100%',
      mainPanelBackground: '0 0% 100%',
    },
    surfaceScopesLight: {
      // white preset: surface1=100%, surface3=100%, surface4=100%
      // On white surfaces, controls need visible contrast
      '1': {
        inputBg: '0 0% 96%',
        inputBorder: '0 0% 85%',
        inputBorderHover: '0 0% 78%',
        inputBorderFocus: '0 0% 78%',
        inputBorderError: '0 84% 60%',
        inputBgDisabled: '0 0% 93%',
        inputPlaceholder: '0 0% 56%',
        tabBg: '0 0% 94%',
        tabBgHover: '0 0% 91%',
        tabOutline: '0 0% 80%',
        borderSubtle: '0 0% 86%',
        borderDefault: '0 0% 78%',
      },
      '3': {
        inputBg: '0 0% 96%',
        inputBorder: '0 0% 85%',
        inputBorderHover: '0 0% 78%',
        inputBorderFocus: '0 0% 78%',
        inputBorderError: '0 84% 60%',
        inputBgDisabled: '0 0% 93%',
        inputPlaceholder: '0 0% 56%',
        tabBg: '0 0% 94%',
        tabBgHover: '0 0% 91%',
        tabOutline: '0 0% 80%',
        borderSubtle: '0 0% 86%',
        borderDefault: '0 0% 78%',
      },
      '4': {
        inputBg: '0 0% 96%',
        inputBorder: '0 0% 85%',
        inputBorderHover: '0 0% 78%',
        inputBorderFocus: '0 0% 78%',
        inputBorderError: '0 84% 60%',
        inputBgDisabled: '0 0% 93%',
        inputPlaceholder: '0 0% 56%',
        tabBg: '0 0% 94%',
        tabBgHover: '0 0% 91%',
        tabOutline: '0 0% 80%',
        borderSubtle: '0 0% 86%',
        borderDefault: '0 0% 78%',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Preset metadata (inlined from tokens/meta/presets.json for bundler compat)
// ---------------------------------------------------------------------------

export const THEME_PRESETS: Record<ThemePresetId, ThemePreset> = {
  default: {
    id: 'default',
    name: 'Default',
    description: 'Classic neutral grays',
    preview: {
      light: { bg: '#F2F1EE', accent: '#f5f5f5', text: '#171717' },
      dark: { bg: '#141414', accent: '#1a1a1a', text: '#fafafa' },
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep blue serenity',
    preview: {
      light: { bg: '#F0F7FF', accent: '#3B82F6', text: '#1E40AF' },
      dark: { bg: '#050D17', accent: '#2563EB', text: '#BFDBFE' },
    },
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    description: 'Natural green tones',
    preview: {
      light: { bg: '#F0FDF4', accent: '#22C55E', text: '#166534' },
      dark: { bg: '#040F09', accent: '#16A34A', text: '#BBF7D0' },
    },
  },
  berry: {
    id: 'berry',
    name: 'Berry',
    description: 'Rich purple vibes',
    preview: {
      light: { bg: '#FAF5FF', accent: '#A855F7', text: '#6B21A8' },
      dark: { bg: '#0D0514', accent: '#9333EA', text: '#E9D5FF' },
    },
  },
  doodles: {
    id: 'doodles',
    name: 'Doodles',
    description: 'Playful sketched background',
    preview: {
      light: { bg: '#F2F1EE', accent: '#e5e5e5', text: '#171717' },
      dark: { bg: '#1a1a1a', accent: '#262626', text: '#fafafa' },
    },
  },
  black: {
    id: 'black',
    name: 'Black',
    description: 'True black for OLED',
    allowedModes: ['dark'],
    preview: {
      light: { bg: '#F2F1EE', accent: '#f5f5f5', text: '#171717' },
      dark: { bg: '#070707', accent: '#0A0A0D', text: '#e0e0e0' },
    },
  },
  white: {
    id: 'white',
    name: 'White',
    description: 'Clean white surfaces',
    allowedModes: ['light'],
    preview: {
      light: { bg: '#FFFFFF', accent: '#f0f0f0', text: '#171717' },
      dark: { bg: '#141414', accent: '#1a1a1a', text: '#fafafa' },
    },
  },
};

export const THEME_PRESET_IDS: ThemePresetId[] = [
  'default', 'ocean', 'forest', 'berry', 'doodles', 'black', 'white',
];
