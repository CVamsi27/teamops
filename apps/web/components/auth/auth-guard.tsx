"use client";
import { useMe } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { PUBLIC_ROUTES } from "@/lib/const";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = (PUBLIC_ROUTES as readonly string[]).includes(pathname);

  const me = useMe({ enabled: !isPublicRoute });

  useEffect(() => {
    if (!isPublicRoute && !me.isLoading && !me.data) {
      router.push("/auth");
    }
  }, [me.isLoading, me.data, router, isPublicRoute]);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (me.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!me.data) {
    return null;
  }

  return <>{children}</>;
}
