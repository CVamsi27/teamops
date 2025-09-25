"use client";
import CreateTeams from "@/components/teams/create-team";
import RenderTeams from "@/components/teams/render-team";

export default function TeamsPage() {
  return (
    <div className="grid md:grid-cols-2 grid-gap">
      <CreateTeams />
      <RenderTeams />
    </div>
  );
}
