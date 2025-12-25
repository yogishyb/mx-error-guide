import { useMemo } from 'react';
import {
  FEATURES,
  UNLOCK_ALL_FEATURES,
  isFeatureAccessible,
  isDemoMode,
  type FeatureId,
  type FeatureTier,
  type FeatureConfig,
} from '../config/features';

interface UseFeatureAccessReturn {
  /** Check if a specific feature is accessible */
  canAccess: (featureId: FeatureId) => boolean;

  /** Check if user has access to a tier level */
  hasTierAccess: (tier: FeatureTier) => boolean;

  /** Whether all features are unlocked (demo mode) */
  isDemoMode: boolean;

  /** Get feature config by ID */
  getFeature: (featureId: FeatureId) => FeatureConfig;

  /** List of all accessible feature IDs */
  accessibleFeatures: FeatureId[];
}

/**
 * Hook for checking feature access throughout the app
 *
 * @example
 * ```tsx
 * const { canAccess, isDemoMode } = useFeatureAccess();
 *
 * if (canAccess('mxXmlComparator')) {
 *   // Render the comparator
 * }
 * ```
 */
export function useFeatureAccess(): UseFeatureAccessReturn {
  const accessibleFeatures = useMemo(() => {
    return (Object.keys(FEATURES) as FeatureId[]).filter((id) => isFeatureAccessible(id));
  }, []);

  const canAccess = (featureId: FeatureId): boolean => {
    return isFeatureAccessible(featureId);
  };

  const hasTierAccess = (tier: FeatureTier): boolean => {
    if (UNLOCK_ALL_FEATURES) return true;
    return tier === 'free';
  };

  const getFeature = (featureId: FeatureId): FeatureConfig => {
    return FEATURES[featureId];
  };

  return {
    canAccess,
    hasTierAccess,
    isDemoMode: isDemoMode(),
    getFeature,
    accessibleFeatures,
  };
}
