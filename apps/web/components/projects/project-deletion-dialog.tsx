"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Trash2,
  AlertTriangle,
  CheckSquare,
  Loader2,
  Clock,
  CheckCircle,
} from "lucide-react";
import { api } from "../../lib/api";
import type { ProjectDeletionInfo } from "@workspace/api";

interface ProjectDeletionDialogProps {
  projectId: string;
  projectName: string;
  onConfirmDelete: () => void;
  isDeleting?: boolean;
}

export function ProjectDeletionDialog({
  projectId,
  projectName,
  onConfirmDelete,
  isDeleting = false,
}: ProjectDeletionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: deletionInfo, isLoading } = useQuery<ProjectDeletionInfo>({
    queryKey: ["project-deletion-info", projectId],
    queryFn: async () => {
      const response = await api.get(
        `/api/projects/${projectId}/deletion-info`,
      );
      return response.data;
    },
    enabled: isOpen, // Only fetch when dialog is opened
  });

  const handleConfirm = () => {
    onConfirmDelete();
    setIsOpen(false);
  };

  const hasData = deletionInfo && deletionInfo.tasksCount > 0;

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case "TODO":
        return <Clock className="h-3 w-3 text-orange-500" />;
      case "IN_PROGRESS":
        return <CheckSquare className="h-3 w-3 text-blue-500" />;
      case "DONE":
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      default:
        return <CheckSquare className="h-3 w-3 text-gray-500" />;
    }
  };

  const getTaskStatusLabel = (status: string) => {
    switch (status) {
      case "TODO":
        return "To Do";
      case "IN_PROGRESS":
        return "In Progress";
      case "DONE":
        return "Done";
      default:
        return status;
    }
  };

  const getTaskStatusCounts = () => {
    if (!deletionInfo?.tasksList) return null;

    const counts = {
      TODO: deletionInfo.tasksList.filter((t) => t.status === "TODO").length,
      IN_PROGRESS: deletionInfo.tasksList.filter(
        (t) => t.status === "IN_PROGRESS",
      ).length,
      DONE: deletionInfo.tasksList.filter((t) => t.status === "DONE").length,
    };

    return counts;
  };

  const statusCounts = getTaskStatusCounts();

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Delete</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Project
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Are you sure you want to delete{" "}
                <strong>&quot;{projectName}&quot;</strong>?
              </p>

              {isLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Checking dependencies...</span>
                </div>
              )}

              {deletionInfo && (
                <div className="space-y-3">
                  {hasData ? (
                    <>
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                        <p className="text-sm font-medium text-destructive mb-2">
                          This will permanently delete:
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckSquare className="h-4 w-4 text-destructive" />
                          <span>
                            {deletionInfo.tasksCount} task
                            {deletionInfo.tasksCount === 1 ? "" : "s"}
                          </span>
                        </div>

                        {statusCounts && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {statusCounts.TODO > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {statusCounts.TODO} to do
                              </Badge>
                            )}
                            {statusCounts.IN_PROGRESS > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {statusCounts.IN_PROGRESS} in progress
                              </Badge>
                            )}
                            {statusCounts.DONE > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {statusCounts.DONE} completed
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {deletionInfo.tasksList.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">
                            Tasks to be deleted:
                          </p>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {deletionInfo.tasksList.map((task) => (
                              <div
                                key={task.id}
                                className="flex items-center justify-between text-sm p-2 bg-muted rounded"
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {getTaskStatusIcon(task.status)}
                                  <span className="truncate">{task.title}</span>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="text-xs ml-2 flex-shrink-0"
                                >
                                  {getTaskStatusLabel(task.status)}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-sm text-destructive font-medium">
                        This action cannot be undone.
                      </p>
                    </>
                  ) : (
                    <div className="bg-muted/50 border rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">
                        This project has no tasks. It can be safely deleted.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive hover:bg-destructive/90"
            disabled={isLoading || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              "Delete Project"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
