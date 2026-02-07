export function TaskDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-8 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="h-6 w-[90px] animate-pulse rounded-full bg-gray-200" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-[90%] animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-[70%] animate-pulse rounded bg-gray-200" />
      </div>
      <div className="flex gap-4">
        <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="flex gap-3">
        <div className="h-10 w-[120px] animate-pulse rounded-md bg-gray-200" />
        <div className="h-10 w-[120px] animate-pulse rounded-md bg-gray-200" />
      </div>
    </div>
  );
}
