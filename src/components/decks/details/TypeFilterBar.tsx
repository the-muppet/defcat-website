// components/decks/detail/TypeFilterBar.tsx
/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
interface TypeFilterBarProps {
  cards: any[]
  selectedType: string | null
  onTypeSelect: (type: string) => void
}

const CARD_TYPES = [
  { type: 'Creature', icon: 'ms-creature', color: 'text-green-500', glowColor: 'rgba(34, 197, 94, 0.3)', bgGlow: 'bg-green-500/10' },
  { type: 'Instant', icon: 'ms-instant', color: 'text-blue-500', glowColor: 'rgba(59, 130, 246, 0.3)', bgGlow: 'bg-blue-500/10' },
  { type: 'Sorcery', icon: 'ms-sorcery', color: 'text-red-500', glowColor: 'rgba(239, 68, 68, 0.3)', bgGlow: 'bg-red-500/10' },
  { type: 'Artifact', icon: 'ms-artifact', color: 'text-gray-500', glowColor: 'rgba(107, 114, 128, 0.3)', bgGlow: 'bg-gray-500/10' },
  { type: 'Enchantment', icon: 'ms-enchantment', color: 'text-purple-500', glowColor: 'rgba(168, 85, 247, 0.3)', bgGlow: 'bg-purple-500/10' },
  { type: 'Planeswalker', icon: 'ms-planeswalker', color: 'text-indigo-500', glowColor: 'rgba(99, 102, 241, 0.3)', bgGlow: 'bg-indigo-500/10' },
  { type: 'Battle', icon: 'ms-battle', color: 'text-orange-500', glowColor: 'rgba(249, 115, 22, 0.3)', bgGlow: 'bg-orange-500/10' },
  { type: 'Tribal', icon: 'ms-tribal', color: 'text-pink-500', glowColor: 'rgba(236, 72, 153, 0.3)', bgGlow: 'bg-pink-500/10' },
  { type: 'Land', icon: 'ms-land', color: 'text-amber-500', glowColor: 'rgba(245, 158, 11, 0.3)', bgGlow: 'bg-amber-500/10' },
]

export function TypeFilterBar({ cards, selectedType, onTypeSelect }: TypeFilterBarProps) {
  const totalCards = cards.reduce((sum, dc) => sum + dc.quantity, 0)
  const filteredCount = selectedType
    ? cards
        .filter((dc) => dc.cards?.type_line?.includes(selectedType))
        .reduce((sum, dc) => sum + dc.quantity, 0)
    : totalCards

  return (
    <div className="mb-6 pb-4 border-b border-border">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Filter by Type:
        </span>
        {selectedType && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              Showing {filteredCount} of {totalCards} cards
            </span>
            <button
              onClick={() => onTypeSelect('')}
              className="text-primary hover:text-primary/80 underline font-semibold transition-smooth active:scale-95"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {CARD_TYPES.map(({ type, icon, color, glowColor, bgGlow }) => {
          const typeCards = cards.filter((dc) => dc.cards?.type_line?.includes(type))
          if (typeCards.length === 0) return null
          
          const count = typeCards.reduce((sum, dc) => sum + dc.quantity, 0)
          const isActive = selectedType === type

          return (
            <button
              key={type}
              onClick={() => onTypeSelect(type)}
              title={`${type}s (${count})`}
              className={`group relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg border transition-all min-w-[80px] min-h-[50px] ${
                isActive
                  ? `${bgGlow} border-current scale-105`
                  : 'bg-accent/50 hover:bg-primary/20 border-border hover:border-primary hover:shadow-md'
              }`}
              style={
                isActive
                  ? {
                      boxShadow: `inset 0 0 30px ${glowColor}, inset 0 0 15px ${glowColor}`,
                      background: `radial-gradient(circle at 50% 50%, ${glowColor.replace('0.3', '0.2')}, transparent 75%)`,
                    }
                  : {}
              }
            >
              <i
                className={`ms ${icon} ${color}`}
                style={{
                  fontSize: '24px',
                  filter: isActive ? 'drop-shadow(0 0 8px currentColor)' : 'none',
                }}
              />
              <span
                className={`text-[10px] font-bold ${
                  isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-primary'
                }`}
              >
                {type}s
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}