"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { UsersService } from "@/app/client";
import { AuthButton } from "@/components/auth/auth-button";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthLayout } from "@/components/auth/auth-layout";
import { handleError } from "@/lib/error";
import { saveToken } from "@/lib/token";
import {
  ERROR_MESSAGES,
  isValidEmail,
  isValidFullName,
  isValidPassword,
  normalizeEmail,
  normalizeFullName,
} from "@/lib/validation";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!isValidFullName(fullName)) {
      newErrors.fullName = ERROR_MESSAGES.INVALID_FULL_NAME;
    }

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
      const response = await UsersService.signupApiV1UserSignupPost({
        requestBody: {
          email: normalizeEmail(email),
          password,
          full_name: normalizeFullName(fullName),
        },
      });

      // Save the JWT token (this also updates OpenAPI client)
      saveToken(response.access_token);

      // Redirect to verify-signup page
      router.push("/verify-signup");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Create an account"
        description="Enter your details to get started"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            id="fullName"
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={setFullName}
            error={errors.fullName}
            disabled={loading}
            autoComplete="name"
          />
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
          <AuthInput
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
            error={errors.password}
            disabled={loading}
            autoComplete="new-password"
          />
          <AuthButton loading={loading}>Create Account</AuthButton>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/90 underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
