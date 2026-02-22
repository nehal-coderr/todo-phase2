import type { LucideIcon } from "lucide-react";
import { PrimaryButton } from "@/components/ui/primary-button";

interface EmptyStateProps {
  icon: LucideIcon;
  heading: string;
  subtext: string;
  actionLabel: string;
  onAction: () => void;
}

export function EmptyState({
  icon: Icon,
  heading,
  subtext,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Icon size={48} className="mb-4 text-gray-300" />
      <h3 className="text-lg font-medium text-gray-900">{heading}</h3>
      <p className="mt-1 text-sm text-gray-500">{subtext}</p>
      <div className="mt-6">
        <PrimaryButton label={actionLabel} onClick={onAction} />
      </div>
    </div>
  );
}
