"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Edit2 } from "lucide-react";
import { useState } from "react";
import {
  useUpdateProjectMemberRole,
  useRemoveProjectMember,
} from "@/hooks/projects/useProjectMemberOperations";
import { toast } from "@workspace/ui/components/toast";

interface ProjectMemberEditDialogProps {
  projectId: string;
  userId: string;
  memberName: string;
  currentRole: "LEAD" | "CONTRIBUTOR" | "REVIEWER" | "VIEWER";
  userRole?: "LEAD" | "CONTRIBUTOR" | "REVIEWER" | "VIEWER";
  onMembersChanged?: () => void;
}

const roleDescriptions: Record<string, string> = {
  LEAD: "Full control over project settings and members",
  CONTRIBUTOR: "Can create and edit tasks",
  REVIEWER: "Can view and comment on tasks",
  VIEWER: "Read-only access to project",
};

// Role hierarchy: Higher roles can modify lower roles
const roleHierarchy: Record<string, ("LEAD" | "CONTRIBUTOR" | "REVIEWER" | "VIEWER")[]> = {
  LEAD: ["LEAD", "CONTRIBUTOR", "REVIEWER", "VIEWER"],
  CONTRIBUTOR: ["CONTRIBUTOR", "REVIEWER", "VIEWER"],
  REVIEWER: ["REVIEWER", "VIEWER"],
  VIEWER: [],
};

export function ProjectMemberEditDialog({
  projectId,
  userId,
  memberName,
  currentRole,
  userRole = "VIEWER",
  onMembersChanged,
}: ProjectMemberEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [isLoading, setIsLoading] = useState(false);

  const updateRole = useUpdateProjectMemberRole();
  const removeMember = useRemoveProjectMember();

  // Get allowed roles for current user
  const allowedRoles = roleHierarchy[userRole] || [];

  // Can only edit if user has higher role than member
  const canEdit = allowedRoles.includes(currentRole);

  const handleUpdateRole = async () => {
    if (!canEdit) {
      toast.error("You don't have permission to edit this member");
      return;
    }

    if (!allowedRoles.includes(selectedRole)) {
      toast.error("You don't have permission to assign this role");
      return;
    }

    if (selectedRole === currentRole) {
      toast.info("No changes made");
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      await updateRole.mutateAsync({
        projectId,
        memberId: userId,
        role: selectedRole,
      });
      toast.success("Member role updated successfully");
      onMembersChanged?.();
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to update member role", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!canEdit) {
      toast.error("You don't have permission to remove this member");
      return;
    }

    if (
      !confirm(`Are you sure you want to remove ${memberName} from the project?`)
    ) {
      return;
    }

    setIsLoading(true);
    try {
      await removeMember.mutateAsync({
        projectId,
        memberId: userId,
      });
      toast.success("Member removed successfully");
      onMembersChanged?.();
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to remove member", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!canEdit) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1 hover:bg-muted rounded-md transition-colors"
        title="Edit member"
      >
        <Edit2 className="h-4 w-4" />
      </button>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>
            Update {memberName}&apos;s role or remove from project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Member Info */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">{memberName}</p>
            <Badge className="mt-2">{currentRole}</Badge>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Change Role</label>
            <Select
              value={selectedRole}
              onValueChange={(value) =>
                setSelectedRole(
                  value as "LEAD" | "CONTRIBUTOR" | "REVIEWER" | "VIEWER"
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allowedRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role Description */}
          {selectedRole && (
            <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
              {roleDescriptions[selectedRole]}
            </div>
          )}

          {/* Role Permissions Info */}
          <div className="border-t pt-4 space-y-2">
            <h4 className="font-semibold text-sm">Available Roles</h4>
            <div className="space-y-2 text-xs">
              {allowedRoles.map((role) => (
                <div key={role}>
                  <Badge
                    variant={
                      role === "LEAD"
                        ? "destructive"
                        : role === "CONTRIBUTOR"
                          ? "default"
                          : role === "REVIEWER"
                            ? "secondary"
                            : "outline"
                    }
                    className="mb-1"
                  >
                    {role}
                  </Badge>
                  <p className="text-muted-foreground">
                    {roleDescriptions[role]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="destructive"
            onClick={handleRemoveMember}
            disabled={isLoading}
          >
            Remove Member
          </Button>
          <div className="flex-1" />
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateRole} disabled={isLoading}>
            Update Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
