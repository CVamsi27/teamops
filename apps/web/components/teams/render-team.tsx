"use client";
import { useTeam } from "@/hooks/teams/useTeams";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Eye } from "lucide-react";
import Link from "next/link";

function TeamCardContent() {
  const { list } = useTeam();
  const { data, isLoading, isError } = list;

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
        <div key={t.id} className="padding-card rounded border flex justify-between items-center">
          <div className="flex-1">
            <div className="font-medium">{t.name}</div>
            <div className="text-sm text-muted-foreground">{t.description}</div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/teams/${t.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Link>
          </Button>
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
