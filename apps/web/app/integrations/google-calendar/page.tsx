"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { useApiQuery } from "@/hooks/api/useApiQuery";
import { useGoogleCalendarSync } from "@/hooks/integrations/useGoogleCalendarSync";
import { CalendarIntegrationSchema } from "@workspace/api";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  RefreshCw, 
  Zap, 
  ArrowLeft,
  ExternalLink,
  Settings
} from "lucide-react";
import Link from "next/link";
import { z } from "zod";

// Simple schemas for this page's specific use cases
const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.string(),
  projectId: z.string().optional(),
});

const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  deadline: z.string().optional(),
  status: z.string(),
});

type CalendarIntegration = z.infer<typeof CalendarIntegrationSchema>;
type Task = z.infer<typeof TaskSchema>;
type Project = z.infer<typeof ProjectSchema>;

export default function GoogleCalendarSyncPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [syncStatus, setSyncStatus] = useState<{
    message?: string;
    tasksCount?: number;
    projectsCount?: number;
    isConnected?: boolean;
    lastSync?: string;
    error?: string;
  } | null>(null);
  
  const {
    isLoading: isSyncing,
    syncResults,
    lastSyncTime,
    getSyncStatus,
    syncTask,
    syncProject,
    syncAll,
    clearResults,
  } = useGoogleCalendarSync();

  const { data: integration, isLoading } = useApiQuery<CalendarIntegration | null>(
    ['calendar-integration'],
    '/integrations/google-calendar',
    CalendarIntegrationSchema.nullable()
  );

  const { data: tasks } = useApiQuery<Task[]>(
    ['tasks'],
    '/tasks',
    z.array(TaskSchema),
    {
      enabled: !!integration?.connected,
    }
  );

  const { data: projects } = useApiQuery<Project[]>(
    ['projects'],
    '/projects',
    z.array(ProjectSchema),
    {
      enabled: !!integration?.connected,
    }
  );

  const loadSyncStatus = useCallback(async () => {
    const status = await getSyncStatus();
    setSyncStatus(status);
  }, [getSyncStatus]);

  useEffect(() => {
    if (integration?.connected) {
      loadSyncStatus();
    }
  }, [integration, loadSyncStatus]);

  const handleSyncAll = async () => {
    clearResults();
    await syncAll();
    await loadSyncStatus();
  };

  const handleSyncTask = async (taskId?: string) => {
    await syncTask(taskId);
    await loadSyncStatus();
  };

  const handleSyncProject = async (projectId?: string) => {
    await syncProject(projectId);
    await loadSyncStatus();
  };

  const handleRefresh = async () => {
    await loadSyncStatus();
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!integration) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/integrations">
              <ArrowLeft className="h-4 w-4" />
              Back to Integrations
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Google Calendar Not Connected</h2>
              <p className="text-muted-foreground mb-6">
                Connect your Google Calendar to start syncing tasks and projects.
              </p>
              <Button asChild>
                <Link href="/integrations">
                  Connect Google Calendar
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tasksWithDueDate = tasks?.filter(task => task.dueDate) || [];
  const projectsWithDeadline = projects?.filter(project => project.deadline) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/integrations">
              <ArrowLeft className="h-4 w-4" />
              Back to Integrations
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Google Calendar Sync</h1>
            <p className="text-muted-foreground">
              Manage your task and project synchronization with Google Calendar
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="gap-1">
            <div className="h-2 w-2 bg-white rounded-full" />
            Connected
          </Badge>
        </div>
      </div>

      {/* Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Sync Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {syncStatus && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {syncStatus.message}
                {((syncStatus.tasksCount && syncStatus.tasksCount > 0) || (syncStatus.projectsCount && syncStatus.projectsCount > 0)) && (
                  <span className="ml-2">
                    Ready to sync {syncStatus.tasksCount || 0} tasks and {syncStatus.projectsCount || 0} projects.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-4">
            <Button
              onClick={handleSyncAll}
              disabled={isSyncing || !syncStatus || ((syncStatus.tasksCount || 0) === 0 && (syncStatus.projectsCount || 0) === 0)}
              className="gap-2"
            >
              <Zap className={`h-4 w-4 ${isSyncing ? 'animate-pulse' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync All'}
            </Button>

            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isSyncing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>

            <Button variant="outline" size="sm" asChild>
              <Link href="/integrations">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>

          {lastSyncTime && (
            <p className="text-sm text-muted-foreground">
              Last synced: {new Date(lastSyncTime).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Sync Results */}
      {syncResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Recent Sync Results
              <Badge variant="secondary" className="ml-auto">
                {syncResults.length} results
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {syncResults.map((result, index) => (
                <Alert 
                  key={index} 
                  className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
                >
                  <CheckCircle className={`h-4 w-4 ${result.success ? 'text-green-600' : 'text-red-600'}`} />
                  <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                    <div className="flex items-center justify-between">
                      <div>
                        {result.message}
                        {result.eventId && (
                          <div className="text-xs opacity-75 mt-1">
                            Event ID: {result.eventId}
                          </div>
                        )}
                      </div>
                      {result.success && result.eventId && (
                        <Button variant="ghost" size="sm" asChild>
                          <a 
                            href={`https://calendar.google.com/calendar/event?eid=${result.eventId}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed View */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasksWithDueDate.length})</TabsTrigger>
          <TabsTrigger value="projects">Projects ({projectsWithDeadline.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Tasks with Due Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold">{tasksWithDueDate.length}</div>
                  <p className="text-muted-foreground">Ready to sync</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Projects with Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold">{projectsWithDeadline.length}</div>
                  <p className="text-muted-foreground">Ready to sync</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tasks with Due Dates</CardTitle>
            </CardHeader>
            <CardContent>
              {tasksWithDueDate.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tasks with due dates found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasksWithDueDate.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Due: {task.dueDate ? new Date(task.dueDate).toLocaleString() : 'No due date'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{task.status}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSyncTask(task.id)}
                          disabled={isSyncing}
                        >
                          Sync
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Projects with Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              {projectsWithDeadline.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No projects with deadlines found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projectsWithDeadline.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Deadline: {project.deadline ? new Date(project.deadline).toLocaleString() : 'No deadline'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{project.status}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSyncProject(project.id)}
                          disabled={isSyncing}
                        >
                          Sync
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}