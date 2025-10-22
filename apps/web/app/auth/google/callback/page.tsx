'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUtils } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function GoogleCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (error) {
      router.push('/auth?error=google_oauth_failed');
      return;
    }

    if (!token) {
      router.push('/auth?error=no_token');
      return;
    }

    AuthUtils.saveToken(token);
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="animate-spin mx-auto mb-4" size={48} />
        <p className="text-muted-foreground">Completing Google sign in...</p>
      </div>
    </div>
  );
}