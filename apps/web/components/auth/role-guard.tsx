"use client";

import { useMe } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: ("ADMIN" | "MEMBER" | "VIEWER")[];
  redirectTo?: string;
  fallback?: ReactNode;
}

export function RoleGuard({
  children,
  allowedRoles = ["ADMIN", "MEMBER", "VIEWER"],
  redirectTo = "/dashboard",
  fallback,
}: RoleGuardProps) {
  const { data: user, isLoading, error } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (
      !isLoading &&
      (!user ||
        (error &&
          "response" in error &&
          (error as { response: { status: number } }).response?.status === 401))
    ) {
      router.push("/auth/login");
      return;
    }

    if (
      user &&
      !allowedRoles.includes(user.role as "ADMIN" | "MEMBER" | "VIEWER")
    ) {
      router.push(redirectTo);
    }
  }, [user, isLoading, error, router, allowedRoles, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!allowedRoles.includes(user.role as "ADMIN" | "MEMBER" | "VIEWER")) {
    return (
      fallback || (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don&apos;t have permission to access this page.
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
}
