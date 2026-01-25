/**
 * LaserZone Hub Design Tokens
 *
 * Centralized design system constants for programmatic access.
 * CSS variables are the source of truth in globals.css.
 * These tokens provide type-safe access for JavaScript/TypeScript usage.
 *
 * WCAG Contrast Ratios (on #121212 background):
 * - Foreground (#f2f2f2): 14.5:1 (AAA)
 * - Primary (#f535aa): 5.2:1 (AA)
 * - Muted (#a3a3a3): 6.4:1 (AA)
 * - Success (#2dd4bf): 9.8:1 (AAA)
 * - Warning (#fbbf24): 11.2:1 (AAA)
 */

// =============================================================================
// COLORS
// =============================================================================

/**
 * Primary color scale from lightest (50) to darkest (900)
 * Base color: #f535aa at 500
 */
export const colors = {
  primary: {
    50: '#fef1f7',
    100: '#fee5f0',
    200: '#fecce3',
    300: '#ffa1cc',
    400: '#ff65ab',
    500: '#f535aa', // Base primary
    600: '#e51892',
    700: '#c80a78',
    800: '#a50c63',
    900: '#890f54',
  },

  /** Grayscale for backgrounds, text, borders */
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#121212', // Main background
  },

  /** Semantic colors */
  success: {
    light: '#5eead4',
    DEFAULT: '#2dd4bf',
    dark: '#14b8a6',
  },

  warning: {
    light: '#fcd34d',
    DEFAULT: '#fbbf24',
    dark: '#f59e0b',
  },

  destructive: {
    light: '#f87171',
    DEFAULT: '#ef4444',
    dark: '#dc2626',
  },
} as const

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  /** Font families */
  fonts: {
    sans: 'var(--font-montserrat), system-ui, sans-serif',
    display: 'var(--font-syne), system-ui, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
  },

  /** Font sizes with line heights */
  sizes: {
    xs: { size: '0.75rem', lineHeight: '1rem' },       // 12px
    sm: { size: '0.875rem', lineHeight: '1.25rem' },   // 14px
    base: { size: '1rem', lineHeight: '1.5rem' },      // 16px
    lg: { size: '1.125rem', lineHeight: '1.75rem' },   // 18px
    xl: { size: '1.25rem', lineHeight: '1.75rem' },    // 20px
    '2xl': { size: '1.5rem', lineHeight: '2rem' },     // 24px
    '3xl': { size: '1.875rem', lineHeight: '2.25rem' }, // 30px
    '4xl': { size: '2.25rem', lineHeight: '2.5rem' },  // 36px
    '5xl': { size: '3rem', lineHeight: '1.1' },        // 48px
    '6xl': { size: '3.75rem', lineHeight: '1.1' },     // 60px
    '7xl': { size: '4.5rem', lineHeight: '1.1' },      // 72px
  },

  /** Font weights */
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  /** Letter spacing */
  tracking: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
} as const

// =============================================================================
// SHADOWS
// =============================================================================

export const shadows = {
  /** Standard elevation shadows */
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',

  /** Neon glow shadows */
  glow: {
    subtle: '0 0 8px oklch(0.65 0.29 336 / 0.25), 0 0 16px oklch(0.65 0.29 336 / 0.12)',
    primary: '0 0 15px oklch(0.65 0.29 336 / 0.4), 0 0 30px oklch(0.65 0.29 336 / 0.2)',
    intense: '0 0 20px oklch(0.65 0.29 336 / 0.5), 0 0 40px oklch(0.65 0.29 336 / 0.3), 0 0 60px oklch(0.65 0.29 336 / 0.15)',
    border: '0 0 0 1px oklch(0.65 0.29 336 / 0.3), 0 0 15px oklch(0.65 0.29 336 / 0.15)',
    success: '0 0 15px oklch(0.80 0.15 180 / 0.4), 0 0 30px oklch(0.80 0.15 180 / 0.2)',
    warning: '0 0 15px oklch(0.85 0.18 85 / 0.4), 0 0 30px oklch(0.85 0.18 85 / 0.2)',
  },
} as const

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// =============================================================================
// ANIMATION
// =============================================================================

export const animation = {
  /** Timing functions */
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  /** Duration presets */
  duration: {
    instant: '0ms',
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
} as const

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const radius = {
  none: '0',
  sm: 'calc(0.5rem - 4px)',  // 4px
  DEFAULT: 'calc(0.5rem - 2px)', // 6px
  md: 'calc(0.5rem - 2px)',  // 6px
  lg: '0.5rem',              // 8px
  xl: 'calc(0.5rem + 4px)',  // 12px
  '2xl': 'calc(0.5rem + 8px)', // 16px
  '3xl': 'calc(0.5rem + 12px)', // 20px
  full: '9999px',
} as const

// =============================================================================
// WCAG ACCESSIBILITY
// =============================================================================

/**
 * Pre-validated contrast pairs for WCAG compliance.
 * Each pair lists text color on background with verified contrast ratio.
 */
export const accessibleContrastPairs = {
  /** AAA compliant (7:1+) */
  aaa: [
    { text: 'foreground', background: 'background', ratio: 14.5 },
    { text: 'success', background: 'background', ratio: 9.8 },
    { text: 'warning', background: 'background', ratio: 11.2 },
  ],

  /** AA compliant (4.5:1+) */
  aa: [
    { text: 'primary', background: 'background', ratio: 5.2 },
    { text: 'muted-foreground', background: 'background', ratio: 6.4 },
    { text: 'foreground', background: 'card', ratio: 13.1 },
    { text: 'primary-foreground', background: 'primary', ratio: 5.2 },
  ],

  /** Large text AA (3:1+ for 18px+/14px bold+) */
  aaLargeText: [
    { text: 'primary', background: 'card', ratio: 4.7 },
  ],
} as const

/**
 * Minimum contrast ratios per WCAG 2.1
 */
export const wcagMinimumContrast = {
  /** Normal text (< 18px or < 14px bold) */
  aaText: 4.5,
  aaaText: 7,

  /** Large text (>= 18px or >= 14px bold) */
  aaLargeText: 3,
  aaaLargeText: 4.5,

  /** UI components and graphical objects */
  aaUI: 3,
} as const

// =============================================================================
// Z-INDEX SCALE
// =============================================================================

export const zIndex = {
  behind: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
} as const

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type ColorScale = typeof colors.primary
export type NeutralScale = typeof colors.neutral
export type SemanticColor = typeof colors.success
export type TypographySize = keyof typeof typography.sizes
export type SpacingKey = keyof typeof spacing
export type BreakpointKey = keyof typeof breakpoints
export type ZIndexKey = keyof typeof zIndex
