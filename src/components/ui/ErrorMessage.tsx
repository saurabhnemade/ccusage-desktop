import { AlertCircle } from "lucide-react";

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
      <AlertCircle size={16} />
      {message}
    </div>
  );
}
