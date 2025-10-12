"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Loader2, Mail, AlertCircle } from "lucide-react";
import { LoginInput } from "@workspace/api";
import { useLogin, AuthUtils } from "../../hooks/useAuth";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const login = useLogin();
  const router = useRouter();
  const [error, setError] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const payload: LoginInput = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    login.mutate(payload, {
      onError: (error: unknown) => {
        const errorMessage = (error && typeof error === 'object' && 'response' in error && error.response && 
          typeof error.response === 'object' && 'data' in error.response && error.response.data &&
          typeof error.response.data === 'object' && 'message' in error.response.data) 
          ? (error.response.data as { message: string }).message 
          : (error && typeof error === 'object' && 'message' in error) 
            ? (error as { message: string }).message 
            : 'Unknown error';
        
        if (errorMessage === 'EMAIL_NOT_FOUND') {
          setError("Email not found. Please register first.");
          setTimeout(() => onSwitchToRegister(), 2000);
        } else if (errorMessage === 'USE_GOOGLE_LOGIN') {
          setError("This email is registered with Google. Please use Google login.");
        } else if (errorMessage === 'INVALID_PASSWORD') {
          setError("Invalid password. Please try again.");
        } else {
          setError("Login failed. Please try again.");
        }
      },
      onSuccess: async (data: { access_token?: string }) => {
        // Store token for persistent login
        if (data?.access_token) {
          AuthUtils.saveToken(data.access_token);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        router.push("/dashboard");
      }
    });
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl rounded-2xl">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col form-spacing">
          <Input type="email" name="email" placeholder="Email" required />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            required
          />

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={login.isPending}
          >
            {login.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Login
          </Button>
        </form>

        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => {
            window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
          }}
        >
          <Mail className="w-4 h-4 mr-2" /> Continue with Google
        </Button>

        <p className="text-center text-sm mt-4">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            className="underline text-primary hover:text-primary/80"
            onClick={onSwitchToRegister}
          >
            Register here
          </button>
        </p>
      </CardContent>
    </Card>
  );
}