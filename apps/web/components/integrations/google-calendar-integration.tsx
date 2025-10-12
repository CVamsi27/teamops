"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Switch } from "@workspace/ui/components/switch";
import { Label } from "@workspace/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip";
import { useApiQuery } from "@/hooks/api/useApiQuery";
import { useApiMutation } from "@/hooks/api/useApiMutation";
import { api } from "@/lib/api";
import { Calendar, Clock, ExternalLink, Settings, CheckCircle, RefreshCw, Zap, Info } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { toast } from "@workspace/ui/components/toast";

const CalendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  description: z.string().optional(),
  startTime: z.string(),
  start: z.object({
    dateTime: z.string(),
  }),
  end: z.object({
    dateTime: z.string(),
  }),
  eventUrl: z.string(),
  source: z.enum(['task', 'project', 'manual']).optional(),
  sourceId: z.string().optional(),
});

const CalendarIntegrationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  provider: z.literal('google'),
  accessToken: z.string(),
  refreshToken: z.string(),
  calendarId: z.string(),
  isActive: z.boolean(),
  syncTasks: z.boolean(),
  syncProjects: z.boolean(),
  reminderMinutes: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const SyncStatusSchema = z.object({
  message: z.string(),
  tasksCount: z.number().optional(),
  projectsCount: z.number().optional(),
});

const ConnectionStatusSchema = z.object({
  connected: z.boolean(),
  hasValidToken: z.boolean().optional(),
  accessToken: z.string().optional(),
  email: z.string().optional(),
  error: z.string().optional(),
  lastSync: z.string().optional(),
});

type CalendarIntegration = z.infer<typeof CalendarIntegrationSchema>;
type CalendarEvent = z.infer<typeof CalendarEventSchema>;
type SyncStatus = z.infer<typeof SyncStatusSchema>;
type SyncResponse = {
  success: boolean;
  eventId?: string;
  message: string;
};
type ConnectionStatus = z.infer<typeof ConnectionStatusSchema>;

const CalendarSettingsSchema = z.object({
  syncTasks: z.boolean(),
  syncProjects: z.boolean(),
  reminderMinutes: z.number(),
  calendarId: z.string(),
});

type CalendarSettings = z.infer<typeof CalendarSettingsSchema>;

export function GoogleCalendarIntegration() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResponse[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  
  // Check connection status using the new endpoint
  const { data: connectionStatus, isLoading: isCheckingStatus, refetch: refetchStatus } = useApiQuery<ConnectionStatus>(
    ['google-calendar-status'],
    '/integrations/google-calendar/status',
    ConnectionStatusSchema
  );

  const { data: integration, isLoading, refetch } = useApiQuery<CalendarIntegration | null>(
    ['calendar-integration'],
    '/integrations/google-calendar',
    CalendarIntegrationSchema.nullable(),
    {
      enabled: connectionStatus?.connected === true,
    }
  );

  useEffect(() => {
    refetchStatus();
    if (connectionStatus?.connected) {
      refetch();
    }
  }, [refetchStatus, refetch, connectionStatus?.connected]);

  const { data: upcomingEvents } = useApiQuery<CalendarEvent[]>(
    ['calendar-events'],
    '/integrations/google-calendar/events',
    z.array(CalendarEventSchema),
    {
      enabled: connectionStatus?.connected === true && !!integration?.isActive,
    }
  );

  // Check sync status
  const { data: syncStatus } = useApiQuery<SyncStatus>(
    ['sync-status'],
    '/integrations/google-calendar/sync-tasks-projects',
    SyncStatusSchema,
    {
      enabled: connectionStatus?.connected === true && !!integration?.isActive,
    }
  );

  const updateSettings = useApiMutation<CalendarIntegration, CalendarSettings>(
    '/integrations/google-calendar/settings',
    ['calendar-integration'],
    CalendarSettingsSchema,
    {
      method: 'patch',
    }
  );

  const disconnect = useApiMutation<void, Record<string, never>>(
    '/integrations/google-calendar/disconnect',
    ['calendar-integration', 'google-calendar-status'],
    z.object({}),
    {
      method: 'post',
      invalidateKeys: [['calendar-integration'], ['calendar-events'], ['google-calendar-status']],
    }
  );

  const refreshConnection = useApiMutation<void, Record<string, never>>(
    '/integrations/google-calendar/refresh',
    ['google-calendar-status'],
    z.object({}),
    {
      method: 'post',
      invalidateKeys: [['google-calendar-status'], ['calendar-integration'], ['calendar-events']],
    }
  );

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await api.get('/integrations/google-calendar/auth');
      const data = response.data;
      
      window.location.href = data.authUrl;
    } catch {
      toast.error("Failed to connect to Google Calendar", {
        description: "Please try again or check your internet connection.",
        duration: 5000,
      });
      setIsConnecting(false);
    }
  };

  const handleRefreshConnection = async () => {
    setIsConnecting(true);
    try {
      await refreshConnection.mutateAsync({});
      await refetchStatus();
      await refetch();
      setLastSyncTime(new Date().toISOString());
      
      toast.success("Google Calendar connection refreshed successfully!", {
        description: "Your calendar integration is now up to date.",
        duration: 4000,
      });
    } catch (error) {
      console.error('Failed to refresh connection:', error);
      toast.error("Failed to refresh connection", {
        description: "Please try again or reconnect your Google Calendar.",
        duration: 5000,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleFullSync = async () => {
    if (!integration) return;
    
    setSyncResults([]);
    setLastSyncTime(new Date().toISOString());
    
    try {
      const statusResponse = await api.get('/integrations/google-calendar/sync-tasks-projects');
      
      if (statusResponse.data.tasksCount > 0 || statusResponse.data.projectsCount > 0) {
        const results: SyncResponse[] = [];
        
        if (statusResponse.data.tasksCount > 0) {
          try {
            const taskSyncResponse = await api.post('/integrations/google-calendar/sync-task');
            results.push(taskSyncResponse.data);
          } catch {
            toast.error("Task sync failed", {
              description: "Some tasks couldn&apos;t be synced to calendar.",
              duration: 4000,
            });
          }
        }
        
        if (statusResponse.data.projectsCount > 0) {
          try {
            const projectSyncResponse = await api.post('/integrations/google-calendar/sync-project');
            results.push(projectSyncResponse.data);
          } catch {
            toast.error("Project sync failed", {
              description: "Some projects couldn&apos;t be synced to calendar.",
              duration: 4000,
            });
          }
        }
        
        setSyncResults(results);
        refetch();
      }
    } catch {
      toast.error("Sync failed", {
        description: "Unable to sync with Google Calendar.",
        duration: 5000,
      });
    }
  };

  const handleSettingsUpdate = (field: keyof CalendarSettings, value: boolean | number | string) => {
    if (!integration) return;
    
    const newSettings: CalendarSettings = {
      syncTasks: integration.syncTasks,
      syncProjects: integration.syncProjects,
      reminderMinutes: integration.reminderMinutes,
      calendarId: integration.calendarId,
      [field]: value,
    };
    
    updateSettings.mutate(newSettings);
  };

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect Google Calendar? This will remove all synced events.')) {
      disconnect.mutate({});
    }
  };

  if (isLoading || isCheckingStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Integration
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-medium">How Google Calendar works:</p>
                  <ul className="text-xs space-y-0.5">
                    <li>• Tasks with due dates sync automatically</li>
                    <li>• Project deadlines create calendar events</li>
                    <li>• Real-time updates when dates change</li>
                    <li>• Custom reminder notifications</li>
                    <li>• Bidirectional sync with your calendar</li>
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
            {connectionStatus?.connected && (
              <Badge variant="default" className="ml-auto">
                Connected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!connectionStatus?.connected ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Connect Google Calendar</h3>
              <p className="text-muted-foreground mb-6">
                Sync your tasks and project deadlines with Google Calendar to never miss a deadline.
              </p>
              <Button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                {isConnecting ? 'Connecting...' : 'Connect Google Calendar'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Connection Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <div>
                    <p className="font-medium">Google Calendar Connected</p>
                    <p className="text-sm text-muted-foreground">
                      Last synced: {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : (integration?.updatedAt ? new Date(integration.updatedAt).toLocaleString() : 'Never')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshConnection}
                    disabled={isConnecting}
                    className="gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isConnecting ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFullSync}
                    disabled={!syncStatus || ((syncStatus.tasksCount || 0) === 0 && (syncStatus.projectsCount || 0) === 0)}
                    className="gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Sync All
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/integrations/google-calendar">
                      <ExternalLink className="h-4 w-4" />
                      Manage Sync
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnect}
                    disabled={disconnect.isPending}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>

              {/* Sync Status */}
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

              {/* Sync Results */}
              {syncResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Recent Sync Results</h4>
                  {syncResults.map((result, index) => (
                    <Alert key={index} className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                      <CheckCircle className={`h-4 w-4 ${result.success ? 'text-green-600' : 'text-red-600'}`} />
                      <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                        {result.message}
                        {result.eventId && (
                          <span className="block text-xs opacity-75">Event ID: {result.eventId}</span>
                        )}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {/* Sync Settings */}
              {integration && (
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Sync Settings
                  </h4>
                  
                  <div className="space-y-4 border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sync-tasks" className="flex items-center gap-2">
                        Sync Tasks
                        <span className="text-sm text-muted-foreground">
                          Create calendar events for task due dates
                        </span>
                      </Label>
                      <Switch
                        id="sync-tasks"
                        checked={integration?.syncTasks || false}
                        onCheckedChange={(checked: boolean) => handleSettingsUpdate('syncTasks', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="sync-projects" className="flex items-center gap-2">
                        Sync Projects
                        <span className="text-sm text-muted-foreground">
                          Create calendar events for project deadlines
                        </span>
                      </Label>
                      <Switch
                        id="sync-projects"
                        checked={integration?.syncProjects || false}
                        onCheckedChange={(checked: boolean) => handleSettingsUpdate('syncProjects', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Reminder</Label>
                      <Select
                        value={integration?.reminderMinutes?.toString() || "15"}
                        onValueChange={(value: string) => handleSettingsUpdate('reminderMinutes', parseInt(value))}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No reminder</SelectItem>
                          <SelectItem value="15">15 minutes before</SelectItem>
                          <SelectItem value="30">30 minutes before</SelectItem>
                          <SelectItem value="60">1 hour before</SelectItem>
                          <SelectItem value="120">2 hours before</SelectItem>
                          <SelectItem value="1440">1 day before</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Calendar Events */}
      {connectionStatus?.connected && upcomingEvents && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Events
              <Badge variant="secondary" className="ml-auto">
                {upcomingEvents.length} events
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No upcoming events from synced tasks and projects
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.startTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {event.source}
                      </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={event.eventUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}