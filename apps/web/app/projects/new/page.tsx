"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useProjects } from "@/hooks/useProjects";
import { useTeams } from "@/hooks/teams/useTeams";
import { type CreateProject } from "@workspace/api";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Label } from "@workspace/ui/components/label";
import { toast } from "@workspace/ui/components/toast";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  const { create } = useProjects();
  const teamsQuery = useTeams();
  
  const form = useForm<CreateProject>({
    defaultValues: {
      name: "",
      description: "",
      teamId: "",
    },
  });

  const onSubmit = (data: CreateProject) => {
    create.mutate(data, {
      onSuccess: () => {
        router.push("/projects");
      },
      onError: () => {
        toast.error("Failed to create project", {
          description: "Please try again with valid information.",
          duration: 5000,
        });
      },
    });
  };

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
          <h1 className="text-3xl font-bold">Create New Project</h1>
          <p className="text-muted-foreground">
            Set up a new project for your team to collaborate on
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Project Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                {...form.register("name", { required: "Project name is required" })}
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
                Optional: Provide a brief description of the project goals and scope
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team">Team *</Label>
              <Select
                onValueChange={(value) => form.setValue("teamId", value)}
                value={form.watch("teamId")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a team for this project" />
                </SelectTrigger>
                <SelectContent>
                  {teamsQuery.list.data?.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.teamId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.teamId.message}
                </p>
              )}
              {!teamsQuery.list.data?.length && (
                <p className="text-sm text-muted-foreground">
                  You need to be part of a team to create a project.{" "}
                  <Link href="/teams" className="underline hover:text-foreground">
                    Create or join a team first
                  </Link>
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/projects">Cancel</Link>
              </Button>
              <Button 
                type="submit" 
                disabled={create.isPending || !form.watch("teamId") || !form.watch("name")}
              >
                {create.isPending ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}