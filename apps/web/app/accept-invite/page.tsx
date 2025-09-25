"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMe } from "@/hooks/useAuth";
import { api } from "@/lib/api";

export default function AcceptInvitePage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const me = useMe();

  useEffect(() => {
    if (!token) return;
    if (!me.data && !me.isLoading) {
      router.push(`/auth?returnTo=/accept-invite?token=${token}`);
      return;
    }
    if (me.data) {
      (async () => {
        await api.post("/invites/accept", { token });
        router.push("/teams");
      })();
    }
  }, [me.isLoading, me.data, token, router]);

  return <div className="padding-horizontal">Accepting invite...</div>;
}
