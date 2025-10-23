"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMe } from "@/hooks/useAuth";
import { useInviteMember, useTeamMembers } from "@/hooks/teams/useTeamInvites";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Badge } from "@workspace/ui/components/badge";
import { toast } from "@workspace/ui/components/toast";
import { type InviteMember, type Role } from "@workspace/api";
import { UserPlus, Mail, Shield, Eye, Users } from "lucide-react";

type InviteMemberForm = InviteMember;

interface TeamMemberInviteProps {
  teamId: string;
  teamName: string;
  onInviteSent?: () => void;
  userTeamRole?: Role;
}

export function TeamMemberInvite({
  teamId,
  teamName,
  onInviteSent,
  userTeamRole,
}: TeamMemberInviteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: currentUser } = useMe();
  const inviteMember = useInviteMember();
  
  // Fetch team members to determine user's role if not provided
  const membersQuery = useTeamMembers(teamId);
  const userRoleFromMembers = membersQuery.data?.find(
    (m) => m.userId === currentUser?.id
  )?.role;
  
  // Use provided role or fetch from members
  const currentUserRole = userTeamRole || userRoleFromMembers;

  const form = useForm<InviteMemberForm>({
    defaultValues: {
      role: "MEMBER",
    },
  });

  // Determine available roles based on current user's role
  const getAvailableRoles = (): Role[] => {
    if (currentUserRole === "ADMIN") {
      return ["ADMIN", "MEMBER", "VIEWER"];
    }
    if (currentUserRole === "MEMBER") {
      return ["VIEWER"];
    }
    // VIEWER cannot invite anyone
    return [];
  };

  const availableRoles = getAvailableRoles();
  const canInvite = availableRoles.length > 0;

  // Set initial role if not available
  const currentRole = form.watch("role");
  if (currentRole && !availableRoles.includes(currentRole) && availableRoles.length > 0) {
    form.setValue("role", availableRoles[0] as Role);
  }

  const onSubmit = (data: InviteMemberForm) => {
    if (!canInvite) {
      toast.error("You don't have permission to invite members");
      return;
    }

    inviteMember.mutate(
      { ...data, teamId },
      {
        onSuccess: () => {
          toast.success(`Invitation sent to ${data.email}`);
          form.reset();
          setIsOpen(false);
          onInviteSent?.();
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
              : "Failed to send invitation";
          toast.error(errorMessage);
        },
      },
    );
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-4 w-4" />;
      case "MEMBER":
        return <Users className="h-4 w-4" />;
      case "VIEWER":
        return <Eye className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Full access to team settings, projects, and members";
      case "MEMBER":
        return "Can create and manage tasks, view all team content";
      case "VIEWER":
        return "Read-only access to team content and tasks";
      default:
        return "";
    }
  };

  if (!canInvite) {
    return (
      <Button disabled title="Your role doesn't allow inviting members">
        <UserPlus className="h-4 w-4 mr-2" />
        Invite Member
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Send an invitation to join <strong>{teamName}</strong>
          </p>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                className="pl-10"
                {...form.register("email")}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={form.watch("role")}
              onValueChange={(value: "ADMIN" | "MEMBER" | "VIEWER") =>
                form.setValue("role", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.includes("VIEWER") && (
                  <SelectItem value="VIEWER">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>Viewer</span>
                    </div>
                  </SelectItem>
                )}
                {availableRoles.includes("MEMBER") && (
                  <SelectItem value="MEMBER">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Member</span>
                    </div>
                  </SelectItem>
                )}
                {availableRoles.includes("ADMIN") && (
                  <SelectItem value="ADMIN">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm text-destructive">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>

          {form.watch("role") && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2 mb-2">
                  {getRoleIcon(form.watch("role"))}
                  <Badge variant="outline">{form.watch("role")}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getRoleDescription(form.watch("role"))}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={inviteMember.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={inviteMember.isPending}>
              {inviteMember.isPending ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
