import "@workspace/ui/styles/globals.css";
import Providers from "./providers";
import { SiteHeader } from "../components/site/site-header";
import { SiteFooter } from "../components/site/site-footer";
import { Toaster } from "@workspace/ui/components/sonner";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/react-query";

export const metadata = {
  title: "TeamOps",
  description: "Team, Projects, Tasks",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();
  const dehydratedState = dehydrate(queryClient);
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-background text-foreground">
        <Providers>
          <HydrationBoundary state={dehydratedState}>
            <SiteHeader />
            <main className="container margin-auto flex-1 padding-section">
              {children}
            </main>
            <Toaster />
            <SiteFooter />
          </HydrationBoundary>
        </Providers>
      </body>
    </html>
  );
}
