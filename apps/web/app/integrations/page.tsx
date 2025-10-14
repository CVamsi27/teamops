"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { toast } from "@workspace/ui/components/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { GoogleCalendarIntegration } from "@/components/integrations/google-calendar-integration";
import { Settings, MessageSquare, Zap, Info } from "lucide-react";

export default function IntegrationsPage() {
  const searchParams = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const message = searchParams.get("message");
    const expiryDate = searchParams.get("expiryDate");

    if (success === "true") {
      const toastMessage = message || "Google Calendar connected successfully!";
      const expiryText = expiryDate
        ? `Access token expires: ${new Date(parseInt(expiryDate)).toLocaleString()}`
        : "";

      toast.success(toastMessage, {
        description: expiryText,
        duration: 5000,
      });

      setRefreshKey((prev) => prev + 1);

      window.history.replaceState({}, "", "/integrations");
    } else if (error) {
      const errorMessage = message || "Failed to connect Google Calendar";
      toast.error(errorMessage, {
        duration: 5000,
      });

      window.history.replaceState({}, "", "/integrations");
    }
  }, [searchParams]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect TeamOps with your favorite tools to streamline your workflow
        </p>
      </div>

      {/* Available Integrations */}
      <div className="grid gap-6">
        {/* Google Calendar */}
        <GoogleCalendarIntegration key={refreshKey} />

        {/* Slack Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Slack Integration
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-medium">How Slack integration works:</p>
                    <ul className="text-xs space-y-0.5">
                      <li>• Real-time task notifications in channels</li>
                      <li>• Daily digest of team progress</li>
                      <li>• Quick task creation from Slack</li>
                      <li>• Team mentions for urgent updates</li>
                      <li>• Project status summaries</li>
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
              <span className="text-sm font-normal text-muted-foreground ml-auto">
                Coming Soon
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Connect with Slack</h3>
              <p className="text-muted-foreground mb-6">
                Get notifications and updates directly in your Slack channels.
              </p>
              <Button disabled>Coming Soon</Button>
            </div>
          </CardContent>
        </Card>

        {/* Zapier Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Zapier Integration
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-medium">How Zapier automation works:</p>
                    <ul className="text-xs space-y-0.5">
                      <li>• Connect to 6,000+ apps automatically</li>
                      <li>• Create tasks from emails, forms, CRM</li>
                      <li>• Auto-assign based on custom rules</li>
                      <li>• Send data to spreadsheets/databases</li>
                      <li>• Trigger actions on status changes</li>
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
              <span className="text-sm font-normal text-muted-foreground ml-auto">
                Coming Soon
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Automate with Zapier
              </h3>
              <p className="text-muted-foreground mb-6">
                Connect TeamOps with 6,000+ apps to automate your workflows.
              </p>
              <Button disabled>Coming Soon</Button>
            </div>
          </CardContent>
        </Card>

        {/* Integration Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Integration Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Webhook Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive real-time updates via webhooks
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">API Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage API keys and access tokens
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Data Export</h3>
                  <p className="text-sm text-muted-foreground">
                    Export your data for use in other tools
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
