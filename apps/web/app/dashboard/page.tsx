"use client";
import { useTasks } from "@/hooks/tasks/useTasks";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

export default function DashboardPage() {
  const { data } = useTasks();
  const tasks = data ?? [];

  const upcoming = tasks
    .filter((t) => t.dueDate)
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
    .slice(0, 5);

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tasks</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <ul className="space-y-2">
            {upcoming.map((t) => (
              <li key={t.id} className="flex justify-between">
                <span>{t.title}</span>
                <span className="text-muted-foreground">
                  {t.dueDate?.slice(0, 10)}
                </span>
              </li>
            ))}
            {upcoming.length === 0 && (
              <div className="text-muted-foreground">No upcoming tasks</div>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Real-time activity stream planned (WebSockets + Kafka).
        </CardContent>
      </Card>
    </div>
  );
}
