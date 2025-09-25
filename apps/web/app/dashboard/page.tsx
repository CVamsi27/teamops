"use client";
import { useTasks } from "@/hooks/tasks/useTasks";
import { useMe } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { data: user, isLoading: userLoading, error } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && (!user || (error as any)?.response?.status === 401)) {
      router.push("/auth/login");
    }
  }, [user, userLoading, error, router]);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }
  const { data } = useTasks();
  const tasks = data ?? [];

  const upcoming = tasks
    .filter((t) => t.dueDate)
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
    .slice(0, 5);

  return (
    <div className="grid md:grid-cols-3 grid-gap">
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tasks</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <ul className="flex flex-col card-spacing">
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
