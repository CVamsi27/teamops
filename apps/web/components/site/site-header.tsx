"use client";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold">
          TeamOps
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/teams">Teams</Link>
          <Link href="/tasks">Tasks</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
