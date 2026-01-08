import { memo, useState, useCallback, useRef } from 'react';
import type { FC, KeyboardEvent } from 'react';
import { IconButton, Popover, Tooltip, CircularProgress, Box } from '@mui/material';
import { HelpOutline as HelpOutlineIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { GlossaryPopover } from './GlossaryPopover';
import { useGlossary, type GlossaryTerm } from '../hooks/useGlossary';

interface HelpIconProps {
  /** The glossary term ID or display name to look up */
  term: string;
  /** Size of the icon - 'small' (14px), 'medium' (18px), or 'large' (22px) */
  size?: 'small' | 'medium' | 'large';
  /** Custom color for the icon */
  color?: 'inherit' | 'primary' | 'secondary' | 'default';
  /** Whether to show inline (no button wrapper) */
  inline?: boolean;
  /** Callback when a related term is clicked */
  onRelatedTermClick?: (termId: string) => void;
  /** Custom aria-label */
  ariaLabel?: string;
}

// Motion wrapper for IconButton
const MotionIconButton = motion.create(IconButton);

// Size mappings
const sizeMap = {
  small: 14,
  medium: 18,
  large: 22,
};

const buttonSizeMap = {
  small: 20,
  medium: 24,
  large: 28,
};

export const HelpIcon: FC<HelpIconProps> = memo(
  ({
    term,
    size = 'small',
    color = 'default',
    inline = false,
    onRelatedTermClick,
    ariaLabel,
  }) => {
    const { getTerm, loading } = useGlossary();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [currentTerm, setCurrentTerm] = useState<GlossaryTerm | undefined>(undefined);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const open = Boolean(anchorEl);
    const id = open ? `glossary-popover-${term}` : undefined;

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation(); // Prevent event bubbling to parent elements
        const foundTerm = getTerm(term);
        setCurrentTerm(foundTerm);
        setAnchorEl(event.currentTarget);
      },
      [getTerm, term]
    );

    const handleClose = useCallback(() => {
      setAnchorEl(null);
    }, []);

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          const foundTerm = getTerm(term);
          setCurrentTerm(foundTerm);
          setAnchorEl(event.currentTarget);
        }
        if (event.key === 'Escape' && open) {
          handleClose();
          buttonRef.current?.focus();
        }
      },
      [getTerm, term, open, handleClose]
    );

    const handleRelatedTermClick = useCallback(
      (termId: string) => {
        const foundTerm = getTerm(termId);
        if (foundTerm) {
          setCurrentTerm(foundTerm);
        }
        if (onRelatedTermClick) {
          onRelatedTermClick(termId);
        }
      },
      [getTerm, onRelatedTermClick]
    );

    // If loading, show a small loading indicator
    if (loading) {
      return (
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: buttonSizeMap[size],
            height: buttonSizeMap[size],
          }}
        >
          <CircularProgress size={sizeMap[size] - 4} />
        </Box>
      );
    }

    const iconElement = (
      <HelpOutlineIcon
        sx={{
          fontSize: sizeMap[size],
          color: color === 'default' ? 'text.secondary' : undefined,
          opacity: 0.7,
          transition: 'opacity 0.15s ease',
        }}
      />
    );

    // Inline mode - just the icon, no button wrapper
    if (inline) {
      return (
        <Tooltip title={`Learn about ${term.replace(/_/g, ' ')}`}>
          <Box
            component="span"
            onClick={handleClick}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              cursor: 'pointer',
              verticalAlign: 'middle',
              ml: 0.5,
              '&:hover': {
                '& .MuiSvgIcon-root': {
                  opacity: 1,
                },
              },
            }}
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown as unknown as React.KeyboardEventHandler<HTMLSpanElement>}
            aria-label={ariaLabel || `Help: ${term.replace(/_/g, ' ')}`}
            aria-describedby={id}
          >
            {iconElement}
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    overflow: 'visible',
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                  },
                },
              }}
            >
              {currentTerm ? (
                <GlossaryPopover
                  term={currentTerm}
                  onClose={handleClose}
                  onTermClick={handleRelatedTermClick}
                />
              ) : (
                <Box sx={{ p: 2, color: 'text.secondary' }}>Term not found: {term}</Box>
              )}
            </Popover>
          </Box>
        </Tooltip>
      );
    }

    // Button mode - wrapped in IconButton
    return (
      <>
        <Tooltip title={`Learn about ${term.replace(/_/g, ' ')}`}>
          <MotionIconButton
            ref={buttonRef}
            aria-label={ariaLabel || `Help: ${term.replace(/_/g, ' ')}`}
            aria-describedby={id}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            size="small"
            color={color === 'default' ? undefined : color}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            sx={{
              width: buttonSizeMap[size],
              height: buttonSizeMap[size],
              p: 0,
              '&:hover': {
                bgcolor: 'action.hover',
                '& .MuiSvgIcon-root': {
                  opacity: 1,
                },
              },
            }}
          >
            {iconElement}
          </MotionIconButton>
        </Tooltip>

        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                overflow: 'visible',
                bgcolor: 'transparent',
                boxShadow: 'none',
              },
            },
          }}
        >
          {currentTerm ? (
            <GlossaryPopover
              term={currentTerm}
              onClose={handleClose}
              onTermClick={handleRelatedTermClick}
            />
          ) : (
            <Box sx={{ p: 2, color: 'text.secondary' }}>Term not found: {term}</Box>
          )}
        </Popover>
      </>
    );
  }
);

HelpIcon.displayName = 'HelpIcon';

/**
 * A convenience component for adding help text with an inline icon
 * Usage: <TermWithHelp term="ordering_bank">Ordering Bank</TermWithHelp>
 */
interface TermWithHelpProps {
  term: string;
  children: React.ReactNode;
  onRelatedTermClick?: (termId: string) => void;
}

export const TermWithHelp: FC<TermWithHelpProps> = memo(
  ({ term, children, onRelatedTermClick }) => {
    return (
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
        {children}
        <HelpIcon term={term} inline size="small" onRelatedTermClick={onRelatedTermClick} />
      </Box>
    );
  }
);

TermWithHelp.displayName = 'TermWithHelp';
