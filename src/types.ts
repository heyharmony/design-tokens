// @generated — do not edit manually. Run `npm run generate` to regenerate.

export type ThemePresetId = 'default' | 'ocean' | 'forest' | 'berry' | 'sand' | 'ayu' | 'doodles' | 'black' | 'white';

// Surface scoping
export type SurfaceLevel = '0' | '1' | '2' | '3' | '4';

export type SurfaceContextualToken =
  | 'borderDefault'
  | 'borderSubtle'
  | 'inputBg'
  | 'inputBgActive'
  | 'inputBgDisabled'
  | 'inputBgHighlight'
  | 'inputBorder'
  | 'inputBorderActive'
  | 'inputBorderError'
  | 'inputBorderFocus'
  | 'inputBorderHighlight'
  | 'inputBorderHover'
  | 'inputPlaceholder'
  | 'tabBg'
  | 'tabBgHover'
  | 'tabOutline';

export type SurfaceScopes = Partial<
  Record<SurfaceLevel, Partial<Pick<ThemeColors, SurfaceContextualToken>>>
>;

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Surfaces
  surface0: string;
  surface0Hover: string;
  surface0Active: string;
  surface0Highlight: string;
  surface1: string;
  surface1Hover: string;
  surface1Active: string;
  surface1Highlight: string;
  surface2: string;
  surface2Hover: string;
  surface2Active: string;
  surface2Highlight: string;
  surface3: string;
  surface3Hover: string;
  surface3Active: string;
  surface3Highlight: string;
  surface4: string;
  surface4Hover: string;
  surface4Active: string;
  surface4Highlight: string;
  // Foreground
  fg: string;
  fgSecondary: string;
  fgTertiary: string;
  fgDisabled: string;
  fgInverse: string;
  fgLink: string;
  fgSuccess: string;
  fgWarning: string;
  fgError: string;
  // Borders
  borderSubtle: string;
  borderDefault: string;
  borderSuccess: string;
  borderWarning: string;
  borderError: string;
  // Accent
  accent: string;
  accentForeground: string;
  accentHover: string;
  accentActive: string;
  accentSubtle: string;
  accentMuted: string;
  accentBorder: string;
  // Sidebar
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarHover: string;
  // Tabs
  tabBg: string;
  tabBgHover: string;
  tabOutline: string;
  // Inputs
  inputBg: string;
  inputBorder: string;
  inputBorderHover: string;
  inputBorderFocus: string;
  inputBorderError: string;
  inputBorderActive: string;
  inputBorderHighlight: string;
  inputBgActive: string;
  inputBgHighlight: string;
  inputBgDisabled: string;
  inputPlaceholder: string;
  // Semantic backgrounds
  bgSuccess: string;
  bgWarning: string;
  bgError: string;
}

export interface ThemePresetColors extends ThemeColors {
  // Optional extended tokens for web/desktop presets
  background?: string;
  panelBackground?: string;
  mainPanelBackground?: string;
  ring?: string;
  overlay?: string;
  surfaceGlass?: string;
  skeleton?: string;
}

export interface PresetPreview {
  bg: string;
  accent: string;
  text: string;
}

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  description: string;
  allowedModes?: ('light' | 'dark')[];
  preview: {
    light: PresetPreview;
    dark: PresetPreview;
  };
}

export interface ThemeShadows {
  shadow0: string;
  shadow1: string;
  shadow2: string;
  shadow3: string;
  shadow4: string;
}
