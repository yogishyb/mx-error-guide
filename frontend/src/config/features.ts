/**
 * Feature Flag System
 *
 * Controls access to features based on tier levels.
 * Set VITE_UNLOCK_ALL_FEATURES=true at build time to unlock everything.
 */

export type FeatureTier = 'free' | 'pro' | 'enterprise';

export interface FeatureConfig {
  id: string;
  name: string;
  description: string;
  tier: FeatureTier;
}

// Environment flag - when true, all features are unlocked
export const UNLOCK_ALL_FEATURES = import.meta.env.VITE_UNLOCK_ALL_FEATURES === 'true';

// Feature definitions
export const FEATURES = {
  // Core Features (Free)
  errorLookup: {
    id: 'error-lookup',
    name: 'Error Code Lookup',
    description: 'Search and view ISO 20022 error codes',
    tier: 'free',
  },
  messageGuides: {
    id: 'message-guides',
    name: 'Message Type Guides',
    description: 'Reference guides for MX message types',
    tier: 'free',
  },
  fieldReferenceLookup: {
    id: 'field-reference-lookup',
    name: 'Field Reference Lookup',
    description: 'Quick ISO 20022 field definitions and XPath lookup',
    tier: 'free',
  },

  // Developer Tools (Pro)
  mxXmlComparator: {
    id: 'mx-xml-comparator',
    name: 'MX XML Comparator',
    description: 'Compare two MX XML messages side-by-side with visual diff',
    tier: 'pro',
  },
  mxJsonComparator: {
    id: 'mx-json-comparator',
    name: 'MX JSON Comparator',
    description: 'Compare MX messages in JSON format',
    tier: 'pro',
  },
  mtMessageComparator: {
    id: 'mt-comparator',
    name: 'MT Message Comparator',
    description: 'Compare legacy SWIFT MT messages',
    tier: 'pro',
  },
  mtToMxConverter: {
    id: 'mt-to-mx-converter',
    name: 'MT to MX Converter Preview',
    description: 'Preview how MT messages map to MX format',
    tier: 'pro',
  },

  // Enterprise Features
  messageValidator: {
    id: 'message-validator',
    name: 'Message Validator',
    description: 'Validate MX/MT message structure against ISO 20022 schemas',
    tier: 'enterprise',
  },
  bulkValidation: {
    id: 'bulk-validation',
    name: 'Bulk Message Validation',
    description: 'Validate multiple messages in batch',
    tier: 'enterprise',
  },
  apiAccess: {
    id: 'api-access',
    name: 'API Access',
    description: 'Programmatic access to validation and lookup services',
    tier: 'enterprise',
  },
} as const satisfies Record<string, FeatureConfig>;

export type FeatureId = keyof typeof FEATURES;

/**
 * Check if a feature is accessible
 * Returns true if:
 * - Feature tier is 'free', OR
 * - UNLOCK_ALL_FEATURES is true
 */
export function isFeatureAccessible(featureId: FeatureId): boolean {
  const feature = FEATURES[featureId];

  if (UNLOCK_ALL_FEATURES) {
    return true;
  }

  return feature.tier === 'free';
}

/**
 * Get all features grouped by tier
 */
export function getFeaturesByTier(): Record<FeatureTier, FeatureConfig[]> {
  const grouped: Record<FeatureTier, FeatureConfig[]> = {
    free: [],
    pro: [],
    enterprise: [],
  };

  Object.values(FEATURES).forEach((feature) => {
    grouped[feature.tier].push(feature);
  });

  return grouped;
}

/**
 * Check if running in demo/unlocked mode
 */
export function isDemoMode(): boolean {
  return UNLOCK_ALL_FEATURES;
}
