"use client";

import type { LucideIcon } from "lucide-react";

interface IconButtonProps {
  icon: LucideIcon;
  ariaLabel: string;
  onClick?: (e: React.MouseEvent) => void;
  variant?: "default" | "primary" | "danger";
  disabled?: boolean;
}

const variantClasses = {
  default: "text-gray-400 hover:bg-gray-100 hover:text-gray-600",
  primary: "text-gray-400 hover:bg-primary-50 hover:text-primary-600",
  danger: "text-gray-400 hover:bg-danger-50 hover:text-danger-600",
};

export function IconButton({
  icon: Icon,
  ariaLabel,
  onClick,
  variant = "default",
  disabled = false,
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]}`}
    >
      <Icon size={18} />
    </button>
  );
}
