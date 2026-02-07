"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { TaskForm } from "@/components/tasks/task-form";

export default function CreateTaskPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleSubmit = async (data: { title: string; description: string }) => {
    setApiError("");
    setIsSubmitting(true);
    try {
      await api.tasks.create({
        title: data.title,
        description: data.description || null,
      });
      showToast("Task created", "success");
      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create task";
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Create Task</h1>

      {apiError && (
        <div className="mb-4 rounded-md bg-danger-50 p-3 text-sm text-danger-700">
          {apiError}
        </div>
      )}

      <TaskForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={() => router.push("/dashboard")}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
