"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "info";

export interface ToastData {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    borderColor: "border-l-success-500",
    iconColor: "text-success-500",
  },
  error: {
    icon: AlertCircle,
    borderColor: "border-l-danger-500",
    iconColor: "text-danger-500",
  },
  info: {
    icon: Info,
    borderColor: "border-l-primary-500",
    iconColor: "text-primary-500",
  },
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const config = variantConfig[toast.variant];
  const Icon = config.icon;

  const dismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onDismiss(toast.id), 150);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  useEffect(() => {
    if (toast.variant === "error") return;
    if (isPaused) return;

    const duration = toast.duration || 4000;
    const timer = setTimeout(dismiss, duration);
    return () => clearTimeout(timer);
  }, [toast.variant, toast.duration, isPaused, dismiss]);

  return (
    <div
      className={`flex w-80 items-start gap-3 rounded-lg border border-l-4 bg-white p-4 shadow-lg transition-all duration-200 ${config.borderColor} ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="alert"
    >
      <Icon size={20} className={`mt-0.5 shrink-0 ${config.iconColor}`} />
      <p className="flex-1 text-sm text-gray-700">{toast.message}</p>
      <button
        onClick={dismiss}
        className="shrink-0 rounded p-0.5 text-gray-400 transition-colors hover:text-gray-600"
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}
