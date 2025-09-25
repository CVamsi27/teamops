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
import { RegisterInput } from "@workspace/api";
import { useRegister } from "../../hooks/useAuth";
import { useRouter } from "next/navigation";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const register = useRegister();
  const router = useRouter();
  const [error, setError] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const payload: RegisterInput = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    register.mutate(payload, {
      onError: (error: unknown) => {
        const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message;
        
        if (errorMessage === 'USER_EXISTS_LOGIN') {
          setError("This email is already registered. Please login instead.");
          setTimeout(() => onSwitchToLogin(), 2000);
        } else if (errorMessage === 'USER_EXISTS_GOOGLE') {
          setError("This email is registered with Google. Please use Google login.");
        } else {
          setError("Registration failed. Please try again.");
        }
      },
      onSuccess: async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        router.push("/dashboard");
      }
    });
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl rounded-2xl">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col form-spacing">
          <Input name="name" placeholder="Full Name" required />
          <Input type="email" name="email" placeholder="Email" required />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            minLength={6}
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
            disabled={register.isPending}
          >
            {register.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Register
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
          Already have an account?{" "}
          <button
            type="button"
            className="underline text-primary hover:text-primary/80"
            onClick={onSwitchToLogin}
          >
            Login here
          </button>
        </p>
      </CardContent>
    </Card>
  );
}