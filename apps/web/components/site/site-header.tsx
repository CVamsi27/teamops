"use client";
import Link from "next/link";
import { useMe, useLogout } from "@/hooks/useAuth";
import { Button } from "@workspace/ui/components/button";

export function SiteHeader() {
  const { data: user } = useMe();
  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout({}, {
      onSuccess: () => {
        window.location.href = "/";
      }
    });
  };

  return (
    <header className="border-b">
      <div className="container margin-auto padding-horizontal height-14 flex items-center justify-between">
        <Link href="/" className="font-bold">
          TeamOps
        </Link>
        <nav className="flex content-spacing text-sm">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/teams">Teams</Link>
          <Link href="/tasks">Tasks</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/contact">Contact</Link>
          {user ? (
            <Button 
              onClick={handleLogout}
              variant={"link"}
              className="text-destructive"
              size="link"
            >
              Logout
            </Button>
          ) : (
            <Link href="/auth/login" className="text-primary">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
