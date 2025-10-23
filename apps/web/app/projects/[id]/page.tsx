"use client";
import { useParams } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";
import { useTeams } from "@/hooks/teams/useTeams";
import { useTasks } from "@/hooks/tasks/useTasks";
import { useProjectMembers } from "@/hooks/projects/useProjectMembers";
import { useMe } from "@/hooks/useAuth";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  ArrowLeft,
  Edit,
  Loader2,
  Users,
  CheckCircle,
  Circle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { ProjectMemberManagementDialog } from "@/components/projects/project-member-management-dialog";
import { ProjectMemberEditDialog } from "@/components/projects/project-member-edit-dialog";
import { LiveChat } from "@/components/chat/live-chat";
import { ActivityTimeline } from "@/components/activity/activity-timeline";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { get } = useProjects();
  const teamsQuery = useTeams();
  const projectQuery = get(projectId);
  const tasksQuery = useTasks();
  const membersQuery = useProjectMembers(projectId);
  const { data: currentUser } = useMe();

  const getTeamName = (teamId: string) => {
    const team = teamsQuery.list.data?.find((t) => t.id === teamId);
    return team?.name || "Unknown Team";
  };

  const getProjectTasks = () => {
    return tasksQuery.list.data?.filter((t) => t.projectId === projectId) || [];
  };

  const getDisplayMembers = () => {
    const members = membersQuery.data || [];
    // Check if current user is already in the members list
    if (currentUser && !members.some((m) => m.user?.id === currentUser.id)) {
      // Add current user with VIEWER role as placeholder
      return [
        ...members,
        {
          id: `temp-${currentUser.id}`,
          role: "VIEWER",
          userId: currentUser.id,
          projectId,
          user: {
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name,
          },
        },
      ];
    }
    return members;
  };

  // Get current user's role in this project
  const getCurrentUserProjectRole = () => {
    if (!currentUser) return undefined;
    const userMember = membersQuery.data?.find(
      (m) => m.user?.id === currentUser.id
    );
    return userMember?.role as
      | "LEAD"
      | "CONTRIBUTOR"
      | "REVIEWER"
      | "VIEWER"
      | undefined;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "TODO":
        return <Circle className="h-4 w-4" />;
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4" />;
      case "DONE":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "secondary";
      case "IN_PROGRESS":
        return "default";
      case "DONE":
        return "default";
      default:
        return "secondary";
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case "HIGH":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "MEDIUM":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "LOW":
        return <Circle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "default";
      case "LOW":
        return "secondary";
      default:
        return "outline";
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

  const projectTasks = getProjectTasks();
  const todoTasks = projectTasks.filter((t) => t.status === "TODO").length;
  const inProgressTasks = projectTasks.filter(
    (t) => t.status === "IN_PROGRESS"
  ).length;
  const doneTasks = projectTasks.filter((t) => t.status === "DONE").length;

  if (projectQuery.isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading project...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (projectQuery.error || !projectQuery.data) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Project not found or you don&apos;t have permission to view it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{projectQuery.data.name}</h1>
            <p className="text-muted-foreground mt-1">
              {projectQuery.data.description ||
                "No description provided for this project"}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/projects/${projectId}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Project
          </Link>
        </Button>
      </div>

      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Team</p>
            <Badge variant="secondary">
              <Users className="h-3 w-3 mr-1" />
              {getTeamName(projectQuery.data.teamId)}
            </Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Project ID</p>
              <p className="text-sm font-mono break-all">
                {projectQuery.data.id}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Created</p>
              <p className="text-sm">
                {projectQuery.data.createdAt
                  ? new Date(projectQuery.data.createdAt).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Updated</p>
              <p className="text-sm">
                {projectQuery.data.updatedAt
                  ? new Date(projectQuery.data.updatedAt).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Members */}
      <Card>
        <CardHeader className="flex items-center justify-between flex-row">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Project Members
          </CardTitle>
          <ProjectMemberManagementDialog
            projectId={projectId}
            teamId={projectQuery.data.teamId}
            userRole={getCurrentUserProjectRole()}
            existingMemberIds={
              membersQuery.data?.map((m) => m.user?.id).filter(Boolean) as string[] || []
            }
            onMembersChanged={() => membersQuery.refetch()}
          />
        </CardHeader>
        <CardContent>
          {membersQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading members...
            </div>
          ) : getDisplayMembers().length > 0 ? (
            <div className="space-y-2">
              {getDisplayMembers().map((member) => (
                <div
                  key={member.id}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    member.user?.id === currentUser?.id
                      ? "bg-primary/5 border-primary/30"
                      : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">
                        {member.user?.name || member.user?.email || "Unknown"}
                      </p>
                      {member.user?.id === currentUser?.id && (
                        <Badge variant="outline" className="text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {member.user?.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleBadgeColor(member.role as "LEAD" | "CONTRIBUTOR" | "REVIEWER" | "VIEWER")}>
                      {member.role}
                    </Badge>
                    <ProjectMemberEditDialog
                      projectId={projectId}
                      userId={member.user?.id || ""}
                      memberName={member.user?.name || member.user?.email || "Unknown"}
                      currentRole={member.role as "LEAD" | "CONTRIBUTOR" | "REVIEWER" | "VIEWER"}
                      userRole={getCurrentUserProjectRole()}
                      onMembersChanged={() => membersQuery.refetch()}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No members assigned yet. Add members using the button above.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Task Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Task Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-500">{todoTasks}</p>
              <p className="text-sm text-muted-foreground mt-1">To Do</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-yellow-500">
                {inProgressTasks}
              </p>
              <p className="text-sm text-muted-foreground mt-1">In Progress</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-500">{doneTasks}</p>
              <p className="text-sm text-muted-foreground mt-1">Done</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <span className="font-semibold">{projectTasks.length}</span>{" "}
              total tasks in this project
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Project Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {projectTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No tasks in this project yet.{" "}
              <Link href="/tasks/new" className="text-primary hover:underline">
                Create one
              </Link>
            </p>
          ) : (
            <div className="space-y-2">
              {projectTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-1">{getStatusIcon(task.status)}</div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="font-medium text-sm hover:underline block truncate"
                    >
                      {task.title}
                    </Link>
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      variant={getStatusColor(task.status)}
                      className="text-xs whitespace-nowrap"
                    >
                      {task.status.replace("_", " ")}
                    </Badge>
                    {task.priority && (
                      <Badge
                        variant={getPriorityColor(task.priority)}
                        className="text-xs flex items-center gap-1 whitespace-nowrap"
                      >
                        {getPriorityIcon(task.priority)}
                        {task.priority}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveChat
          roomId={projectId}
          roomType="project"
          roomName={projectQuery.data.name}
        />

        {/* Project Activity Timeline */}
        <ActivityTimeline
          entityId={projectId}
          entityType="project"
          limit={20}
        />
      </div>
    </div>
  );
}
