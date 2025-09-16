import "@workspace/ui/styles/globals.css";
import Providers from "./providers";
import { SiteHeader } from "../components/site/site-header";
import { SiteFooter } from "../components/site/site-footer";
import { Toaster } from "@workspace/ui/components/sonner";

export const metadata = {
  title: "TeamOps",
  description: "Team, Projects, Tasks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-background text-foreground">
        <Providers>
          <SiteHeader />
          <main className="container mx-auto flex-1 px-4 py-8">{children}</main>
          <Toaster />
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
