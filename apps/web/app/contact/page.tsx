export default function ContactPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8">
        Contact Us
      </h1>
      <div className="bg-muted rounded-lg p-8 max-w-md">
        <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
        <p className="text-muted-foreground mb-4">
          Have questions about TeamOps? Want a demo or need enterprise features?
        </p>
        <p className="text-lg">
          Email us at{" "}
          <a
            className="underline font-medium"
            href="mailto:cvamsik99@gmail.com"
          >
            cvamsik99@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
