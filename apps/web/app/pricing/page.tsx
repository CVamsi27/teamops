export default function PricingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">Pricing</h1>
      <div className="bg-muted rounded-lg p-8 max-w-md">
        <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
        <p className="text-muted-foreground mb-4">
          We&apos;re working on flexible pricing plans that will fit teams of
          all sizes.
        </p>
        <p className="text-sm text-muted-foreground">
          For early access or enterprise inquiries, contact us at{" "}
          <a className="underline" href="mailto:cvamsik99@gmail.com">
            cvamsik99@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
