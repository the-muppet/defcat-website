'use client'

export default function TiersPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Patreon Tiers
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Support DefCat and get access to premium decklists!
        </p>

        <div className="space-y-4">
          <div className="bg-card backdrop-blur-sm rounded-lg p-6 border border-border">
            <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground">
              Tier information and benefits will be displayed here.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
