"use client";

import { useRouter } from "next/navigation";
import { LoginForm } from "./login-form";

export function AuthForm() {
  const router = useRouter();

  return <LoginForm onSwitchToRegister={() => router.push("/auth/register")} />;
}
