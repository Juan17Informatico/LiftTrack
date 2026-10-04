export const darkColors = {
  background: '#0f1216',
  surface: '#171c22',
  surfaceMuted: '#202731',
  border: '#2d3542',
  text: '#f6f8fb',
  textMuted: '#9ea8b7',
  primary: '#7dd3fc',
  primaryStrong: '#38bdf8',
  success: '#34d399',
  danger: '#fb7185',
  warning: '#fbbf24',
  ink: '#111827',
  white: '#ffffff',
  onDanger: '#111827',
};

export type ThemeColors = typeof darkColors;

export const lightColors: ThemeColors = {
  background: '#f3f6fa',
  surface: '#ffffff',
  surfaceMuted: '#e8eef5',
  border: '#c4cfdd',
  text: '#142033',
  textMuted: '#506176',
  primary: '#0369a1',
  primaryStrong: '#075985',
  success: '#047857',
  danger: '#be123c',
  warning: '#92400e',
  ink: '#ffffff',
  white: '#ffffff',
  onDanger: '#ffffff',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 8,
};
