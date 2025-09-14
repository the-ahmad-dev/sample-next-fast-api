export const SPACING = {
  SIDEBAR_PADDING: "p-4",
  SIDEBAR_ITEM_PADDING: "px-3 py-2",
  SIDEBAR_CONTENT_PADDING: "px-4 py-6",
  HEADER_HEIGHT: "h-16",
  SIDEBAR_ITEM_INDENT: "ml-6",
  ICON_SIZE: "h-5 w-5",
  CHEVRON_SIZE: "h-4 w-4",
} as const;

export const LOGO = {
  SVG_SIZE: 32,
  CIRCLE_MAIN: { cx: 12, cy: 12, r: 8 },
  CIRCLE_SECONDARY: { cx: 20, cy: 20, r: 6 },
  CIRCLE_ACCENT: { cx: 8, cy: 24, r: 4 },
} as const;

export const BREAKPOINTS = {
  SM: "640px",
  MD: "768px",
  LG: "1024px",
  XL: "1280px",
  "2XL": "1536px",
} as const;
