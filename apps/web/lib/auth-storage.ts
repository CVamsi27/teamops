// Token storage utility for persistent authentication
export class AuthStorage {
  private static readonly TOKEN_KEY = 'teamops_auth_token';
  private static readonly EXPIRY_KEY = 'teamops_auth_expiry';
  private static readonly DEFAULT_EXPIRY_DAYS = 7; // 7 days

  /**
   * Store authentication token with expiry
   */
  static setToken(token: string, expiryDays: number = this.DEFAULT_EXPIRY_DAYS): void {
    if (typeof window === 'undefined') return;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.EXPIRY_KEY, expiryDate.toISOString());
  }

  /**
   * Get stored authentication token if valid
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem(this.TOKEN_KEY);
    const expiry = localStorage.getItem(this.EXPIRY_KEY);

    if (!token || !expiry) {
      this.clearToken();
      return null;
    }

    const expiryDate = new Date(expiry);
    const now = new Date();

    if (now > expiryDate) {
      this.clearToken();
      return null;
    }

    return token;
  }

  /**
   * Clear stored authentication data
   */
  static clearToken(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EXPIRY_KEY);
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Get remaining days until token expires
   */
  static getDaysUntilExpiry(): number | null {
    if (typeof window === 'undefined') return null;

    const expiry = localStorage.getItem(this.EXPIRY_KEY);
    if (!expiry) return null;

    const expiryDate = new Date(expiry);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }

  /**
   * Extend token expiry by specified days
   */
  static extendToken(additionalDays: number = this.DEFAULT_EXPIRY_DAYS): boolean {
    const token = this.getToken();
    if (!token) return false;

    this.setToken(token, additionalDays);
    return true;
  }
}