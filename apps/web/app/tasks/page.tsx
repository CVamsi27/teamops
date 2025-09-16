"use client";
import ReanderTask from "@/components/tasks/render-task";
import CreateTeams from "@/components/teams/create-team";

export default function TasksPage() {

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <CreateTeams />
      <ReanderTask />
    </div>
  );
}
