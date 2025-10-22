export default function DecksLoading() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="space-y-4">
          <div className="h-12 w-64 bg-accent-tinted rounded-lg shimmer-tinted" />
          <div className="h-6 w-96 bg-accent-tinted rounded-lg shimmer-tinted" />
        </div>

        {/* Filters skeleton */}
        <div className="flex gap-4 flex-wrap">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 w-32 bg-accent-tinted rounded-lg shimmer-tinted"
            />
          ))}
        </div>

        {/* Deck grid skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div
              key={i}
              className="glass-tinted border-tinted rounded-lg overflow-hidden"
            >
              <div className="aspect-video bg-accent-tinted shimmer-tinted" />
              <div className="p-4 space-y-3">
                <div className="h-6 w-3/4 bg-accent-tinted rounded shimmer-tinted" />
                <div className="h-4 w-full bg-accent-tinted rounded shimmer-tinted" />
                <div className="h-4 w-2/3 bg-accent-tinted rounded shimmer-tinted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
