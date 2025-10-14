"use client";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useTeams } from "@/hooks/teams/useTeams";
import { type UpdateTeam } from "@workspace/api";
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

export default function EditTeamPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;

  const { get, update } = useTeams();
  const teamQuery = get(teamId);

  const form = useForm<UpdateTeam>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (teamQuery.data) {
      form.reset({
        name: teamQuery.data.name,
        description: teamQuery.data.description || "",
      });
    }
  }, [teamQuery.data, form]);

  const onSubmit = (data: UpdateTeam) => {
    update.mutate(
      { id: teamId, payload: data },
      {
        onSuccess: () => {
          router.push("/teams");
        },
        onError: () => {
          toast.error("Failed to update team", {
            description: "Please try again with valid information.",
            duration: 5000,
          });
        },
      },
    );
  };

  if (teamQuery.isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/teams">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Teams
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading team...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (teamQuery.error || !teamQuery.data) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/teams">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Teams
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Team not found or you don&apos;t have permission to edit it.
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
          <Link href="/teams">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Teams
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Team</h1>
          <p className="text-muted-foreground">
            Update the details for &quot;{teamQuery.data.name}&quot;
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Team Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                {...form.register("name", {
                  required: "Team name is required",
                })}
                placeholder="Enter team name"
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
                placeholder="Describe your team's purpose and goals..."
                rows={4}
                className="text-base resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Provide a brief description of your team&apos;s
                mission and objectives
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/teams">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={update.isPending || !form.watch("name")}
              >
                {update.isPending ? "Updating..." : "Update Team"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
