import { StatusBadge } from "@/components/feedback/status-badge";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { DangerButton } from "@/components/ui/danger-button";
import type { TaskStatus } from "@/types/task";

interface TaskDetailProps {
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function TaskDetail({
  title,
  description,
  status,
  createdAt,
  updatedAt,
  onEdit,
  onDelete,
}: TaskDetailProps) {
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <StatusBadge status={status} />
      </div>

      <div className="text-sm text-gray-700">
        {description ? (
          <p className="whitespace-pre-wrap">{description}</p>
        ) : (
          <p className="italic text-gray-400">No description provided.</p>
        )}
      </div>

      <div className="flex gap-6 text-xs text-gray-400">
        <span>Created {formatDate(createdAt)}</span>
        <span>Modified {formatDate(updatedAt)}</span>
      </div>

      <div className="flex gap-3">
        <SecondaryButton label="Edit" onClick={onEdit} />
        <DangerButton label="Delete" onClick={onDelete} />
      </div>
    </div>
  );
}
