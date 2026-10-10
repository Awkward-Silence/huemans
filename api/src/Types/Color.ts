// The four group colors, named as in web/. Declaration order is the tie-break order for assignment.
export const COLORS = ['amber', 'coral', 'teal', 'violet'] as const;

export type ColorValue = (typeof COLORS)[number];

// RGB as #RRGGBB, matching each group's background in web/src/theme/themes/default.ts.
export const COLOR_HEX: Record<ColorValue, string> = {
  amber: '#F5B13F',
  coral: '#EE5E7B',
  teal: '#0E8176',
  violet: '#4A3DC9',
};
