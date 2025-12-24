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
  SIDEBAR: '8342524791',

  // HomePage top banner - after intro, before results
  TOP_BANNER: '8342524791',

  // HomePage bottom banner - after pagination
  BOTTOM_BANNER: '8342524791',

  // In-feed ads - fluid in-article format
  IN_FEED: '7029443121',

  // ErrorPage mid-content ad - after "How to Fix"
  ERROR_MID: '7029443121',

  // ErrorPage bottom ad - at very end
  ERROR_DETAIL: '7029443121',

  // ReferencePage banner
  REFERENCE_BANNER: '8342524791',

  // No results ad - shown when search has no matches
  NO_RESULTS: '7029443121',

  // Mobile banner
  MOBILE_BANNER: '8342524791',
} as const;

/**
 * Ad placement frequency settings
 *
 * USER-FIRST APPROACH:
 * - Ads NEVER block or overlay content
 * - Only shown at natural break points (after content)
 * - Clearly labeled as advertisements
 * - Low frequency to avoid annoyance
 */
export const AD_CONFIG = {
  // Show in-feed ad every N error cards (10 = balanced)
  IN_FEED_FREQUENCY: 10,

  // Minimum errors before showing first in-feed ad
  IN_FEED_MIN_ITEMS: 6,

  // Enable/disable specific ad placements
  ENABLE_SIDEBAR: true,         // Desktop only, doesn't overlap content
  ENABLE_TOP_BANNER: true,      // After intro, before results (desktop)
  ENABLE_BOTTOM_BANNER: true,   // After pagination
  ENABLE_IN_FEED: true,         // Every N cards, clearly marked
  ENABLE_ERROR_MID: true,       // After "How to Fix" section
  ENABLE_ERROR_DETAIL: true,    // At very end of error page
  ENABLE_REFERENCE: true,       // On reference page
  ENABLE_NO_RESULTS: true,      // When search has no results
  ENABLE_MOBILE_BANNER: false,  // Disabled - preserves mobile UX

  // Development mode
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
