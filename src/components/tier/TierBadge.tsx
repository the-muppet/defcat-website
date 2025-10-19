'use client';

import { Crown, Shield, Star, Sparkles, Zap, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { PatreonTier } from '@/types/core';

interface TierBadgeProps {
  tier: PatreonTier;
  showIcon?: boolean;
  showTooltip?: boolean;
  className?: string;
}

const TIER_CONFIG: Record<PatreonTier, {
  label: string;
  icon: typeof Crown;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  price: string;
}> = {
  Citizen: {
    label: 'Citizen',
    icon: Users,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
    description: 'Basic access to the deck database',
    price: '$2/month',
  },
  Knight: {
    label: 'Knight',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    description: 'Enhanced features and priority support',
    price: '$10/month',
  },
  Emissary: {
    label: 'Emissary',
    icon: Star,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    description: 'Advanced deck analysis and filtering',
    price: '$30/month',
  },
  Duke: {
    label: 'Duke',
    icon: Sparkles,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-300',
    description: 'Premium content and exclusive decks',
    price: '$50/month',
  },
  Wizard: {
    label: 'Wizard',
    icon: Zap,
    color: 'text-violet-600',
    bgColor: 'bg-violet-100',
    borderColor: 'border-violet-300',
    description: 'Full database access with advanced tools',
    price: '$165/month',
  },
  ArchMage: {
    label: 'ArchMage',
    icon: Crown,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
    borderColor: 'border-rose-300',
    description: 'Ultimate tier with all features unlocked',
    price: '$250/month',
  },
};

export function TierBadge({
  tier,
  showIcon = true,
  showTooltip = true,
  className = ''
}: TierBadgeProps) {
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;

  const badgeContent = (
    <Badge
      variant="outline"
      className={`
        ${config.color}
        ${config.bgColor}
        ${config.borderColor}
        flex items-center gap-1.5 px-2.5 py-1
        font-medium
        ${className}
      `}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      <span>{config.label}</span>
    </Badge>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">{config.label} Tier</p>
            <p className="text-sm text-muted-foreground">{config.description}</p>
            <p className="text-xs text-muted-foreground">{config.price}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Small inline tier badge for compact spaces
 */
export function TierBadgeCompact({ tier }: { tier: PatreonTier }) {
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 ${config.color} text-sm font-medium`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

/**
 * Get tier configuration data
 */
export function getTierConfig(tier: PatreonTier) {
  return TIER_CONFIG[tier];
}

/**
 * Get all tiers in order
 */
export function getAllTiers(): PatreonTier[] {
  return ['Citizen', 'Knight', 'Emissary', 'Duke', 'Wizard', 'ArchMage'];
}
