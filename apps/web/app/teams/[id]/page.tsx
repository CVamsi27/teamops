"use client";

import { useParams } from "next/navigation";
import { useTeams } from "@/hooks/teams/useTeams";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { LiveChat } from "@/components/chat/live-chat";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.id as string;

  const { get } = useTeams();
  const teamQuery = get(teamId);

  if (teamQuery.isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/teams">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Teams
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[500px]" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="py-12">
              <Skeleton className="h-[400px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-12">
              <Skeleton className="h-[400px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (teamQuery.error || !teamQuery.data) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
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
              Team not found or you don&apos;t have permission to view it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const team = teamQuery.data;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/teams">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Teams
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8" />
            {team.name}
          </h1>
          {team.description && (
            <p className="text-muted-foreground mt-2">{team.description}</p>
          )}
        </div>
      </div>

      {/* Team Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-muted-foreground">
                {team.description || "No description provided"}
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Team ID</h3>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {team.id}
              </code>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary">Active Team</Badge>
              <Badge variant="outline">
                Created:{" "}
                {new Date(team.createdAt || Date.now()).toLocaleDateString()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat and Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Live Chat */}
        <div>
          <LiveChat roomId={teamId} roomType="team" roomName={team.name} />
        </div>

        {/* Activity Timeline */}
        <div>
          <ActivityTimeline entityId={teamId} entityType="team" limit={20} />
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href={`/teams/${teamId}/edit`}>Edit Team</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/projects/new">Create Project</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tasks/new">Create Task</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
