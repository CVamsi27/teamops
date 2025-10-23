"use client";

import { useState } from "react";
import { useMe } from "@/hooks/useAuth";
import { useAssignRole, useRemoveMember } from "@/hooks/teams/useTeamInvites";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { toast } from "@workspace/ui/components/toast";
import { Shield, Users, Eye, Trash2, Edit2 } from "lucide-react";
import type { Role } from "@workspace/api";

interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: Role;
  createdAt?: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
}

interface TeamMembersListProps {
  teamId: string;
  isLoading?: boolean;
  members?: TeamMember[];
  onMembersChange?: () => void;
}

export function TeamMembersList({
  teamId,
  isLoading,
  members,
  onMembersChange,
}: TeamMembersListProps) {
  const { data: currentUser } = useMe();
  const assignRole = useAssignRole();
  const removeMember = useRemoveMember();

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | "">("");
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);

  const currentUserRole = members?.find(
    (m) => m.userId === currentUser?.id
  )?.role;

  const isCurrentUserAdmin = currentUserRole === "ADMIN";

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-4 w-4" />;
      case "MEMBER":
        return <Users className="h-4 w-4" />;
      case "VIEWER":
        return <Eye className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "default";
      case "MEMBER":
        return "secondary";
      case "VIEWER":
        return "outline";
    }
  };

  const handleEditRole = (member: TeamMember) => {
    setEditingMemberId(member.userId);
    setSelectedRole(member.role);
  };

  const handleSaveRole = async (member: TeamMember) => {
    if (!selectedRole || selectedRole === member.role) {
      setEditingMemberId(null);
      return;
    }

    assignRole.mutate(
      {
        userId: member.userId,
        teamId,
        role: selectedRole as Role,
      },
      {
        onSuccess: () => {
          toast.success(`Role updated to ${selectedRole}`);
          setEditingMemberId(null);
          setSelectedRole("");
          onMembersChange?.();
        },
        onError: (error: unknown) => {
          const errorMessage =
            error &&
            typeof error === "object" &&
            "response" in error &&
            error.response &&
            typeof error.response === "object" &&
            "data" in error.response &&
            error.response.data &&
            typeof error.response.data === "object" &&
            "message" in error.response.data
              ? (error.response.data as { message: string }).message
              : "Failed to update role";
          toast.error(errorMessage);
        },
      }
    );
  };

  const handleRemoveClick = (member: TeamMember) => {
    setMemberToRemove(member);
  };

  const handleConfirmRemove = () => {
    if (!memberToRemove) return;

    removeMember.mutate(
      {
        userId: memberToRemove.userId,
        teamId,
      },
      {
        onSuccess: () => {
          toast.success(`${memberToRemove.user?.email} removed from team`);
          setMemberToRemove(null);
          onMembersChange?.();
        },
        onError: (error: unknown) => {
          const errorMessage =
            error &&
            typeof error === "object" &&
            "response" in error &&
            error.response &&
            typeof error.response === "object" &&
            "data" in error.response &&
            error.response.data &&
            typeof error.response.data === "object" &&
            "message" in error.response.data
              ? (error.response.data as { message: string }).message
              : "Failed to remove member";
          toast.error(errorMessage);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton className="h-4 w-[250px] mb-2" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-8 w-[100px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!members || members.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No team members yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="font-medium">
                        {member.user?.name || member.user?.email || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {editingMemberId === member.userId ? (
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedRole}
                      onValueChange={(value) => setSelectedRole(value as Role)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VIEWER">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Viewer
                          </div>
                        </SelectItem>
                        <SelectItem value="MEMBER">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Member
                          </div>
                        </SelectItem>
                        <SelectItem value="ADMIN">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Admin
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSaveRole(member)}
                      disabled={assignRole.isPending}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingMemberId(null)}
                      disabled={assignRole.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      <div className="flex items-center gap-1">
                        {getRoleIcon(member.role)}
                        {member.role}
                      </div>
                    </Badge>

                    {isCurrentUserAdmin && member.userId !== currentUser?.id && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditRole(member)}
                          title="Edit member role"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveClick(member)}
                          className="text-destructive hover:text-destructive"
                          title="Remove member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {memberToRemove && (
        <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove{" "}
                <strong>{memberToRemove.user?.email}</strong> from this team?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end gap-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmRemove}
                disabled={removeMember.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {removeMember.isPending ? "Removing..." : "Remove"}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
