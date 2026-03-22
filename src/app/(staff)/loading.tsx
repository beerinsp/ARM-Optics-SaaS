/**
 * Staff segment loading skeleton.
 *
 * Without this file there is no Suspense boundary around page content, so the
 * browser freezes on the current page until the server finishes every await
 * on the destination page. With this file Next.js shows the skeleton
 * immediately on click while data fetches run in the background — the sidebar
 * stays interactive and the transition feels instant.
 */
export default function StaffLoading() {
  return (
    <div className="animate-pulse">
      {/* Page header skeleton */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="h-7 w-44 bg-brand-100 rounded-md mb-2" />
          <div className="h-4 w-64 bg-brand-50 rounded-md" />
        </div>
        <div className="h-9 w-28 bg-brand-100 rounded-md" />
      </div>

      {/* Content card skeleton */}
      <div className="card overflow-hidden">
        {/* Table header row */}
        <div className="flex gap-4 px-5 py-3 border-b border-brand-100 bg-brand-50/60">
          <div className="h-3 w-32 bg-brand-100 rounded" />
          <div className="h-3 w-20 bg-brand-100 rounded ml-auto" />
          <div className="h-3 w-20 bg-brand-100 rounded" />
          <div className="h-3 w-24 bg-brand-100 rounded" />
        </div>

        {/* Row skeletons */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-4 border-b border-brand-50 last:border-0"
          >
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-36 bg-brand-100 rounded" />
              <div className="h-3 w-24 bg-brand-50 rounded" />
            </div>
            <div className="h-3 w-16 bg-brand-50 rounded" />
            <div className="h-3 w-16 bg-brand-50 rounded" />
            <div className="h-5 w-20 bg-brand-50 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
