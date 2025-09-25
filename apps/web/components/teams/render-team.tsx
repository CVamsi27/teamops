"use client";
import { useTeam } from "@/hooks/teams/useTeams";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

function TeamCardContent() {
  const { data, isLoading, isError } = useTeam();

  if (isLoading) {
    return (
      <CardContent className="flex flex-col card-spacing">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="padding-card rounded border flex flex-col card-spacing"
          >
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </CardContent>
    );
  }

  if (isError) {
    return (
      <CardContent>
        <div>Error loading teams.</div>
      </CardContent>
    );
  }

  if (!data || data.length === 0) {
    return (
      <CardContent>
        <div>No teams found. Create one!</div>
      </CardContent>
    );
  }

  return (
    <CardContent className="flex flex-col card-spacing">
      {data.map((t) => (
        <div key={t.id} className="padding-card rounded border">
          <div className="font-medium">{t.name}</div>
          <div className="text-sm text-muted-foreground">{t.description}</div>
        </div>
      ))}
    </CardContent>
  );
}

export default function RenderTeams() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Teams</CardTitle>
      </CardHeader>
      <TeamCardContent />
    </Card>
  );
}
