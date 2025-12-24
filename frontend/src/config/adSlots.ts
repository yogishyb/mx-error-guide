/**
 * AdSense Ad Slot Configuration
 *
 * Create ad units in your AdSense dashboard and add the slot IDs here.
 * Each slot should be created with the specified size for optimal performance.
 *
 * To get slot IDs:
 * 1. Go to https://www.google.com/adsense
 * 2. Click "Ads" > "By ad unit"
 * 3. Create new Display ads with recommended sizes
 * 4. Copy the data-ad-slot value
 */

export const AD_SLOTS = {
  // HomePage sidebar (300x600 Half Page)
  // High visibility, good for desktop users
  SIDEBAR: '8342524791',

  // HomePage bottom banner (728x90 Leaderboard)
  // Shown below error list pagination
  BOTTOM_BANNER: '8342524791',

  // In-feed ads - fluid in-article format
  // Blends naturally with error card list
  IN_FEED: '7029443121',

  // ErrorPage content ad - fluid in-article format
  // Blends with error detail content
  ERROR_DETAIL: '7029443121',

  // ReferencePage top banner
  REFERENCE_BANNER: '8342524791',

  // Mobile banner (320x50 or 320x100)
  MOBILE_BANNER: '8342524791',
} as const;

/**
 * Ad placement frequency settings
 *
 * Balanced for revenue + user experience:
 * - Ads placed at natural break points
 * - Not too frequent to annoy users
 * - Clearly styled to not deceive users
 */
export const AD_CONFIG = {
  // Show in-feed ad every N error cards (8 = less intrusive)
  IN_FEED_FREQUENCY: 8,

  // Minimum errors before showing first in-feed ad
  IN_FEED_MIN_ITEMS: 6,

  // Enable/disable specific ad placements
  ENABLE_SIDEBAR: true,        // Desktop only, non-intrusive
  ENABLE_BOTTOM_BANNER: true,  // After content, natural break
  ENABLE_IN_FEED: true,        // Integrated but clearly marked
  ENABLE_ERROR_DETAIL: true,   // At bottom of detail page
  ENABLE_MOBILE_BANNER: false, // Disabled - too intrusive on mobile

  // Development mode - show placeholder instead of real ads
  DEV_MODE: import.meta.env.DEV,
} as const;

/**
 * Check if ads should be shown
 * Can be extended with user preferences, subscription status, etc.
 */
export function shouldShowAds(): boolean {
  // In development, optionally hide ads
  if (AD_CONFIG.DEV_MODE) {
    return true; // Set to false to hide in dev
  }

  return true;
}
