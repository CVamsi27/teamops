export class AuthStorage {
  private static readonly TOKEN_KEY = "teamops_auth_token";
  private static readonly EXPIRY_KEY = "teamops_auth_expiry";
  private static readonly DEFAULT_EXPIRY_DAYS = 7;

  static isStorageAvailable(): boolean {
    if (typeof window === "undefined") return false;
    
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.error('[AuthStorage] localStorage not available:', error);
      return false;
    }
  }

  static setToken(
    token: string,
    expiryDays: number = this.DEFAULT_EXPIRY_DAYS,
  ): void {
    if (typeof window === "undefined") {
      console.warn('[AuthStorage] setToken called on server side, skipping');
      return;
    }

    const storageAvailable = this.isStorageAvailable();
    console.log('[AuthStorage] Setting token:', {
      tokenLength: token?.length,
      expiryDays,
      hasLocalStorage: typeof localStorage !== 'undefined',
      storageAvailable,
      environment: process.env.NODE_ENV,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      userAgent: navigator.userAgent,
    });

    if (!storageAvailable) {
      console.error('[AuthStorage] localStorage is not available, cannot save token');
      return;
    }

    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);

      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.EXPIRY_KEY, expiryDate.toISOString());
      
      // Verify the token was actually saved
      const savedToken = localStorage.getItem(this.TOKEN_KEY);
      const savedExpiry = localStorage.getItem(this.EXPIRY_KEY);
      console.log('[AuthStorage] Token saved verification:', {
        tokenSaved: !!savedToken,
        expirySaved: !!savedExpiry,
        tokenMatches: savedToken === token,
        expiryDate: savedExpiry,
      });
    } catch (error) {
      console.error('[AuthStorage] Error setting token:', error);
    }
  }

  static getToken(): string | null {
    if (typeof window === "undefined") {
      console.warn('[AuthStorage] getToken called on server side, returning null');
      return null;
    }

    console.log('[AuthStorage] Getting token:', {
      hasLocalStorage: typeof localStorage !== 'undefined',
      environment: process.env.NODE_ENV,
      hostname: window.location.hostname,
    });

    const token = localStorage.getItem(this.TOKEN_KEY);
    const expiry = localStorage.getItem(this.EXPIRY_KEY);

    console.log('[AuthStorage] Retrieved from localStorage:', {
      hasToken: !!token,
      hasExpiry: !!expiry,
      tokenPreview: token ? `${token.substring(0, 10)}...` : null,
      expiry,
    });

    if (!token || !expiry) {
      console.log('[AuthStorage] Missing token or expiry, clearing and returning null');
      this.clearToken();
      return null;
    }

    const expiryDate = new Date(expiry);
    const now = new Date();

    console.log('[AuthStorage] Expiry check:', {
      expiryDate: expiryDate.toISOString(),
      now: now.toISOString(),
      isExpired: now > expiryDate,
    });

    if (now > expiryDate) {
      console.log('[AuthStorage] Token expired, clearing and returning null');
      this.clearToken();
      return null;
    }

    console.log('[AuthStorage] Returning valid token');
    return token;
  }

  static clearToken(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EXPIRY_KEY);
  }

  static isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  static getDaysUntilExpiry(): number | null {
    if (typeof window === "undefined") return null;

    const expiry = localStorage.getItem(this.EXPIRY_KEY);
    if (!expiry) return null;

    const expiryDate = new Date(expiry);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }

  static extendToken(
    additionalDays: number = this.DEFAULT_EXPIRY_DAYS,
  ): boolean {
    const token = this.getToken();
    if (!token) return false;

    this.setToken(token, additionalDays);
    return true;
  }
}
