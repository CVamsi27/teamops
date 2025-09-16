export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground">
        © {new Date().getFullYear()} TeamOps. All rights reserved.
      </div>
    </footer>
  );
}
