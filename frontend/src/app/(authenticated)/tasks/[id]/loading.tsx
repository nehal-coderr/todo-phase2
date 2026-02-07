import { TaskDetailSkeleton } from "@/components/skeletons/task-detail-skeleton";

export default function TaskDetailLoading() {
  return (
    <div>
      <div className="mb-4 flex gap-2">
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      </div>
      <TaskDetailSkeleton />
    </div>
  );
}
