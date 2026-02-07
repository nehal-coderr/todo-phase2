export function TaskFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
        <div className="h-10 w-full animate-pulse rounded-md bg-gray-200" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
        <div className="h-24 w-full animate-pulse rounded-md bg-gray-200" />
      </div>
      <div className="flex gap-3">
        <div className="h-10 w-[120px] animate-pulse rounded-md bg-gray-200" />
        <div className="h-10 w-[120px] animate-pulse rounded-md bg-gray-200" />
      </div>
    </div>
  );
}
