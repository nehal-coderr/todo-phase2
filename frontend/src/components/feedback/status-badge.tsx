import type { TaskStatus } from "@/types/task";

interface StatusBadgeProps {
  status: TaskStatus;
}

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-warning-100 text-warning-800",
  },
  completed: {
    label: "Completed",
    className: "bg-success-100 text-success-800",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex w-[90px] items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
