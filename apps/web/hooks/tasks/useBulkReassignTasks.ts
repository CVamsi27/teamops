import { useApiMutation } from "@/hooks/api/useApiMutation";
import { z } from "zod";

export function useBulkReassignTasks() {
  const BulkReassignSchema = z.object({
    taskIds: z.array(z.string()),
    newAssigneeId: z.string(),
  });

  const mutation = useApiMutation<
    { updated: number; failed: number },
    { taskIds: string[]; newAssigneeId: string }
  >(
    "/tasks/bulk/reassign",
    ["tasks"],
    BulkReassignSchema,
    {
      method: "post",
    }
  );

  return mutation;
}
