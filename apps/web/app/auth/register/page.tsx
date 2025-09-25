"use client";

import { RegisterForm } from "@/components/auth/register-form";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center">
      <RegisterForm onSwitchToLogin={() => router.push("/auth/login")} />
    </div>
  );
}