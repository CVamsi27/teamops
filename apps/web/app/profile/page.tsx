"use client";

import { useMe } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProfileSettings } from "@/components/profile/profile-settings";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { data: user, isLoading: userLoading, error } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (
      !userLoading &&
      (!user ||
        (error &&
          "response" in error &&
          (error as { response: { status: number } }).response?.status === 401))
    ) {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <ProfileSettings />
    </div>
  );
}
