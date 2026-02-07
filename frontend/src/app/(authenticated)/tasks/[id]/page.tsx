"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { TaskDetail } from "@/components/tasks/task-detail";
import { TaskDetailSkeleton } from "@/components/skeletons/task-detail-skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import { ConfirmationModal } from "@/components/feedback/confirmation-modal";
import type { Task } from "@/types/task";

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchTask() {
      setIsLoading(true);
      setFetchError(null);
      try {
        const data = await api.tasks.get(id);
        setTask(data);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else if (err instanceof ApiError && err.status === 401) {
          return;
        } else {
          setFetchError("Failed to load task. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchTask();
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.tasks.delete(id);
      showToast("Task deleted", "success");
      router.push("/dashboard");
    } catch {
      showToast("Failed to delete task", "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-primary-600">
            Dashboard
          </Link>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-700">Task Detail</span>
        </nav>
        <TaskDetailSkeleton />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-lg font-medium text-gray-900">Task not found</h2>
        <p className="mt-1 text-sm text-gray-500">
          The task you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (fetchError) {
    return <ErrorState message={fetchError} onRetry={() => window.location.reload()} />;
  }

  if (!task) return null;

  return (
    <div>
      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-primary-600">
          Dashboard
        </Link>
        <span className="mx-2">&gt;</span>
        <span className="text-gray-700">Task Detail</span>
      </nav>

      <TaskDetail
        title={task.title}
        description={task.description}
        status={task.status}
        createdAt={task.createdAt}
        updatedAt={task.updatedAt}
        onEdit={() => router.push(`/tasks/${id}/edit`)}
        onDelete={() => setShowDeleteModal(true)}
      />

      <div className="mt-6">
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      {showDeleteModal && (
        <ConfirmationModal
          title="Delete Task"
          message={`Are you sure you want to delete '${task.title}'? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isProcessing={isDeleting}
        />
      )}
    </div>
  );
}
