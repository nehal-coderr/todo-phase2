export function TaskCardSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex-1 space-y-2">
        <div className="h-5 w-3/5 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-1/4 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-6 w-[90px] animate-pulse rounded-full bg-gray-200" />
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
      </div>
    </div>
  );
}
