"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Sheet, SheetContent, SheetTrigger } from "@workspace/ui/components/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";

interface MobileNavProps {
  user?: {
    name?: string;
    email: string;
    role: string;
  };
}

export function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="md:hidden"
          size="icon"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2 pb-4 border-b">
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TeamOps
            </span>
          </div>
          
          {user && (
            <div className="space-y-2">
              <MobileNavLink href="/dashboard" onClick={handleLinkClick}>
                Dashboard
              </MobileNavLink>
              <MobileNavLink href="/teams" onClick={handleLinkClick}>
                Teams
              </MobileNavLink>
              <MobileNavLink href="/tasks" onClick={handleLinkClick}>
                Tasks
              </MobileNavLink>
              <MobileNavLink href="/projects" onClick={handleLinkClick}>
                Projects
              </MobileNavLink>
              <MobileNavLink href="/integrations" onClick={handleLinkClick}>
                Integrations
              </MobileNavLink>
            </div>
          )}
          
          <div className="space-y-2 pt-4 border-t">
            <MobileNavLink href="/pricing" onClick={handleLinkClick}>
              Pricing
            </MobileNavLink>
            <MobileNavLink href="/contact" onClick={handleLinkClick}>
              Contact
            </MobileNavLink>
          </div>
          
          {!user && (
            <div className="space-y-2 pt-4 border-t">
              <Button asChild className="w-full justify-start">
                <Link href="/auth/login" onClick={handleLinkClick}>
                  Login
                </Link>
              </Button>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
    >
      {children}
    </Link>
  );
}