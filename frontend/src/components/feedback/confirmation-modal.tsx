"use client";

import { useEffect, useCallback } from "react";
import { DangerButton } from "@/components/ui/danger-button";
import { SecondaryButton } from "@/components/ui/secondary-button";

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export function ConfirmationModal({
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isProcessing = false,
}: ConfirmationModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isProcessing) {
        onCancel();
      }
    },
    [onCancel, isProcessing]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={isProcessing ? undefined : onCancel}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative z-10 mx-4 w-full max-w-[480px] rounded-lg bg-white p-6 shadow-xl"
      >
        <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <SecondaryButton
            label={cancelLabel}
            onClick={onCancel}
            disabled={isProcessing}
          />
          <DangerButton
            label={confirmLabel}
            onClick={onConfirm}
            loading={isProcessing}
            disabled={isProcessing}
          />
        </div>
      </div>
    </div>
  );
}
