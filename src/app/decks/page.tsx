'use client'

import { useState, useMemo, memo } from "react"
import { ExternalLink, Filter, X, ChevronUp, ChevronDown } from "lucide-react"
import { useDecks } from "@/lib/hooks/useDecks"
import { cn } from "@/lib/utils"
import type { Deck } from "@/types/core"
import { ManaSymbols } from "@/components/decks/ManaSymbols"

// Memoized deck row component
const DeckRow = memo(function DeckRow({ deck }: { deck: Deck }) {
  return (
    <tr className="border-b border-tinted hover:bg-accent-tinted transition-all">
      <td className="py-4 px-4">
        <a href={`/decks/${deck.id}`} className="block hover:text-[var(--mana-color)] transition-colors">
          <div className="font-medium">{deck.name}</div>
          <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
            {deck.description}
          </div>
        </a>
      </td>
      <td className="py-4 px-4">
        <div className="flex flex-wrap gap-1">
          {deck.commanders?.map((cmd, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-1 rounded bg-accent-tinted border border-tinted"
            >
              {cmd}
            </span>
          ))}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex justify-center">
          {deck.color_identity && (
            <ManaSymbols mana={deck.color_identity} size="sm" />
          )}
        </div>
      </td>
      <td className="py-4 px-4 text-right">
        {deck.view_count?.toLocaleString()}
      </td>
      <td className="py-4 px-4 text-right">
        {deck.like_count?.toLocaleString()}
      </td>
      <td className="py-4 px-4 text-right text-sm text-muted-foreground">
        {deck.updated_at ? new Date(deck.updated_at).toLocaleDateString() : '-'}
      </td>
      <td className="py-4 px-4 text-center">
        <a href={deck.moxfield_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[var(--mana-color)] hover:brightness-110 transition-all"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </td>
    </tr>
  )
})

export default function TableLayout() {
  const { data: decks = [], isLoading: loading, error } = useDecks()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<"name" | "view_count" | "like_count" | "updated_at">("view_count")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [showFilters, setShowFilters] = useState(true)

  const colorOptions = [
    { code: "W", name: "White" },
    { code: "U", name: "Blue" },
    { code: "B", name: "Black" },
    { code: "R", name: "Red" },
    { code: "G", name: "Green" },
    { code: "C", name: "Colorless" },
    { code: "WUBRG", name: "WUBRG" }
  ]

  const filteredDecks = useMemo(() => {
    let filtered = [...decks]
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (deck) =>
          deck.name.toLowerCase().includes(query) ||
          deck.commanders?.some((cmd) => cmd.toLowerCase().includes(query)) ||
          (deck.description || null)?.toLowerCase().includes(query)
      )
    }
    if (selectedColors.length > 0) {
      filtered = filtered.filter((deck) => {
        return selectedColors.every((color) => {
          // Special handling for WUBRG - check if deck has all 5 colors
          if (color === "WUBRG") {
            return ['W', 'U', 'B', 'R', 'G'].every(c => deck.color_identity?.includes(c))
          }
          return deck.color_identity?.includes(color)
        })
      })
    }

    filtered.sort((a, b) => {
      let aVal: any = a[sortBy]
      let bVal: any = b[sortBy]

      if (sortBy === "updated_at") {
        aVal = new Date(aVal || 0).getTime()
        bVal = new Date(bVal || 0).getTime()
      }

      if (sortBy === "name") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      return sortOrder === "asc" ? (aVal || 0) - (bVal || 0) : (bVal || 0) - (aVal || 0)
    })
    return filtered
  }, [decks, searchQuery, selectedColors, sortBy, sortOrder])

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    )
  }

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  const SortIcon = ({ column }: { column: typeof sortBy }) => {
    if (sortBy !== column) return null
    return sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar with tinted styling */}
      <aside
        className={cn(
          "border-r border-tinted bg-card-tinted backdrop-blur-sm transition-all duration-300",
          showFilters ? "w-72" : "w-0 overflow-hidden"
        )}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Filters</h2>
            <button
              onClick={() => setShowFilters(false)}
              className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-accent-tinted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search with tinted input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Deck or commander..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-accent-tinted border border-tinted text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mana-color)] focus:border-[var(--mana-color)] transition-all"
            />
          </div>

          {/* Color Identity with tinted hover */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-3">
              Color Identity
            </label>
            <div className="space-y-2">
              {colorOptions.map((color) => (
                <label
                  key={color.code}
                  className="flex items-center gap-3 cursor-pointer hover:bg-accent-tinted p-2 rounded-lg transition-all"
                >
                  <input
                    type="checkbox"
                    checked={selectedColors.includes(color.code)}
                    onChange={() => toggleColor(color.code)}
                    className="w-4 h-4 rounded border-tinted bg-background text-[var(--mana-color)] focus:ring-[var(--mana-color)]"
                  />
                  <span className="text-sm">{color.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedColors.length > 0) && (
            <div className="pt-4 border-t border-tinted">
              <button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedColors([])
                }}
                className="text-sm text-[var(--mana-color)] hover:brightness-110 transition-all"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content with tinted elements */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 bg-card-tinted/80 backdrop-blur-md border-b border-tinted px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!showFilters && (
                <button
                  onClick={() => setShowFilters(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-tinted hover:bg-[var(--accent-tinted)] border border-tinted transition-all"
                >
                  <Filter className="h-4 w-4" />
                  Show Filters
                </button>
              )}
              <h1 className="text-2xl font-bold">
                Decklist Database
              </h1>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredDecks.length} / {decks.length} decks
            </div>
          </div>
        </header>

        {/* Table with tinted styling */}
        <div className="p-6">
          {loading ? (
            <div className="text-center text-muted-foreground py-20">Loading decks...</div>
          ) : error ? (
            <div className="text-center text-destructive py-20">Error loading decks</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-tinted">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      <button
                        onClick={() => handleSort("name")}
                        className="flex items-center gap-2 hover:text-foreground"
                      >
                        Deck Name
                        <SortIcon column="name" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Commander(s)
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Colors
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                      <button
                        onClick={() => handleSort("view_count")}
                        className="flex items-center gap-2 ml-auto hover:text-foreground"
                      >
                        Views
                        <SortIcon column="view_count" />
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                      <button
                        onClick={() => handleSort("like_count")}
                        className="flex items-center gap-2 ml-auto hover:text-foreground"
                      >
                        Likes
                        <SortIcon column="like_count" />
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                      <button
                        onClick={() => handleSort("updated_at")}
                        className="flex items-center gap-2 ml-auto hover:text-foreground"
                      >
                        Updated
                        <SortIcon column="updated_at" />
                      </button>
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Link
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDecks.map((deck) => (
                    <DeckRow key={deck.id} deck={deck} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}