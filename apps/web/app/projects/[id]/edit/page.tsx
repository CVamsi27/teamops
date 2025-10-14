"use client";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useProjects } from "@/hooks/useProjects";
import { useTeams } from "@/hooks/teams/useTeams";
import { type UpdateProject } from "@workspace/api";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@workspace/ui/components/card";
import { Label } from "@workspace/ui/components/label";
import { toast } from "@workspace/ui/components/toast";
import { ArrowLeft, Edit, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { get, update } = useProjects();
  const teamsQuery = useTeams();
  const projectQuery = get(projectId);

  const form = useForm<UpdateProject>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (projectQuery.data) {
      form.reset({
        name: projectQuery.data.name,
        description: projectQuery.data.description || "",
      });
    }
  }, [projectQuery.data, form]);

  const onSubmit = (data: UpdateProject) => {
    update.mutate(
      { id: projectId, payload: data },
      {
        onSuccess: () => {
          router.push("/projects");
        },
        onError: () => {
          toast.error("Failed to update project", {
            description: "Please try again with valid information.",
            duration: 5000,
          });
        },
      },
    );
  };

  if (projectQuery.isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
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
      <div className="max-w-2xl mx-auto space-y-6">
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
              Project not found or you don&apos;t have permission to edit it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Project</h1>
          <p className="text-muted-foreground">
            Update the details for &quot;{projectQuery.data.name}&quot;
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Project Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                {...form.register("name", {
                  required: "Project name is required",
                })}
                placeholder="Enter project name"
                className="text-base"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Describe what this project is about..."
                rows={4}
                className="text-base resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Provide a brief description of the project goals and
                scope
              </p>
            </div>

            <div className="space-y-2">
              <Label>Current Team</Label>
              <div className="p-3 border rounded-md bg-muted/50">
                <p className="text-sm">
                  {teamsQuery.list.data?.find(
                    (team) => team.id === projectQuery.data?.teamId,
                  )?.name || "Unknown Team"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Team assignment cannot be changed after project creation
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/projects">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={update.isPending || !form.watch("name")}
              >
                {update.isPending ? "Updating..." : "Update Project"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
