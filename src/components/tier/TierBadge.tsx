'use client'

import { useState } from 'react'
import { GiWizardStaff, GiMountedKnight, GiBeard, GiFarmer, GiMustache, GiPublicSpeaker, GiSunPriest, GiVoodooDoll, GiBatMask, GiWizardFace } from "react-icons/gi";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { GlowingEffect } from '@/components/ui/glowEffect'
import type { PatreonTier } from '@/types/core'
import type { IconType } from 'react-icons'
import { useAuth } from '@/lib/auth/client'

interface TierBadgeProps {
  tier: PatreonTier
  showIcon?: boolean
  showTooltip?: boolean
  className?: string
}

// Available icons pool
export const AVAILABLE_ICONS: Record<string, IconType> = {
  farmer: GiFarmer,
  knight: GiMountedKnight,
  speaker: GiPublicSpeaker,
  mustache: GiMustache,
  wizardFace: GiWizardFace,
  sunPriest: GiSunPriest,
  wizardStaff: GiWizardStaff,
  beard: GiBeard,
  voodooDoll: GiVoodooDoll,
  batMask: GiBatMask,
}

const TIER_CONFIG: Record<PatreonTier, {
  label: string
  defaultIcon: string
  gradient: string
  textColor: string
  glowColor: string
  borderGradient: string
  description: string
  price: string
}> = {
  Citizen: {
    label: 'Citizen',
    defaultIcon: 'farmer',
    gradient: 'bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600',
    textColor: 'text-white',
    glowColor: 'shadow-slate-500/50',
    borderGradient: 'border-slate-400/50',
    description: 'Basic access to the deck database',
    price: '$2/month',
  },
  Knight: {
    label: 'Knight',
    defaultIcon: 'knight',
    gradient: 'bg-gradient-to-br from-blue-400 via-blue-600 to-indigo-700',
    textColor: 'text-white',
    glowColor: 'shadow-blue-500/60',
    borderGradient: 'border-blue-400/50',
    description: 'Enhanced features and priority support',
    price: '$10/month',
  },
  Emissary: {
    label: 'Emissary',
    defaultIcon: 'speaker',
    gradient: 'bg-gradient-to-br from-purple-400 via-purple-600 to-fuchsia-700',
    textColor: 'text-white',
    glowColor: 'shadow-purple-500/60',
    borderGradient: 'border-purple-400/50',
    description: 'Advanced deck analysis and filtering',
    price: '$30/month',
  },
  Duke: {
    label: 'Duke',
    defaultIcon: 'mustache',
    gradient: 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-600',
    textColor: 'text-white',
    glowColor: 'shadow-amber-500/70',
    borderGradient: 'border-amber-400/50',
    description: 'Premium content and exclusive decks',
    price: '$50/month',
  },
  Wizard: {
    label: 'Wizard',
    defaultIcon: 'wizardFace',
    gradient: 'bg-gradient-to-br from-violet-400 via-purple-600 to-indigo-800',
    textColor: 'text-white',
    glowColor: 'shadow-violet-500/80',
    borderGradient: 'border-violet-400/60',
    description: 'Full database access with advanced tools',
    price: '$165/month',
  },
  ArchMage: {
    label: 'ArchMage',
    defaultIcon: 'sunPriest',
    gradient: 'bg-gradient-to-br from-rose-400 via-pink-600 to-purple-800',
    textColor: 'text-white',
    glowColor: 'shadow-rose-500/90',
    borderGradient: 'border-rose-400/70',
    description: 'Ultimate tier with all features unlocked',
    price: '$250/month',
  },
}

// Store icon overrides (in real app, this would be in localStorage or database)
const iconOverrides: Record<PatreonTier, string> = {} as any

export function TierBadge({
  tier,
  showIcon = true,
  showTooltip = true,
  className = '',
}: TierBadgeProps) {
  const { isDeveloper } = useAuth()
  const config = TIER_CONFIG[tier]
  const [currentIconKey, setCurrentIconKey] = useState(
    iconOverrides[tier] || config.defaultIcon
  )
  const Icon = AVAILABLE_ICONS[currentIconKey]

  const handleIconChange = (iconKey: string) => {
    setCurrentIconKey(iconKey)
    iconOverrides[tier] = iconKey
    console.log(`Changed ${tier} icon to ${iconKey}`)
  }

  const badgeContent = (
    <div
      className={`
        ${config.gradient}
        ${config.textColor}
        ${config.borderGradient}
        ${config.glowColor}
        inline-flex flex-col items-center justify-center gap-1
        px-4 py-3
        rounded-xl
        font-bold tracking-wide
        shadow-lg
        border-2
        transition-all duration-300
        hover:scale-110 hover:shadow-2xl
        hover:brightness-110
        relative
        overflow-hidden
        before:absolute before:inset-0
        before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
        before:-translate-x-full
        hover:before:translate-x-full
        before:transition-transform before:duration-700
        ${isDeveloper ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* WUBRG Glowing Effect - only for developers */}
      {isDeveloper && (
        <GlowingEffect
          disabled={false}
          blur={8}
          spread={60}
          proximity={100}
          borderWidth={3}
          movementDuration={1.5}
        />
      )}
      
      {showIcon && <Icon className="h-8 w-8 drop-shadow-lg relative z-10" />}
      <span className="drop-shadow-md text-xs uppercase tracking-wider relative z-10">{config.label}</span>
      {isDeveloper && (
        <div className="absolute top-1 right-1 bg-black/20 rounded-full p-0.5 z-10">
          <div className="text-[8px] font-mono">DEV</div>
        </div>
      )}
    </div>
  )

  if (isDeveloper) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {showTooltip ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
                <TooltipContent className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
                  <div className="space-y-1">
                    <p className="font-bold text-white">{config.label} Tier</p>
                    <p className="text-sm text-slate-300">{config.description}</p>
                    <p className="text-xs text-amber-400 font-semibold">{config.price}</p>
                    <p className="text-xs text-green-400 font-semibold mt-2">Click to change icon</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            badgeContent
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="grid grid-cols-4 gap-2 p-2 w-64">
          {Object.entries(AVAILABLE_ICONS).map(([key, IconComponent]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => handleIconChange(key)}
              className={`
                flex items-center justify-center p-3 cursor-pointer rounded-lg
                hover:bg-slate-100 dark:hover:bg-slate-800
                transition-all duration-200
                ${currentIconKey === key ? 'bg-slate-200 dark:bg-slate-700 ring-2 ring-blue-500' : ''}
              `}
            >
              <IconComponent className="h-6 w-6" />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (!showTooltip) {
    return badgeContent
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
        <TooltipContent className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <div className="space-y-1">
            <p className="font-bold text-white">{config.label} Tier</p>
            <p className="text-sm text-slate-300">{config.description}</p>
            <p className="text-xs text-amber-400 font-semibold">{config.price}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function TierBadgeCompact({ tier }: { tier: PatreonTier }) {
  const config = TIER_CONFIG[tier]
  const iconKey = iconOverrides[tier] || config.defaultIcon
  const Icon = AVAILABLE_ICONS[iconKey]

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md
      ${config.gradient} 
      ${config.textColor}
      text-sm font-bold
      shadow-md
      border ${config.borderGradient}
    `}>
      <Icon className="h-3.5 w-3.5 drop-shadow" />
      {config.label}
    </span>
  )
}

export function getTierConfig(tier: PatreonTier) {
  return TIER_CONFIG[tier]
}

export function getAllTiers(): PatreonTier[] {
  return ['Citizen', 'Knight', 'Emissary', 'Duke', 'Wizard', 'ArchMage']
}