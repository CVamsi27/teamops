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
    
    console.log('[Google Callback] URL params:', {
      hasToken: !!token,
      tokenLength: token?.length,
      error,
      fullURL: typeof window !== 'undefined' ? window.location.href : 'N/A',
      environment: process.env.NODE_ENV,
    });

    if (error) {
      console.error('[Google Callback] OAuth error:', error);
      router.push('/auth?error=google_oauth_failed');
      return;
    }

    if (token) {
      console.log('[Google Callback] Saving token...', {
        tokenPreview: `${token.substring(0, 20)}...`,
        tokenLength: token.length,
      });
      
      AuthUtils.saveToken(token);
      
      // Wait a bit to ensure localStorage is updated
      setTimeout(() => {
        // Verify token was saved
        const savedToken = AuthUtils.isAuthenticated();
        const storageToken = typeof window !== 'undefined' ? localStorage.getItem('teamops_auth_token') : null;
        
        console.log('[Google Callback] Token save result:', {
          isAuthenticated: savedToken,
          hasTokenInStorage: !!storageToken,
          storedTokenPreview: storageToken ? `${storageToken.substring(0, 20)}...` : null,
          tokensMatch: storageToken === token,
        });
        
        if (savedToken) {
          console.log('[Google Callback] Token saved successfully, redirecting to dashboard');
          router.push('/dashboard');
        } else {
          console.error('[Google Callback] Token save failed, redirecting to auth with error');
          router.push('/auth?error=token_save_failed');
        }
      }, 100);
    } else {
      console.error('[Google Callback] No token in URL parameters');
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