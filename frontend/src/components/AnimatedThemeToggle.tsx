import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconButton, Tooltip, alpha, useTheme as useMuiTheme } from '@mui/material';
import { useTheme } from '../context/ThemeContext';

/**
 * Linear Aesthetic Animated Theme Toggle
 *
 * Features:
 * - Smooth rotation and scale animation on toggle
 * - Spring physics (stiffness: 260, damping: 20)
 * - Sun/Moon icon morph effect
 * - Magnetic hover effect
 */

// Spring animation config (Linear Aesthetic standard)
const springConfig = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 20,
};

// Sun rays for light mode icon
const SunIcon: FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

// Moon icon for dark mode
const MoonIcon: FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

interface AnimatedThemeToggleProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'fab' | 'minimal';
}

export const AnimatedThemeToggle: FC<AnimatedThemeToggleProps> = ({
  size = 'medium',
  variant = 'default',
}) => {
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const isDark = mode === 'dark';

  const iconVariants = {
    initial: {
      scale: 0.5,
      rotate: -180,
      opacity: 0
    },
    animate: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: springConfig,
    },
    exit: {
      scale: 0.5,
      rotate: 180,
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: springConfig,
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 },
    },
  };

  const getButtonStyles = () => {
    const baseStyles = {
      borderRadius: 2,
      transition: 'all 0.2s ease',
    };

    switch (variant) {
      case 'fab':
        return {
          ...baseStyles,
          bgcolor: alpha(muiTheme.palette.primary.main, 0.1),
          backdropFilter: 'blur(8px)',
          border: `1px solid ${alpha(muiTheme.palette.primary.main, 0.3)}`,
          color: 'primary.main',
          '&:hover': {
            bgcolor: alpha(muiTheme.palette.primary.main, 0.2),
            borderColor: muiTheme.palette.primary.main,
          },
        };
      case 'minimal':
        return {
          ...baseStyles,
          color: 'text.secondary',
          '&:hover': {
            bgcolor: 'action.hover',
            color: 'text.primary',
          },
        };
      default:
        return {
          ...baseStyles,
          bgcolor: isDark ? alpha('#ffffff', 0.05) : alpha('#000000', 0.05),
          border: `1px solid ${isDark ? alpha('#ffffff', 0.1) : alpha('#000000', 0.1)}`,
          color: 'text.primary',
          '&:hover': {
            bgcolor: isDark ? alpha('#ffffff', 0.1) : alpha('#000000', 0.08),
            borderColor: isDark ? alpha('#ffffff', 0.2) : alpha('#000000', 0.15),
          },
        };
    }
  };

  return (
    <Tooltip
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      placement="bottom"
      arrow
    >
      <motion.div
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        style={{ display: 'inline-flex' }}
      >
        <IconButton
          onClick={toggleTheme}
          size={size}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          sx={getButtonStyles()}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </motion.div>
          </AnimatePresence>
        </IconButton>
      </motion.div>
    </Tooltip>
  );
};
