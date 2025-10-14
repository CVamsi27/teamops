import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@workspace/ui/components/toast";
import {
  SyncStatusSchema,
  SyncResponseSchema,
  type SyncStatus,
  type SyncResponse,
} from "@workspace/api";

export function useGoogleCalendarSync() {
  const [isLoading, setIsLoading] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResponse[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const getSyncStatus = async (): Promise<SyncStatus | null> => {
    try {
      const response = await api.get(
        "/integrations/google-calendar/sync-tasks-projects",
      );
      return SyncStatusSchema.parse(response.data);
    } catch (error) {
      toast.error("Failed to get sync status", {
        description: "Unable to retrieve calendar sync information.",
        duration: 4000,
      });
      return null;
    }
  };

  const syncTask = async (taskId?: string): Promise<SyncResponse | null> => {
    try {
      setIsLoading(true);
      const response = await api.post(
        "/integrations/google-calendar/sync-task",
        taskId ? { taskId } : {},
      );
      const result = SyncResponseSchema.parse(response.data);
      setSyncResults((prev) => [...prev, result]);
      setLastSyncTime(new Date().toISOString());
      return result;
    } catch (error) {
      toast.error("Failed to sync task", {
        description: "Unable to sync task to calendar.",
        duration: 4000,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const syncProject = async (
    projectId?: string,
  ): Promise<SyncResponse | null> => {
    try {
      setIsLoading(true);
      const response = await api.post(
        "/integrations/google-calendar/sync-project",
        projectId ? { projectId } : {},
      );
      const result = SyncResponseSchema.parse(response.data);
      setSyncResults((prev) => [...prev, result]);
      setLastSyncTime(new Date().toISOString());
      return result;
    } catch (error) {
      toast.error("Failed to sync project", {
        description: "Unable to sync project to calendar.",
        duration: 4000,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const syncAll = async (): Promise<{
    taskResults: SyncResponse[];
    projectResults: SyncResponse[];
  }> => {
    setIsLoading(true);
    setSyncResults([]);

    const taskResults: SyncResponse[] = [];
    const projectResults: SyncResponse[] = [];

    try {
      const status = await getSyncStatus();
      if (!status) {
        return { taskResults, projectResults };
      }

      if (status.tasksCount && status.tasksCount > 0) {
        const taskResult = await syncTask();
        if (taskResult) {
          taskResults.push(taskResult);
        }
      }

      if (status.projectsCount && status.projectsCount > 0) {
        const projectResult = await syncProject();
        if (projectResult) {
          projectResults.push(projectResult);
        }
      }

      setLastSyncTime(new Date().toISOString());

      return { taskResults, projectResults };
    } catch (error) {
      toast.error("Failed to sync all items", {
        description: "Some items couldn't be synced to calendar.",
        duration: 5000,
      });
      return { taskResults, projectResults };
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setSyncResults([]);
  };

  return {
    isLoading,
    syncResults,
    lastSyncTime,
    getSyncStatus,
    syncTask,
    syncProject,
    syncAll,
    clearResults,
  };
}
