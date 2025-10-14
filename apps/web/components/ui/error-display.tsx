"use client";

import { AlertCircle, RefreshCw, Wifi } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

interface ErrorDisplayProps {
  error: Error | null;
  onRetry?: () => void;
  title?: string;
  className?: string;
}

export function ErrorDisplay({
  error,
  onRetry,
  title = "Error",
  className = "",
}: ErrorDisplayProps) {
  if (!error) return null;

  const getErrorIcon = (errorMessage: string) => {
    if (errorMessage.includes("Network error")) {
      return <Wifi className="h-4 w-4" />;
    }
    return <AlertCircle className="h-4 w-4" />;
  };

  const isDestructive =
    error.message.includes("Unauthorized") ||
    error.message.includes("Forbidden");

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        isDestructive
          ? "border-destructive/50 text-destructive bg-destructive/10"
          : "border-yellow-500/50 text-yellow-700 bg-yellow-50 dark:bg-yellow-950/30 dark:text-yellow-300",
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        {getErrorIcon(error.message)}
        <h4 className="font-medium">{title}</h4>
      </div>
      <p className="text-sm mb-3">{error.message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}
