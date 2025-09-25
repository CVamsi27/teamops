"use client";
import { useProjects } from "@/hooks/useProjects";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateProjectSchema, type Project } from "@workspace/api";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@workspace/ui/components/card";

export default function ProjectsPage() {
  const { list, create, remove } = useProjects();
  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(CreateProjectSchema),
  });

  return (
    <div className="grid md:grid-cols-2 grid-gap">
      <Card>
        <CardHeader>
          <CardTitle>Create Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((v) =>
              create.mutate(v, {
                onSuccess: () => {
                  reset();
                },
              }),
            )}
            className="flex flex-col form-spacing"
          >
            <Input {...register("name")} placeholder="Project name" />
            <Input {...register("description")} placeholder="Description" />
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Creating..." : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {list.isLoading && <div>Loading...</div>}
          {list.data?.map((p: Project) => (
            <div
              key={p.id}
              className="padding-card rounded border flex justify-between items-center"
            >
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-muted-foreground">
                  {p.description}
                </div>
              </div>
              <div>
                <Button
                  variant="destructive"
                  onClick={() => remove.mutate({ id: p.id })}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
