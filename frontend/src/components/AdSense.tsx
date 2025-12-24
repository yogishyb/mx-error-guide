import { useEffect, useRef, memo } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

// Show placeholder in development mode
const DEV_MODE = import.meta.env.DEV;

export type AdFormat = 'auto' | 'rectangle' | 'horizontal' | 'vertical';
export type AdSize =
  | 'responsive'
  | '300x250'   // Medium Rectangle
  | '336x280'   // Large Rectangle
  | '728x90'    // Leaderboard
  | '970x90'    // Large Leaderboard
  | '300x600'   // Half Page
  | '320x50'    // Mobile Banner
  | '320x100';  // Large Mobile Banner

interface AdSenseProps {
  slot: string;
  format?: AdFormat;
  size?: AdSize;
  style?: React.CSSProperties;
  responsive?: boolean;
  className?: string;
  // Hide on mobile to reduce clutter
  hideOnMobile?: boolean;
  // Lazy load when visible
  lazyLoad?: boolean;
}

// Your AdSense publisher ID
const ADSENSE_CLIENT = 'ca-pub-1990513836503098';

/**
 * AdSense Display Ad Component
 *
 * Optimized for:
 * - Lazy loading (loads when visible)
 * - Responsive sizing
 * - Mobile-aware display
 * - Minimal layout shift (CLS)
 */
const AdSense = memo(function AdSense({
  slot,
  format = 'auto',
  size = 'responsive',
  style,
  responsive = true,
  className,
  hideOnMobile = false,
  lazyLoad = true,
}: AdSenseProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isLoaded = useRef(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Don't render on mobile if hideOnMobile is true
  if (hideOnMobile && isMobile) {
    return null;
  }

  // Calculate dimensions based on size
  const getDimensions = (): { width: string; height: string; minHeight: string } => {
    if (size === 'responsive') {
      return { width: '100%', height: 'auto', minHeight: '90px' };
    }
    const [w, h] = size.split('x');
    return { width: `${w}px`, height: `${h}px`, minHeight: `${h}px` };
  };

  // Show placeholder in development mode
  if (DEV_MODE) {
    const dims = getDimensions();
    return (
      <Box
        className={className}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: dims.width,
          minHeight: dims.minHeight,
          height: size === 'responsive' ? 'auto' : dims.height,
          bgcolor: 'rgba(255, 193, 7, 0.1)',
          border: '2px dashed rgba(255, 193, 7, 0.5)',
          borderRadius: 1,
          color: 'warning.main',
          fontSize: '12px',
          textAlign: 'center',
          p: 1,
          ...style,
        }}
      >
        <Box sx={{ fontSize: '18px', mb: 0.5 }}>📢</Box>
        <Box sx={{ fontWeight: 'bold' }}>AD PLACEHOLDER</Box>
        <Box sx={{ opacity: 0.7, fontSize: '10px' }}>{size}</Box>
        <Box sx={{ opacity: 0.5, fontSize: '9px' }}>slot: {slot}</Box>
      </Box>
    );
  }

  useEffect(() => {
    // Prevent multiple ad loads
    if (isLoaded.current) return;

    const loadAd = () => {
      try {
        if (window.adsbygoogle && adRef.current) {
          // Check if ad is already loaded
          if (adRef.current.dataset.adsbygoogleStatus === 'done') {
            return;
          }

          (window.adsbygoogle = window.adsbygoogle || []).push({});
          isLoaded.current = true;
        }
      } catch (error) {
        // AdSense errors are common, fail silently
        console.debug('AdSense load error:', error);
      }
    };

    if (lazyLoad) {
      // Use Intersection Observer for lazy loading
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadAd();
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: '200px', // Load 200px before visible
          threshold: 0,
        }
      );

      if (adRef.current) {
        observer.observe(adRef.current);
      }

      return () => observer.disconnect();
    } else {
      // Load immediately
      loadAd();
    }
  }, [lazyLoad]);

  const dimensions = getDimensions();

  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: dimensions.width,
        minHeight: dimensions.minHeight,
        overflow: 'hidden',
        // Prevent layout shift
        contain: 'layout',
        ...style,
      }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          width: dimensions.width,
          height: size === 'responsive' ? 'auto' : dimensions.height,
        }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </Box>
  );
});

/**
 * Horizontal Banner Ad (728x90 or responsive)
 */
export function BannerAd({
  slot,
  hideOnMobile = false
}: {
  slot: string;
  hideOnMobile?: boolean;
}) {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        my: 2,
        px: 1,
      }}
    >
      <AdSense
        slot={slot}
        format="horizontal"
        size="responsive"
        hideOnMobile={hideOnMobile}
        style={{ maxWidth: '728px', width: '100%' }}
      />
    </Box>
  );
}

/**
 * Rectangle Ad for inline placement (300x250)
 */
export function RectangleAd({
  slot,
  centered = true,
}: {
  slot: string;
  centered?: boolean;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: centered ? 'center' : 'flex-start',
        my: 2,
      }}
    >
      <AdSense
        slot={slot}
        format="rectangle"
        size="300x250"
        responsive={false}
      />
    </Box>
  );
}

/**
 * Sidebar Ad (300x600 Half Page)
 */
export function SidebarAd({ slot }: { slot: string }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Only show on desktop
  if (!isDesktop) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 100, // Below header
        width: 300,
        flexShrink: 0,
      }}
    >
      <AdSense
        slot={slot}
        format="vertical"
        size="300x600"
        responsive={false}
      />
    </Box>
  );
}

/**
 * Mobile Banner Ad (320x50 or 320x100)
 */
export function MobileBannerAd({
  slot,
  large = false,
}: {
  slot: string;
  large?: boolean;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Only show on mobile
  if (!isMobile) {
    return null;
  }

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        my: 1,
      }}
    >
      <AdSense
        slot={slot}
        format="horizontal"
        size={large ? '320x100' : '320x50'}
        responsive={false}
      />
    </Box>
  );
}

/**
 * In-feed Ad for lists - uses fluid in-article format
 * Blends naturally with content
 */
export function InFeedAd({ slot }: { slot: string }) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    // Skip in dev mode
    if (DEV_MODE) return;

    try {
      if (window.adsbygoogle && adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch {
      // Silent fail
    }
  }, []);

  // Dev mode placeholder
  if (DEV_MODE) {
    return (
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 2,
          my: 1,
          bgcolor: 'rgba(255, 193, 7, 0.1)',
          border: '2px dashed rgba(255, 193, 7, 0.5)',
          borderRadius: 2,
          color: 'warning.main',
        }}
      >
        <Box sx={{ fontSize: '18px', mb: 0.5 }}>📢</Box>
        <Box sx={{ fontWeight: 'bold', fontSize: '12px' }}>IN-ARTICLE AD</Box>
        <Box sx={{ opacity: 0.7, fontSize: '10px' }}>fluid format</Box>
        <Box sx={{ opacity: 0.5, fontSize: '9px' }}>slot: {slot}</Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 2,
        my: 1,
        bgcolor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 2,
        border: '1px dashed rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Clear ad label for transparency */}
      <Box
        component="span"
        sx={{
          fontSize: '10px',
          color: 'text.disabled',
          textTransform: 'uppercase',
          letterSpacing: 1,
          mb: 1,
        }}
      >
        Advertisement
      </Box>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-1990513836503098"
        data-ad-slot={slot}
      />
    </Box>
  );
}

export default AdSense;
