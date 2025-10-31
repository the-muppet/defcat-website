export function DeckDetailLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-4" />
          <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 border-4 border-primary/10 mx-auto" />
        </div>
        <p className="text-muted-foreground font-medium">Loading deck...</p>
      </div>
    </div>
  )
}