/**
 * Tier System Components
 *
 * Usage:
 *
 * // Show user's tier badge
 * import { TierBadge } from '@/components/tier';
 * <TierBadge tier={user.patreonTier} />
 *
 * // Lock content behind a tier
 * import { FeatureLock } from '@/components/tier';
 * <FeatureLock requiredTier="Duke" currentTier={user.patreonTier} featureName="deck">
 *   <DeckContent />
 * </FeatureLock>
 *
 * // Show upgrade prompt
 * import { UpgradePrompt } from '@/components/tier';
 * <UpgradePrompt currentTier={user.patreonTier} requiredTier="Duke" featureName="advanced filtering" />
 *
 * // Display tier comparison page
 * import { TierComparison } from '@/components/tier';
 * <TierComparison currentTier={user.patreonTier} />
 */

export {
  TierBadge,
  TierBadgeCompact,
  getTierConfig,
  getAllTiers,
} from './TierBadge'
