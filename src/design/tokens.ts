/**
 * Design Tokens System
 * Scalable design foundation for Orchestra UI
 */

export const colors = {
  // Primary - Modern blue palette for main actions
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Success - Green palette
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },

  // Warning - Amber palette
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },

  // Error - Red palette
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },

  // Neutral - Modern gray scale
  neutral: {
    0: '#ffffff',
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
    950: '#0a0a0a',
  },

  // Gradient presets for avatars and backgrounds
  gradients: {
    blue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    purple: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    green: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    orange: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    pink: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  },
} as const;

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
  32: '8rem',       // 128px
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  DEFAULT: '0.5rem', // 8px
  md: '0.625rem',   // 10px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.25rem', // 20px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

export const shadows = {
  // Elevation system for depth
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  none: 'none',
} as const;

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1' }],         // 48px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const animation = {
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },
  easing: {
    // Smooth easing curves
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Agent color mappings - modern gradients
export const agentColors = {
  'bg-blue-500': {
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-500',
    text: 'text-blue-600',
    border: 'border-blue-200',
    bgLight: 'bg-blue-50',
  },
  'bg-green-500': {
    gradient: 'from-green-500 to-green-600',
    bg: 'bg-green-500',
    text: 'text-green-600',
    border: 'border-green-200',
    bgLight: 'bg-green-50',
  },
  'bg-yellow-500': {
    gradient: 'from-yellow-500 to-yellow-600',
    bg: 'bg-yellow-500',
    text: 'text-yellow-600',
    border: 'border-yellow-200',
    bgLight: 'bg-yellow-50',
  },
  'bg-orange-500': {
    gradient: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-500',
    text: 'text-orange-600',
    border: 'border-orange-200',
    bgLight: 'bg-orange-50',
  },
  'bg-red-500': {
    gradient: 'from-red-500 to-red-600',
    bg: 'bg-red-500',
    text: 'text-red-600',
    border: 'border-red-200',
    bgLight: 'bg-red-50',
  },
  'bg-purple-500': {
    gradient: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-500',
    text: 'text-purple-600',
    border: 'border-purple-200',
    bgLight: 'bg-purple-50',
  },
  'bg-pink-500': {
    gradient: 'from-pink-500 to-pink-600',
    bg: 'bg-pink-500',
    text: 'text-pink-600',
    border: 'border-pink-200',
    bgLight: 'bg-pink-50',
  },
  'bg-indigo-500': {
    gradient: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-500',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
    bgLight: 'bg-indigo-50',
  },
} as const;
