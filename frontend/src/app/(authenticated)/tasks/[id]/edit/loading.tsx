import { TaskFormSkeleton } from "@/components/skeletons/task-form-skeleton";

export default function EditTaskLoading() {
  return (
    <div>
      <div className="mb-6 h-8 w-28 animate-pulse rounded bg-gray-200" />
      <TaskFormSkeleton />
    </div>
  );
}
