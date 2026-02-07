"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { TaskList } from "@/components/tasks/task-list";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { ConfirmationModal } from "@/components/feedback/confirmation-modal";
import { PrimaryButton } from "@/components/ui/primary-button";
import { TaskCardSkeleton } from "@/components/skeletons/task-card-skeleton";
import type { Task } from "@/types/task";

export default function DashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.tasks.list();
      setTasks(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;
      setError("Failed to load tasks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeletingId(deleteTarget.id);
    try {
      await api.tasks.delete(deleteTarget.id);
      setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      showToast("Task deleted", "success");
    } catch {
      showToast("Failed to delete task", "error");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <TaskCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchTasks} />;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <PrimaryButton
          label="New Task"
          onClick={() => router.push("/tasks/new")}
        />
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          heading="No tasks yet"
          subtext="Create your first task to get started"
          actionLabel="Create Task"
          onAction={() => router.push("/tasks/new")}
        />
      ) : (
        <TaskList
          tasks={tasks}
          onEdit={(id) => router.push(`/tasks/${id}/edit`)}
          onDelete={(task) => setDeleteTarget(task)}
          onClick={(id) => router.push(`/tasks/${id}`)}
          deletingId={deletingId}
        />
      )}

      {deleteTarget && (
        <ConfirmationModal
          title="Delete Task"
          message={`Are you sure you want to delete '${deleteTarget.title}'? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isProcessing={isDeleting}
        />
      )}
    </div>
  );
}
