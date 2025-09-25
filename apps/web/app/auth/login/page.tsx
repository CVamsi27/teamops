"use client";

import { LoginForm } from "@/components/auth/login-form";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center">
      <LoginForm onSwitchToRegister={() => router.push("/auth/register")} />
    </div>
  );
}