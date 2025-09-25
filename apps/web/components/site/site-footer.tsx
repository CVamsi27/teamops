export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="container margin-auto padding-section text-sm text-muted-foreground">
        © {new Date().getFullYear()} TeamOps. All rights reserved.
      </div>
    </footer>
  );
}
