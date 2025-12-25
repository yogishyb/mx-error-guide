import { createTheme, type Theme, type ThemeOptions } from '@mui/material/styles';

/**
 * Linear-Inspired Theme System
 *
 * Design Philosophy:
 * - Minimalist and clean
 * - Neutral colors with subtle accents
 * - No flashy effects, calm and professional
 * - Focus on content, not chrome
 * - Generous whitespace
 */

// Linear's actual color palette
const linearColors = {
  // Backgrounds
  dark: {
    bg: '#1a1a1a',           // Linear's dark background
    bgElevated: '#232323',   // Slightly elevated surfaces
    bgHover: '#2a2a2a',      // Hover state
    border: '#333333',       // Subtle borders
    borderLight: '#404040',  // Lighter borders for emphasis
  },
  light: {
    bg: '#ffffff',           // Pure white
    bgElevated: '#f9f9f9',   // Slightly off-white
    bgHover: '#f3f3f3',      // Hover state
    border: '#e8e8e8',       // Light gray borders
    borderLight: '#d1d1d1',  // Slightly darker for emphasis
  },
  // Text
  text: {
    darkPrimary: '#ebebeb',     // Off-white for dark mode
    darkSecondary: '#858585',   // Muted gray
    darkTertiary: '#5c5c5c',    // Even more muted
    lightPrimary: '#171717',    // Almost black
    lightSecondary: '#6b6b6b',  // Medium gray
    lightTertiary: '#9c9c9c',   // Light gray
  },
  // Accents - used sparingly
  accent: {
    blue: '#5e6ad2',         // Linear's signature blue (use sparingly)
    blueHover: '#6872d9',    // Hover state
    green: '#4da567',        // Success/positive
    red: '#e5534b',          // Error/destructive
    orange: '#d29922',       // Warning
    purple: '#8b5cf6',       // Premium/special
  },
};

// Common theme options
const commonOptions: ThemeOptions = {
  shape: {
    borderRadius: 6,
  },
  typography: {
    fontFamily: '"Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    // Geist Mono for code/monospace elements
    // Usage: fontFamily: 'var(--font-mono)' or theme.typography.fontFamilyMono
    h1: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      lineHeight: 1.3,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.35,
    },
    h3: {
      fontSize: '1.125rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '0.9rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '0.85rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '0.9rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
    button: {
      fontSize: '0.8125rem',
      fontWeight: 500,
      textTransform: 'none' as const,
    },
  },
};

// Geist Mono font family for code elements
const fontFamilyMono = '"Geist Mono", "SF Mono", "Fira Code", "Consolas", monospace';

// Component overrides for both themes
const createComponentOverrides = (isDark: boolean): ThemeOptions['components'] => ({
  MuiCssBaseline: {
    styleOverrides: {
      ':root': {
        '--font-mono': fontFamilyMono,
      },
      body: {
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: isDark ? '#404040' : '#d1d1d1',
          borderRadius: '4px',
          '&:hover': {
            background: isDark ? '#505050' : '#b1b1b1',
          },
        },
      },
      // Global smooth transitions
      '*, *::before, *::after': {
        transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
        borderRadius: 6,
        padding: '6px 12px',
        minHeight: 32,
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
        },
        '&:active': {
          transform: 'scale(0.98)',
        },
      },
      contained: {
        '&:hover': {
          boxShadow: 'none',
        },
      },
      outlined: {
        borderColor: isDark ? linearColors.dark.border : linearColors.light.border,
        '&:hover': {
          borderColor: isDark ? linearColors.dark.borderLight : linearColors.light.borderLight,
          backgroundColor: isDark ? linearColors.dark.bgHover : linearColors.light.bgHover,
        },
      },
      text: {
        '&:hover': {
          backgroundColor: isDark ? linearColors.dark.bgHover : linearColors.light.bgHover,
        },
      },
    },
    defaultProps: {
      disableElevation: true,
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        backgroundColor: isDark ? linearColors.dark.bgElevated : linearColors.light.bg,
        border: `1px solid ${isDark ? linearColors.dark.border : linearColors.light.border}`,
        borderRadius: 8,
        boxShadow: 'none',
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
        '&:hover': {
          borderColor: isDark ? linearColors.dark.borderLight : linearColors.light.borderLight,
        },
      },
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: 16,
        '&:last-child': {
          paddingBottom: 16,
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: 500,
        fontSize: '0.75rem',
        height: 24,
        borderRadius: 4,
      },
      outlined: {
        borderColor: isDark ? linearColors.dark.border : linearColors.light.border,
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 6,
          backgroundColor: isDark ? linearColors.dark.bgElevated : linearColors.light.bg,
          '& fieldset': {
            borderColor: isDark ? linearColors.dark.border : linearColors.light.border,
          },
          '&:hover fieldset': {
            borderColor: isDark ? linearColors.dark.borderLight : linearColors.light.borderLight,
          },
          '&.Mui-focused fieldset': {
            borderColor: linearColors.accent.blue,
            borderWidth: 1,
          },
        },
      },
    },
  },
  MuiSelect: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: isDark ? linearColors.dark.border : linearColors.light.border,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: isDark ? linearColors.dark.borderLight : linearColors.light.borderLight,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: linearColors.accent.blue,
          borderWidth: 1,
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        backgroundColor: isDark ? linearColors.dark.bgElevated : linearColors.light.bg,
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        backgroundColor: isDark
          ? `${linearColors.dark.bg}f2`  // 95% opacity
          : `${linearColors.light.bg}f2`,
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${isDark ? linearColors.dark.border : linearColors.light.border}`,
        boxShadow: 'none',
      },
    },
  },
  MuiToolbar: {
    styleOverrides: {
      root: {
        minHeight: '56px !important',
      },
    },
  },
  MuiFab: {
    styleOverrides: {
      root: {
        boxShadow: isDark
          ? '0 2px 8px rgba(0, 0, 0, 0.4)'
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
        '&:hover': {
          boxShadow: isDark
            ? '0 4px 12px rgba(0, 0, 0, 0.5)'
            : '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: isDark ? '#333333' : '#1a1a1a',
        color: '#ffffff',
        fontSize: '0.75rem',
        borderRadius: 4,
        padding: '6px 10px',
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: isDark ? linearColors.dark.border : linearColors.light.border,
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        '&:hover': {
          backgroundColor: isDark ? linearColors.dark.bgHover : linearColors.light.bgHover,
        },
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        border: `1px solid ${isDark ? linearColors.dark.border : linearColors.light.border}`,
        borderRadius: 8,
        boxShadow: isDark
          ? '0 4px 16px rgba(0, 0, 0, 0.4)'
          : '0 4px 16px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        fontSize: '0.875rem',
        minHeight: 36,
        '&:hover': {
          backgroundColor: isDark ? linearColors.dark.bgHover : linearColors.light.bgHover,
        },
        '&.Mui-selected': {
          backgroundColor: isDark ? linearColors.dark.bgHover : linearColors.light.bgHover,
          '&:hover': {
            backgroundColor: isDark ? '#333333' : '#ebebeb',
          },
        },
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        border: `1px solid ${isDark ? linearColors.dark.border : linearColors.light.border}`,
        borderRadius: 12,
        boxShadow: isDark
          ? '0 8px 32px rgba(0, 0, 0, 0.5)'
          : '0 8px 32px rgba(0, 0, 0, 0.12)',
      },
    },
  },
});

// Light theme
export const lightTheme: Theme = createTheme({
  ...commonOptions,
  palette: {
    mode: 'light',
    primary: {
      main: linearColors.accent.blue,
      light: linearColors.accent.blueHover,
      dark: '#4e5ac1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: linearColors.text.lightSecondary,
      light: linearColors.text.lightTertiary,
      dark: linearColors.text.lightPrimary,
    },
    error: {
      main: linearColors.accent.red,
    },
    warning: {
      main: linearColors.accent.orange,
    },
    success: {
      main: linearColors.accent.green,
    },
    background: {
      default: linearColors.light.bg,
      paper: linearColors.light.bg,
    },
    text: {
      primary: linearColors.text.lightPrimary,
      secondary: linearColors.text.lightSecondary,
    },
    divider: linearColors.light.border,
    action: {
      hover: linearColors.light.bgHover,
      selected: linearColors.light.bgHover,
    },
  },
  components: createComponentOverrides(false),
});

// Dark theme
export const darkTheme: Theme = createTheme({
  ...commonOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: linearColors.accent.blue,
      light: linearColors.accent.blueHover,
      dark: '#4e5ac1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: linearColors.text.darkSecondary,
      light: linearColors.text.darkTertiary,
      dark: linearColors.text.darkPrimary,
    },
    error: {
      main: linearColors.accent.red,
    },
    warning: {
      main: linearColors.accent.orange,
    },
    success: {
      main: linearColors.accent.green,
    },
    background: {
      default: linearColors.dark.bg,
      paper: linearColors.dark.bgElevated,
    },
    text: {
      primary: linearColors.text.darkPrimary,
      secondary: linearColors.text.darkSecondary,
    },
    divider: linearColors.dark.border,
    action: {
      hover: linearColors.dark.bgHover,
      selected: linearColors.dark.bgHover,
    },
  },
  components: createComponentOverrides(true),
});

// Export function to get theme by mode
export const getTheme = (mode: 'light' | 'dark'): Theme => {
  return mode === 'light' ? lightTheme : darkTheme;
};

// Export color constants for direct use in components
export const colors = linearColors;

// Export Geist Mono font family for code elements
export const monoFontFamily = fontFamilyMono;
