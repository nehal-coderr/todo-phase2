"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskFormSkeleton } from "@/components/skeletons/task-form-skeleton";
import { ErrorState } from "@/components/feedback/error-state";
import type { Task, TaskStatus } from "@/types/task";

export default function EditTaskPage({
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

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

  const handleSubmit = async (data: {
    title: string;
    description: string;
    status?: TaskStatus;
  }) => {
    setApiError("");
    setIsSubmitting(true);
    try {
      await api.tasks.update(id, {
        title: data.title,
        description: data.description || null,
        status: data.status,
      });
      showToast("Task updated", "success");
      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update task";
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Task</h1>
        <TaskFormSkeleton />
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
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Task</h1>

      {apiError && (
        <div className="mb-4 rounded-md bg-danger-50 p-3 text-sm text-danger-700">
          {apiError}
        </div>
      )}

      <TaskForm
        mode="edit"
        initialValues={{
          title: task.title,
          description: task.description || "",
          status: task.status,
        }}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/dashboard")}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
