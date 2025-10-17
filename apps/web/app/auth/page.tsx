"use client";
import { AuthForm } from "@/components/auth/auth-form";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { AlertCircle } from "lucide-react";
import { Suspense } from "react";

function AuthPageContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'google_oauth_failed':
        return 'Google sign-in failed. Please try again.';
      case 'no_token':
        return 'Authentication failed. Please try again.';
      default:
        return 'An authentication error occurred. Please try again.';
    }
  };

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center">
      <div className="w-full max-w-md">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {getErrorMessage(error)}
            </AlertDescription>
          </Alert>
        )}
        <AuthForm />
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center">
        <AuthForm />
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
