"use client";

import { Pencil, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/feedback/status-badge";
import { IconButton } from "@/components/ui/icon-button";
import type { TaskStatus } from "@/types/task";

interface TaskCardProps {
  title: string;
  status: TaskStatus;
  createdAt: string;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
  isDeleting?: boolean;
}

export function TaskCard({
  title,
  status,
  createdAt,
  onEdit,
  onDelete,
  onClick,
  isDeleting = false,
}: TaskCardProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-gray-50 ${
        isDeleting ? "opacity-50 pointer-events-none" : ""
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-medium ${
            status === "completed"
              ? "text-gray-400 line-through"
              : "text-gray-900"
          }`}
        >
          {title}
        </p>
        <p className="mt-1 text-xs text-gray-400">{formattedDate}</p>
      </div>
      <div className="ml-4 flex shrink-0 items-center gap-2">
        <StatusBadge status={status} />
        <IconButton
          icon={Pencil}
          ariaLabel="Edit task"
          variant="primary"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        />
        <IconButton
          icon={Trash2}
          ariaLabel="Delete task"
          variant="danger"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        />
      </div>
    </div>
  );
}
