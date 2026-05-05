export default function RootLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-6">
        <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
        <div className="h-12 w-72 bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-96 max-w-full bg-white/5 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-surface rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
