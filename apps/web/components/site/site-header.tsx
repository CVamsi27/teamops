"use client";
import Link from "next/link";
import { useMe, useLogout, AuthUtils } from "@/hooks/useAuth";
import { Button } from "@workspace/ui/components/button";
import { ModeToggle } from "@/components/mode-toggle";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { UserAvatar } from "@/components/user/user-avatar";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { LogIn } from "lucide-react";

export function SiteHeader() {
  const { data: user } = useMe();
  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    console.log('[Logout] Starting logout process...');
    
    // Clear token first
    AuthUtils.clearToken();
    
    // Then call logout API
    logout(
      {},
      {
        onSuccess: () => {
          console.log('[Logout] API logout successful, redirecting...');
          // Use replace to avoid back button issues
          window.location.replace("/");
        },
        onError: (error) => {
          console.log('[Logout] API logout failed, but token cleared, redirecting...', error);
          // Even if API fails, token is cleared so redirect anyway
          window.location.replace("/");
        },
      },
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="flex items-center space-x-4 flex-1">
          <div className="md:hidden">
            <MobileNav user={user} />
          </div>

          <Link
            href="/"
            className="flex items-center space-x-2 text-xl font-bold transition-colors hover:text-primary"
          >
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TeamOps
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-1">
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/teams">Teams</NavLink>
          <NavLink href="/tasks">Tasks</NavLink>
          <NavLink href="/projects">Projects</NavLink>
          <NavLink href="/integrations">Integrations</NavLink>
          <NavLink href="/pricing">Pricing</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        </nav>

        <div className="flex items-center space-x-2">
          {user && <NotificationCenter />}
          <ModeToggle />

          {user ? (
            <UserAvatar user={user} onLogout={handleLogout} />
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="relative px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-accent/50 rounded-md group"
    >
      {children}
      <span className="absolute inset-x-1 -bottom-px h-px bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}
