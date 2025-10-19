'use client'

export default function AboutPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          About DefCat's DeckVault
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your premium cEDH decklist resource
        </p>

        <div className="space-y-6">
          <div className="bg-card backdrop-blur-sm rounded-lg p-6 border border-border">
            <h2 className="text-2xl font-bold mb-4">What is DeckVault?</h2>
            <p className="text-foreground leading-relaxed">
              DeckVault is a curated collection of competitive EDH decklists, maintained by DefCat.
              Browse powerful strategies, discover new commanders, and level up your cEDH game.
            </p>
          </div>

          <div className="bg-card backdrop-blur-sm rounded-lg p-6 border border-border">
            <h2 className="text-2xl font-bold mb-4">More Info Coming Soon</h2>
            <p className="text-foreground">
              Additional information will be added here.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
