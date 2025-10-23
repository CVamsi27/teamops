"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Card } from "@workspace/ui/components/card";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useBulkReassignTasks } from "@/hooks/tasks/useBulkReassignTasks";

interface BulkReassignmentToolProps {
  tasks: any[];
  projectMembers: Array<{ id: string; name: string; email: string }>;
  onReassignmentComplete?: () => void;
}

export function BulkReassignmentTool({
  tasks,
  projectMembers,
  onReassignmentComplete,
}: BulkReassignmentToolProps) {
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(
    new Set()
  );
  const [newAssigneeId, setNewAssigneeId] = useState<string>("");
  const bulkReassign = useBulkReassignTasks();

  const handleReassign = async () => {
    if (selectedTaskIds.size === 0 || !newAssigneeId) return;

    try {
      await bulkReassign.mutate({
        taskIds: Array.from(selectedTaskIds),
        newAssigneeId,
      });

      // Reset state on success
      setSelectedTaskIds(new Set());
      setNewAssigneeId("");
      onReassignmentComplete?.();
    } catch (error) {
      console.error("Bulk reassignment failed:", error);
    }
  };

  if (selectedTaskIds.size === 0) {
    return null;
  }

  return (
    <Card className="p-4 border-blue-200 bg-blue-50 sticky bottom-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedTaskIds.size} task{selectedTaskIds.size !== 1 ? "s" : ""}{" "}
              selected
            </span>
          </div>

          {bulkReassign.data && (
            <div className="text-sm space-y-1">
              {bulkReassign.data.updated > 0 && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Updated {bulkReassign.data.updated} task
                  {bulkReassign.data.updated !== 1 ? "s" : ""}
                </div>
              )}
              {bulkReassign.data.failed > 0 && (
                <div className="flex items-center gap-2 text-orange-700">
                  <AlertCircle className="h-4 w-4" />
                  Failed: {bulkReassign.data.failed} task
                  {bulkReassign.data.failed !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={newAssigneeId} onValueChange={setNewAssigneeId}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select assignee" />
            </SelectTrigger>
            <SelectContent>
              {projectMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name || member.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleReassign}
            disabled={!newAssigneeId || bulkReassign.isPending}
            size="sm"
          >
            {bulkReassign.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            {bulkReassign.isPending ? "Reassigning..." : "Reassign"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

