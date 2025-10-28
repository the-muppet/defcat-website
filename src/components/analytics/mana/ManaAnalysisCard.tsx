// components/deck/ManaAnalysisCard.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { DeckManaAnalysis } from '@/types/analysis'

const colorNames: Record<string, string> = {
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green',
}

const colorClasses: Record<string, string> = {
  W: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100',
  U: 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100',
  B: 'bg-gray-800 text-gray-100 dark:bg-gray-200 dark:text-gray-800',
  R: 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100',
  G: 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100',
}

interface ManaAnalysisCardProps {
  analysis: DeckManaAnalysis
}

export function ManaAnalysisCard({ analysis }: ManaAnalysisCardProps) {
  const { health_score, mana_analysis } = analysis

  const gradeColor = health_score.grade.startsWith('A')
    ? 'bg-green-500'
    : health_score.grade.startsWith('B')
      ? 'bg-blue-500'
      : health_score.grade.startsWith('C')
        ? 'bg-yellow-500'
        : 'bg-red-500'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mana Base Analysis</CardTitle>
          <Badge className={gradeColor}>{health_score.grade}</Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {health_score.total_lands} lands • {health_score.unique_mana_sources} sources •{' '}
          {health_score.fixing_lands} fixing
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Overall Score</span>
            <span className="font-semibold">{health_score.overall_score}/100</span>
          </div>
          <Progress value={health_score.overall_score} className="h-2" />
        </div>

        {/* Color Breakdown */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Color Requirements</h4>
          {mana_analysis.map((color) => (
            <div key={color.color} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={colorClasses[color.color]} variant="outline">
                    {colorNames[color.color]}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {color.pips_required} pips • {color.sources_in_deck} sources
                  </span>
                </div>
                <span className="text-sm">{color.status}</span>
              </div>

              {/* Probabilities */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Turn 1</div>
                  <div className="font-semibold">{color.prob_turn_1}%</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Turn 3</div>
                  <div className="font-semibold">{color.prob_turn_3}%</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Turn 5</div>
                  <div className="font-semibold">{color.prob_turn_5}%</div>
                </div>
              </div>

              {/* Recommendation */}
              {color.status !== '✅ Optimal' && (
                <p className="text-xs text-muted-foreground italic">{color.recommendation}</p>
              )}
            </div>
          ))}
        </div>

        {/* Overall Recommendations */}
        {health_score.recommendations && health_score.recommendations.length > 0 && (
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-semibold text-sm">Recommendations</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              {health_score.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
