export type ThemePresetId = 'default' | 'ocean' | 'forest' | 'berry' | 'doodles' | 'black' | 'white';

// Surface scoping
export type SurfaceLevel = '0' | '1' | '2' | '3' | '4';

export type SurfaceContextualToken =
  | 'inputBg' | 'inputBorder' | 'inputBorderHover' | 'inputBorderFocus'
  | 'inputBorderError' | 'inputBgDisabled' | 'inputPlaceholder'
  | 'tabBg' | 'tabBgHover' | 'tabOutline'
  | 'borderSubtle' | 'borderDefault';

export type SurfaceScopes = Partial<
  Record<SurfaceLevel, Partial<Pick<ThemeColors, SurfaceContextualToken>>>
>;

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Surfaces
  surface0: string;
  surface0Hover: string;
  surface1: string;
  surface1Hover: string;
  surface2: string;
  surface2Hover: string;
  surface3: string;
  surface3Hover: string;
  surface4: string;
  surface4Hover: string;
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
  // Accent
  accent: string;
  accentForeground: string;
  accentHover: string;
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
  inputBgDisabled: string;
  inputPlaceholder: string;
}

export interface ThemePresetColors extends ThemeColors {
  // Optional extended tokens for web/desktop presets
  background?: string;
  panelBackground?: string;
  mainPanelBackground?: string;
  ring?: string;
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
