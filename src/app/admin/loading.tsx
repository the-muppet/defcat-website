export default function AdminLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="space-y-4">
          <div className="h-10 w-64 bg-accent-tinted rounded-lg shimmer-tinted" />
          <div className="h-6 w-96 bg-accent-tinted rounded-lg shimmer-tinted" />
        </div>

        {/* Cards skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-tinted border-tinted rounded-lg p-6 space-y-4">
              <div className="h-8 w-32 bg-accent-tinted rounded shimmer-tinted" />
              <div className="h-4 w-full bg-accent-tinted rounded shimmer-tinted" />
              <div className="h-4 w-3/4 bg-accent-tinted rounded shimmer-tinted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
