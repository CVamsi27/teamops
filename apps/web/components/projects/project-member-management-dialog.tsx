"use client";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Plus } from "lucide-react";
import { useTeamMembers } from "@/hooks/teams/useTeamInvites";
import {
  useAddProjectMember,
} from "@/hooks/projects/useProjectMemberOperations";
import { toast } from "@workspace/ui/components/toast";

interface ProjectMemberManagementDialogProps {
  projectId: string;
  teamId: string;
  userRole?: "LEAD" | "CONTRIBUTOR" | "REVIEWER" | "VIEWER";
  existingMemberIds?: string[];
  onMembersChanged?: () => void;
}

const roleDescriptions: Record<string, string> = {
  LEAD: "Full control over project settings and members",
  CONTRIBUTOR: "Can create and edit tasks",
  REVIEWER: "Can view and comment on tasks",
  VIEWER: "Read-only access to project",
};

// Role hierarchy: Higher roles can add lower roles
const roleHierarchy: Record<string, ("LEAD" | "CONTRIBUTOR" | "REVIEWER" | "VIEWER")[]> = {
  LEAD: ["LEAD", "CONTRIBUTOR", "REVIEWER", "VIEWER"],
  CONTRIBUTOR: ["CONTRIBUTOR", "REVIEWER", "VIEWER"],
  REVIEWER: ["REVIEWER", "VIEWER"],
  VIEWER: [],
};

export function ProjectMemberManagementDialog({
  projectId,
  teamId,
  userRole = "VIEWER",
  existingMemberIds = [],
  onMembersChanged,
}: ProjectMemberManagementDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState("");
  const [selectedTeamMemberRole, setSelectedTeamMemberRole] = useState("VIEWER");
  const [isLoading, setIsLoading] = useState(false);

  const teamMembersQuery = useTeamMembers(teamId || "");
  const allTeamMembers = teamMembersQuery.data || [];
  
  // Filter out existing members and current user
  const availableMembers = allTeamMembers.filter(
    (m) => m.user?.id && !existingMemberIds.includes(m.user.id)
  );

  const addMember = useAddProjectMember();

  // Get allowed roles for current user
  const allowedRoles = roleHierarchy[userRole] || [];

  const handleAddMember = async () => {
    if (!selectedTeamMemberId) {
      toast.error("Please select a member");
      return;
    }

    if (!allowedRoles.includes(selectedTeamMemberRole as "LEAD" | "CONTRIBUTOR" | "REVIEWER" | "VIEWER")) {
      toast.error("You don't have permission to assign this role");
      return;
    }

    const selectedMember = allTeamMembers.find(
      (m) => m.user?.id === selectedTeamMemberId
    );
    if (!selectedMember?.user) {
      toast.error("Invalid team member selected");
      return;
    }

    setIsLoading(true);
    try {
      await addMember.mutateAsync({
        userId: selectedMember.user.id,
        projectId,
        role: selectedTeamMemberRole as "LEAD" | "CONTRIBUTOR" | "REVIEWER" | "VIEWER",
      });
      toast.success("Member added successfully");
      setSelectedTeamMemberId("");
      setSelectedTeamMemberRole("VIEWER");
      onMembersChanged?.();
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to add member", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Only show button if user has permission to add members
  if (allowedRoles.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Members
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Members to Project</DialogTitle>
          <DialogDescription>
            Select team members and assign their project roles
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Member and Role Selection - Same Row */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Member</label>
            <div className="flex gap-2">
              <Select
                value={selectedTeamMemberId}
                onValueChange={setSelectedTeamMemberId}
                disabled={availableMembers.length === 0}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choose a team member" />
                </SelectTrigger>
                <SelectContent>
                  {availableMembers.length > 0 ? (
                    availableMembers.map((member) => (
                      <SelectItem
                        key={member.user?.id}
                        value={member.user?.id || ""}
                      >
                        {member.user?.name || member.user?.email || "Unknown"}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-members" disabled>
                      No available members
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              <Select
                value={selectedTeamMemberRole}
                onValueChange={setSelectedTeamMemberRole}
              >
                <SelectTrigger className="w-36">
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
          </div>

          {/* Role Description */}
          {selectedTeamMemberRole && (
            <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
              {roleDescriptions[selectedTeamMemberRole]}
            </div>
          )}

          {/* Available Roles Info */}
          {availableMembers.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              All team members are already in this project
            </p>
          )}

          {/* Add Button */}
          <Button
            onClick={handleAddMember}
            disabled={
              isLoading || !selectedTeamMemberId || availableMembers.length === 0
            }
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>

          {/* Role Descriptions */}
          <div className="border-t pt-4 space-y-2">
            <h4 className="font-semibold text-sm">Role Permissions</h4>
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
      </DialogContent>
    </Dialog>
  );
}
