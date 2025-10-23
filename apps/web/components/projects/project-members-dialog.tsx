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
import { Input } from "@workspace/ui/components/input";
import { Users, Plus, Trash2 } from "lucide-react";
import { useTeamMembers } from "@/hooks/teams/useTeamInvites";

interface ProjectMember {
  id: string;
  email: string;
  name: string;
  role: "LEAD" | "CONTRIBUTOR" | "REVIEWER" | "VIEWER";
}

interface ProjectMembersDialogProps {
  teamId?: string;
  members?: ProjectMember[];
  isLead?: boolean;
  onAddMember?: (email: string, role: string) => Promise<void>;
  onRemoveMember?: (memberId: string) => Promise<void>;
  onUpdateRole?: (memberId: string, role: string) => Promise<void>;
}

const roleDescriptions: Record<string, string> = {
  LEAD: "Full control over project settings and members",
  CONTRIBUTOR: "Can create and edit tasks",
  REVIEWER: "Can view and comment on tasks",
  VIEWER: "Read-only access to project",
};

export function ProjectMembersDialog({
  teamId,
  members = [],
  isLead = false,
  onAddMember,
  onRemoveMember,
  onUpdateRole,
}: ProjectMembersDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("VIEWER");
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState("");
  const [selectedTeamMemberRole, setSelectedTeamMemberRole] = useState("VIEWER");
  const [isLoading, setIsLoading] = useState(false);
  const [addMethod, setAddMethod] = useState<"email" | "team">("email");

  // Fetch team members if teamId is provided and user is a lead
  const teamMembersQuery = useTeamMembers(teamId || "");
  const teamMembers = teamId && isLead ? teamMembersQuery.data : [];

  const handleAddMember = async () => {
    if (!isLead || !onAddMember) return;

    let email = newMemberEmail;
    let role = newMemberRole;

    // If adding from team member list, get the email from selected member
    if (addMethod === "team" && selectedTeamMemberId && teamMembers) {
      const selectedMember = teamMembers.find((m) => m.user?.id === selectedTeamMemberId);
      if (!selectedMember?.user?.email) return;
      email = selectedMember.user.email;
      role = selectedTeamMemberRole;
    } else if (addMethod === "email" && !newMemberEmail) {
      return;
    }

    setIsLoading(true);
    try {
      await onAddMember(email, role);
      setNewMemberEmail("");
      setSelectedTeamMemberId("");
      setNewMemberRole("VIEWER");
      setSelectedTeamMemberRole("VIEWER");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!isLead || !onRemoveMember) return;

    setIsLoading(true);
    try {
      await onRemoveMember(memberId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    if (!isLead || !onUpdateRole) return;

    setIsLoading(true);
    try {
      await onUpdateRole(memberId, newRole);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeColor = (
    role: "LEAD" | "CONTRIBUTOR" | "REVIEWER" | "VIEWER"
  ) => {
    switch (role) {
      case "LEAD":
        return "destructive";
      case "CONTRIBUTOR":
        return "default";
      case "REVIEWER":
        return "secondary";
      case "VIEWER":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Members</span>
          <span className="sm:hidden">({members.length})</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Project Members</DialogTitle>
          <DialogDescription>
            View and manage project members and their roles
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Member Section */}
          {isLead && (
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-sm">Add New Member</h3>
              
              {/* Method Selection */}
              <div className="flex gap-2">
                <Button
                  variant={addMethod === "email" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAddMethod("email")}
                >
                  Add by Email
                </Button>
                {teamMembers && teamMembers.length > 0 && (
                  <Button
                    variant={addMethod === "team" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAddMethod("team")}
                  >
                    Add from Team
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {addMethod === "email" ? (
                  <>
                    <Input
                      type="email"
                      placeholder="Enter member email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      disabled={isLoading}
                    />
                    <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LEAD">Lead</SelectItem>
                        <SelectItem value="CONTRIBUTOR">Contributor</SelectItem>
                        <SelectItem value="REVIEWER">Reviewer</SelectItem>
                        <SelectItem value="VIEWER">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                      {roleDescriptions[newMemberRole]}
                    </div>
                  </>
                ) : (
                  <>
                    <Select value={selectedTeamMemberId} onValueChange={setSelectedTeamMemberId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers?.map((member) => (
                          <SelectItem key={member.user?.id} value={member.user?.id || ""}>
                            {member.user?.name || member.user?.email || "Unknown"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedTeamMemberRole} onValueChange={setSelectedTeamMemberRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LEAD">Lead</SelectItem>
                        <SelectItem value="CONTRIBUTOR">Contributor</SelectItem>
                        <SelectItem value="REVIEWER">Reviewer</SelectItem>
                        <SelectItem value="VIEWER">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                      {roleDescriptions[selectedTeamMemberRole]}
                    </div>
                  </>
                )}
                <Button
                  onClick={handleAddMember}
                  disabled={
                    isLoading ||
                    (addMethod === "email" && !newMemberEmail) ||
                    (addMethod === "team" && !selectedTeamMemberId)
                  }
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">
              Project Members ({members.length})
            </h3>
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No members assigned yet
              </p>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isLead ? (
                        <>
                          <Select
                            value={member.role}
                            onValueChange={(newRole) =>
                              handleUpdateRole(member.id, newRole)
                            }
                            disabled={isLoading}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LEAD">Lead</SelectItem>
                              <SelectItem value="CONTRIBUTOR">
                                Contributor
                              </SelectItem>
                              <SelectItem value="REVIEWER">Reviewer</SelectItem>
                              <SelectItem value="VIEWER">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={isLoading}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Badge variant={getRoleBadgeColor(member.role)}>
                          {member.role}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Role Descriptions */}
          <div className="border-t pt-4 space-y-2">
            <h3 className="font-semibold text-sm">Role Permissions</h3>
            <div className="space-y-2 text-xs">
              <div>
                <Badge variant="destructive" className="mb-1">
                  Lead
                </Badge>
                <p className="text-muted-foreground">
                  Full control over project settings, members, and tasks
                </p>
              </div>
              <div>
                <Badge className="mb-1">Contributor</Badge>
                <p className="text-muted-foreground">
                  Can create, edit, and manage tasks
                </p>
              </div>
              <div>
                <Badge variant="secondary" className="mb-1">
                  Reviewer
                </Badge>
                <p className="text-muted-foreground">
                  Can view tasks and add comments
                </p>
              </div>
              <div>
                <Badge variant="outline" className="mb-1">
                  Viewer
                </Badge>
                <p className="text-muted-foreground">
                  Read-only access to view tasks and project
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
