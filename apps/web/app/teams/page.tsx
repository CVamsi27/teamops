"use client";
import { useTeams } from "@/hooks/teams/useTeams";
import { type Team } from "@workspace/api";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Plus, Edit, Trash2, Users, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { TeamMemberInvite } from "@/components/teams/team-member-invite";

export default function TeamsPage() {
  const { list, remove } = useTeams();
  const [deletingTeam, setDeletingTeam] = useState<string | null>(null);

  const handleDelete = (teamId: string) => {
    setDeletingTeam(teamId);
    remove.mutate({ id: teamId }, {
      onSuccess: () => {
        setDeletingTeam(null);
      },
      onError: () => {
        setDeletingTeam(null);
      }
    });
  };

  if (list.isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Teams</h1>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground mt-1">
            Manage your teams and collaborate with members
          </p>
        </div>
        <Button asChild>
          <Link href="/teams/new">
            <Plus className="h-4 w-4 mr-2" />
            New Team
          </Link>
        </Button>
      </div>

      {/* Teams List */}
      <div className="grid gap-4">
        {list.data?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first team to start collaborating
              </p>
              <Button asChild>
                <Link href="/teams/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Team
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          list.data?.map((team: Team) => (
            <Card key={team.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold truncate">
                        {team.name}
                      </h3>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Team
                      </Badge>
                    </div>
                    {team.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {team.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/teams/${team.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline ml-2">View</span>
                      </Link>
                    </Button>
                    
                    <TeamMemberInvite 
                      teamId={team.id} 
                      teamName={team.name} 
                    />
                    
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/teams/${team.id}/edit`}>
                        <Edit className="h-4 w-4" />
                        <span className="hidden sm:inline ml-2">Edit</span>
                      </Link>
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          disabled={deletingTeam === team.id}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline ml-2">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Team</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;{team.name}&quot;? This action cannot be undone and will remove all associated projects and tasks.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(team.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
