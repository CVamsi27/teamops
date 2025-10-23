"use client";
import { useProjects } from "@/hooks/useProjects";
import { useTeams } from "@/hooks/teams/useTeams";
import { type Project } from "@workspace/api";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Plus, Edit, Users, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProjectDeletionDialog } from "@/components/projects/project-deletion-dialog";
import { ProjectMembersDialog } from "@/components/projects/project-members-dialog";
import { ProjectsInfoDialog } from "@/components/projects/projects-info-dialog";

export default function ProjectsPage() {
  const { list, remove } = useProjects();
  const teamsQuery = useTeams();
  const [deletingProject, setDeletingProject] = useState<string | null>(null);

  const handleDelete = (projectId: string) => {
    setDeletingProject(projectId);
    remove.mutate(
      { id: projectId },
      {
        onSuccess: () => {
          setDeletingProject(null);
        },
        onError: () => {
          setDeletingProject(null);
        },
      },
    );
  };

  const getTeamName = (teamId: string) => {
    const team = teamsQuery.list.data?.find((t) => t.id === teamId);
    return team?.name || "Unknown Team";
  };

  if (list.isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Projects</h1>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage your team projects and collaboration
            </p>
          </div>
          <ProjectsInfoDialog />
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Projects List */}
      <div className="grid gap-4">
        {list.data?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first project
              </p>
              <Button asChild>
                <Link href="/projects/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          list.data?.map((project: Project) => (
            <Card
              key={project.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold truncate">
                        {project.name}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <Users className="h-3 w-3" />
                        {getTeamName(project.teamId)}
                      </Badge>
                    </div>
                    {project.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {project.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/projects/${project.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline ml-2">View</span>
                      </Link>
                    </Button>

                    <ProjectMembersDialog teamId={project.teamId} />

                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/projects/${project.id}/edit`}>
                        <Edit className="h-4 w-4" />
                        <span className="hidden sm:inline ml-2">Edit</span>
                      </Link>
                    </Button>

                    <ProjectDeletionDialog
                      projectId={project.id}
                      projectName={project.name}
                      onConfirmDelete={() => handleDelete(project.id)}
                      isDeleting={deletingProject === project.id}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
