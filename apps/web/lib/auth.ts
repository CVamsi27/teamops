import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key",
);

export interface User {
  id: number;
  email: string;
  name?: string;
  role?: string;
}

export interface CustomJWTPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

export class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async createToken(user: User): Promise<string> {
    return new SignJWT({
      userId: user.id,
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);
  }

  async verifyToken(token: string): Promise<CustomJWTPayload | null> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return {
        userId: payload.userId as number,
        email: payload.email as string,
        iat: payload.iat,
        exp: payload.exp,
      };
    } catch (error) {
      console.error("Token verification failed:", error);
      return null;
    }
  }

  async getCurrentUserFromToken(
    token: string,
  ): Promise<CustomJWTPayload | null> {
    try {
      if (!token) return null;
      return this.verifyToken(token);
    } catch (error) {
      console.error("Get current user failed:", error);
      return null;
    }
  }

  async requireAuthFromToken(token: string): Promise<CustomJWTPayload> {
    const user = await this.getCurrentUserFromToken(token);
    if (!user) {
      throw new Error("Authentication required");
    }
    return user;
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  generateSecureToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}

export const authService = AuthService.getInstance();
