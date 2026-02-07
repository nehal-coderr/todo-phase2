"use client";

import { Loader2 } from "lucide-react";

interface PrimaryButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  type?: "button" | "submit";
}

export function PrimaryButton({
  label,
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  type = "button",
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex min-w-[120px] items-center justify-center gap-2 rounded-md bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 active:bg-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${fullWidth ? "w-full" : ""}`}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {label}
    </button>
  );
}
