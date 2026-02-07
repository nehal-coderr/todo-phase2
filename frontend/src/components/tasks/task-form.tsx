"use client";

import { useState, useCallback } from "react";
import { TextInput } from "@/components/ui/text-input";
import { TextArea } from "@/components/ui/text-area";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { createTaskSchema } from "@/lib/validation";
import type { TaskStatus } from "@/types/task";

interface TaskFormProps {
  mode: "create" | "edit";
  initialValues?: {
    title: string;
    description: string;
    status: TaskStatus;
  };
  onSubmit: (data: {
    title: string;
    description: string;
    status?: TaskStatus;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function TaskForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(
    initialValues?.description || ""
  );
  const [status, setStatus] = useState<TaskStatus>(
    initialValues?.status || "pending"
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback(
    (field: "title" | "description") => {
      const result = createTaskSchema.safeParse({ title, description });
      if (!result.success) {
        const fieldError = result.error.issues.find(
          (issue) => issue.path[0] === field
        );
        if (fieldError) {
          setErrors((prev) => ({ ...prev, [field]: fieldError.message }));
        } else {
          setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
          });
        }
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [title, description]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = createTaskSchema.safeParse({ title, description });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    const data: { title: string; description: string; status?: TaskStatus } = {
      title: title.trim(),
      description: description.trim(),
    };

    if (mode === "edit") {
      data.status = status;
    }

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TextInput
        label="Title"
        placeholder="Enter task title"
        value={title}
        onChange={(value) => {
          setTitle(value);
          if (errors.title) {
            setErrors((prev) => {
              const next = { ...prev };
              delete next.title;
              return next;
            });
          }
        }}
        onBlur={() => validateField("title")}
        error={errors.title}
        maxLength={200}
        required
        disabled={isSubmitting}
      />

      <TextArea
        label="Description"
        placeholder="Add a description (optional)"
        value={description}
        onChange={(value) => {
          setDescription(value);
          if (errors.description) {
            setErrors((prev) => {
              const next = { ...prev };
              delete next.description;
              return next;
            });
          }
        }}
        onBlur={() => validateField("description")}
        error={errors.description}
        maxLength={2000}
        disabled={isSubmitting}
        rows={4}
      />

      {mode === "edit" && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="status-toggle"
            checked={status === "completed"}
            onChange={(e) =>
              setStatus(e.target.checked ? "completed" : "pending")
            }
            disabled={isSubmitting}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label
            htmlFor="status-toggle"
            className="text-sm font-medium text-gray-700"
          >
            Mark as completed
          </label>
        </div>
      )}

      <div className="flex gap-3">
        <PrimaryButton
          type="submit"
          label={
            isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
                ? "Create Task"
                : "Save Changes"
          }
          loading={isSubmitting}
          disabled={isSubmitting}
        />
        <SecondaryButton
          label="Cancel"
          onClick={onCancel}
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
}
