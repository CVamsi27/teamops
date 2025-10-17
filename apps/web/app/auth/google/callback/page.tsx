"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthUtils } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      router.push('/auth?error=google_oauth_failed');
      return;
    }

    if (token) {
      // Save token to localStorage
      AuthUtils.saveToken(token);
      // Redirect to dashboard
      router.push('/dashboard');
    } else {
      // No token found, redirect to login
      router.push('/auth?error=no_token');
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="animate-spin mx-auto mb-4" size={48} />
        <p className="text-muted-foreground">Completing Google sign in...</p>
      </div>
    </div>
  );
}