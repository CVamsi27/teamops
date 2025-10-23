"use client";

import { useWorkloadDistribution, type WorkloadDistribution } from "@/hooks/useWorkloadDistribution";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { AlertCircle, Users } from "lucide-react";

interface WorkloadDistributionViewProps {
  projectId: string;
  className?: string;
}

export function WorkloadDistributionView({
  projectId,
  className,
}: WorkloadDistributionViewProps) {
  const { data: workload, isLoading, error } = useWorkloadDistribution(projectId);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Workload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Team Workload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load workload data</p>
        </CardContent>
      </Card>
    );
  }

  if (!workload || workload.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Workload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No team members found</p>
        </CardContent>
      </Card>
    );
  }

  // Sort by total tasks descending
  const sortedWorkload = [...workload].sort((a, b) => b.totalTasks - a.totalTasks);

  const getWorkloadColor = (totalTasks: number, maxTasks: number) => {
    const percentage = (totalTasks / maxTasks) * 100;
    if (percentage === 0) return "bg-gray-200";
    if (percentage < 33) return "bg-green-500";
    if (percentage < 66) return "bg-yellow-500";
    return "bg-red-500";
  };

  const maxTasks = Math.max(...sortedWorkload.map((m) => m.totalTasks), 1);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Workload Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedWorkload.map((member) => (
            <div key={member.userId} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{member.name || member.email}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{member.totalTasks} tasks</Badge>
                </div>
              </div>

              {/* Workload bar */}
              <div className="flex gap-1 h-8 rounded-md overflow-hidden bg-muted">
                {member.todoCount > 0 && (
                  <div
                    className="bg-slate-400 flex items-center justify-center"
                    style={{
                      width: `${(member.todoCount / Math.max(member.totalTasks, 1)) * 100}%`,
                    }}
                    title={`${member.todoCount} TODO`}
                  >
                    {member.totalTasks > 0 && member.todoCount > 0 && (
                      <span className="text-xs font-bold text-white">
                        {member.todoCount}
                      </span>
                    )}
                  </div>
                )}
                {member.inProgressCount > 0 && (
                  <div
                    className="bg-blue-500 flex items-center justify-center"
                    style={{
                      width: `${(member.inProgressCount / Math.max(member.totalTasks, 1)) * 100}%`,
                    }}
                    title={`${member.inProgressCount} IN_PROGRESS`}
                  >
                    {member.totalTasks > 0 && member.inProgressCount > 0 && (
                      <span className="text-xs font-bold text-white">
                        {member.inProgressCount}
                      </span>
                    )}
                  </div>
                )}
                {member.doneCount > 0 && (
                  <div
                    className="bg-green-500 flex items-center justify-center"
                    style={{
                      width: `${(member.doneCount / Math.max(member.totalTasks, 1)) * 100}%`,
                    }}
                    title={`${member.doneCount} DONE`}
                  >
                    {member.totalTasks > 0 && member.doneCount > 0 && (
                      <span className="text-xs font-bold text-white">
                        {member.doneCount}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Status breakdown */}
              <div className="flex gap-2 text-xs">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-slate-400" />
                  {member.todoCount} TODO
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  {member.inProgressCount} In Progress
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  {member.doneCount} Done
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="text-sm text-muted-foreground">
            <p>Total tasks: {sortedWorkload.reduce((acc, m) => acc + m.totalTasks, 0)}</p>
            <p>Team members: {sortedWorkload.length}</p>
            <p>
              Avg tasks per member:{" "}
              {(
                sortedWorkload.reduce((acc, m) => acc + m.totalTasks, 0) /
                sortedWorkload.length
              ).toFixed(1)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
