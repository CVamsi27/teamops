"use client";
import { useMe } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PUBLIC_ROUTES } from "@/lib/const";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const isPublicRoute = (PUBLIC_ROUTES as readonly string[]).includes(pathname);

  const me = useMe({ enabled: !isPublicRoute });

  useEffect(() => {
    if (isPublicRoute) return;

    if (me.data) {
      setShouldRedirect(false);
      return;
    }

    if (me.isLoading) {
      setShouldRedirect(false);
      return;
    }

    if (me.isError && !me.data) {
      const timer = setTimeout(() => {
        setShouldRedirect(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [me.isLoading, me.data, me.isError, isPublicRoute]);

  useEffect(() => {
    if (shouldRedirect && !isPublicRoute) {
      router.push("/auth");
    }
  }, [shouldRedirect, router, isPublicRoute]);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (me.isLoading || (!me.data && !shouldRedirect)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (shouldRedirect) {
    return null;
  }

  return <>{children}</>;
}
