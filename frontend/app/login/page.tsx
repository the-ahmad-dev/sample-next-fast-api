"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { UsersService } from "@/app/client";
import { AuthButton } from "@/components/auth/auth-button";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthLayout } from "@/components/auth/auth-layout";
import { APP_NAME } from "@/config/app";
import { usePageTitle } from "@/hooks/use-page-title";
import { handleError } from "@/lib/error";
import { saveToken } from "@/lib/token";
import {
  ERROR_MESSAGES,
  isValidEmail,
  isValidPassword,
  normalizeEmail,
} from "@/lib/validation";

export default function LoginPage() {
  usePageTitle(`Login - ${APP_NAME}`);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!isValidEmail(email)) {
      newErrors.email = ERROR_MESSAGES.INVALID_EMAIL;
    }

    if (!password) {
      newErrors.password = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!isValidPassword(password)) {
      newErrors.password = ERROR_MESSAGES.PASSWORD_TOO_SHORT;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await UsersService.loginApiV1UserLoginPost({
        requestBody: {
          email: normalizeEmail(email),
          password,
        },
      });

      // Save the JWT token (this also updates OpenAPI client)
      saveToken(response.access_token);

      // Redirect based on user status
      if (response.user.pending_2fa) {
        router.push("/verify-2fa");
      } else if (!response.user.signup_verified) {
        router.push("/verify-signup");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back"
        description="Sign in to your account to continue"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
            error={errors.email}
            disabled={loading}
            autoComplete="email"
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:text-primary/90 underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.password
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "border-input"
              }`}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>
          <AuthButton loading={loading}>Sign In</AuthButton>
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:text-primary/90 underline"
            >
              Sign up
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
