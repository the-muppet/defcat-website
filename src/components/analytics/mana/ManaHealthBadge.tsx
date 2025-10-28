// components/deck/ManaHealthBadge.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { ManaHealthScore } from '@/types/analysis'

interface ManaHealthBadgeProps {
  healthScore: ManaHealthScore
}

export function ManaHealthBadge({ healthScore }: ManaHealthBadgeProps) {
  const gradeColor = healthScore.grade.startsWith('A')
    ? 'bg-green-500 hover:bg-green-600'
    : healthScore.grade.startsWith('B')
      ? 'bg-blue-500 hover:bg-blue-600'
      : healthScore.grade.startsWith('C')
        ? 'bg-yellow-500 hover:bg-yellow-600'
        : 'bg-red-500 hover:bg-red-600'

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge className={gradeColor}>Mana: {healthScore.grade.split(' ')[0]}</Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-xs">
            <div>Score: {healthScore.overall_score}/100</div>
            <div>
              {healthScore.total_lands} lands • {healthScore.unique_mana_sources} sources
            </div>
            {healthScore.colors_insufficient > 0 && (
              <div className="text-red-400">
                {healthScore.colors_insufficient} color(s) need improvement
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
