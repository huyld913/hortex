import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in · Hortex" };

export default function LoginPage() {
  return <LoginForm />;
}
