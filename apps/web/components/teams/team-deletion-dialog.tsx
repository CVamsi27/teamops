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
  FolderOpen,
  CheckSquare,
  Loader2,
} from "lucide-react";
import { api } from "../../lib/api";
import type { TeamDeletionInfo } from "@workspace/api";

interface TeamDeletionDialogProps {
  teamId: string;
  teamName: string;
  onConfirmDelete: () => void;
  isDeleting?: boolean;
}

export function TeamDeletionDialog({
  teamId,
  teamName,
  onConfirmDelete,
  isDeleting = false,
}: TeamDeletionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: deletionInfo, isLoading } = useQuery<TeamDeletionInfo>({
    queryKey: ["team-deletion-info", teamId],
    queryFn: async () => {
      const response = await api.get(`/api/teams/${teamId}/deletion-info`);
      return response.data;
    },
    enabled: isOpen, // Only fetch when dialog is opened
  });

  const handleConfirm = () => {
    onConfirmDelete();
    setIsOpen(false);
  };

  const hasData =
    deletionInfo &&
    (deletionInfo.projectsCount > 0 || deletionInfo.tasksCount > 0);

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
            Delete Team
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Are you sure you want to delete{" "}
                <strong>&quot;{teamName}&quot;</strong>?
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
                        <ul className="space-y-2">
                          {deletionInfo.projectsCount > 0 && (
                            <li className="flex items-center gap-2 text-sm">
                              <FolderOpen className="h-4 w-4 text-destructive" />
                              <span>
                                {deletionInfo.projectsCount} project
                                {deletionInfo.projectsCount === 1 ? "" : "s"}
                              </span>
                            </li>
                          )}
                          {deletionInfo.tasksCount > 0 && (
                            <li className="flex items-center gap-2 text-sm">
                              <CheckSquare className="h-4 w-4 text-destructive" />
                              <span>
                                {deletionInfo.tasksCount} task
                                {deletionInfo.tasksCount === 1 ? "" : "s"}
                              </span>
                            </li>
                          )}
                        </ul>
                      </div>

                      {deletionInfo.projectsList.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">
                            Projects to be deleted:
                          </p>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {deletionInfo.projectsList.map((project) => (
                              <div
                                key={project.id}
                                className="flex items-center justify-between text-sm p-2 bg-muted rounded"
                              >
                                <span className="truncate">{project.name}</span>
                                {project.tasksCount > 0 && (
                                  <Badge
                                    variant="secondary"
                                    className="ml-2 text-xs"
                                  >
                                    {project.tasksCount} task
                                    {project.tasksCount === 1 ? "" : "s"}
                                  </Badge>
                                )}
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
                        This team has no projects or tasks. It can be safely
                        deleted.
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
              "Delete Team"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
