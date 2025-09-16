"use client";
import { useCreateTeam } from "@/hooks/teams/useCreateTeam";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTeamSchema, type CreateTeam } from "@workspace/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { toast } from "@workspace/ui/components/toast";

export default function CreateTeams() {
  const create = useCreateTeam();
  const { register, handleSubmit, formState, reset } = useForm<CreateTeam>({
    resolver: zodResolver(CreateTeamSchema),
  });

  const onCreateTeam = (payload: CreateTeam) => {
    create.mutate(payload, {
      onSuccess: () => {
        reset();
        toast.success("Team created successfully!");
      },
      onError: (err: any) => {
        toast.error(err?.message ?? "Failed to create team.");
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Team</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onCreateTeam)} className="space-y-3">
          <Input placeholder="Team name" {...register("name")} />
          {formState.errors.name && (
            <p className="text-red-600 text-sm">
              {formState.errors.name.message}
            </p>
          )}

          <Input
            placeholder="Description (optional)"
            {...register("description")}
          />

          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Creating..." : "Create"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}