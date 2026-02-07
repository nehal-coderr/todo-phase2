import { AlertTriangle } from "lucide-react";
import { SecondaryButton } from "@/components/ui/secondary-button";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <AlertTriangle size={48} className="mb-4 text-danger-400" />
      <p className="text-sm text-gray-700">{message}</p>
      <div className="mt-6">
        <SecondaryButton label="Try Again" onClick={onRetry} />
      </div>
    </div>
  );
}
