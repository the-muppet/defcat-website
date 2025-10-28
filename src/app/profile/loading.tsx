export default function ProfileLoading() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile header skeleton */}
        <div className="glass-tinted border-tinted rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-accent-tinted shimmer-tinted" />
            <div className="space-y-2 flex-1">
              <div className="h-8 w-48 bg-accent-tinted rounded shimmer-tinted" />
              <div className="h-4 w-32 bg-accent-tinted rounded shimmer-tinted" />
            </div>
          </div>
        </div>

        {/* Content sections skeleton */}
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="glass-tinted border-tinted rounded-lg p-6 space-y-4">
              <div className="h-6 w-40 bg-accent-tinted rounded shimmer-tinted" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-accent-tinted rounded shimmer-tinted" />
                <div className="h-4 w-5/6 bg-accent-tinted rounded shimmer-tinted" />
                <div className="h-4 w-4/6 bg-accent-tinted rounded shimmer-tinted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
