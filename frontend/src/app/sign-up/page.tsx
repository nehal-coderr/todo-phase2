"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/layout/auth-layout";
import { TextInput } from "@/components/ui/text-input";
import { PrimaryButton } from "@/components/ui/primary-button";
import { signUp } from "@/lib/auth-client";
import { signUpSchema } from "@/lib/validation";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (field: "email" | "password" | "confirmPassword") => {
    const result = signUpSchema.safeParse({ email, password, confirmPassword });
    if (!result.success) {
      const fieldError = result.error.issues.find(
        (issue) => issue.path[0] === field
      );
      if (fieldError) {
        setErrors((prev) => ({ ...prev, [field]: fieldError.message }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    const result = signUpSchema.safeParse({ email, password, confirmPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signUp.email({
        email,
        password,
        name: email.split("@")[0],
      });

      if (error) {
        setApiError(
          error.message || "An account with this email already exists"
        );
      } else {
        router.push("/dashboard");
      }
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="mb-6 text-center text-xl font-semibold text-gray-900">
        Create your account
      </h2>

      {apiError && (
        <div className="mb-4 rounded-md bg-danger-50 p-3 text-sm text-danger-700">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(value) => {
            setEmail(value);
            if (errors.email) {
              setErrors((prev) => {
                const next = { ...prev };
                delete next.email;
                return next;
              });
            }
          }}
          onBlur={() => validateField("email")}
          error={errors.email}
          required
          disabled={isLoading}
        />

        <TextInput
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(value) => {
            setPassword(value);
            if (errors.password) {
              setErrors((prev) => {
                const next = { ...prev };
                delete next.password;
                return next;
              });
            }
          }}
          onBlur={() => validateField("password")}
          error={errors.password}
          required
          disabled={isLoading}
        />

        <TextInput
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(value) => {
            setConfirmPassword(value);
            if (errors.confirmPassword) {
              setErrors((prev) => {
                const next = { ...prev };
                delete next.confirmPassword;
                return next;
              });
            }
          }}
          onBlur={() => validateField("confirmPassword")}
          error={errors.confirmPassword}
          required
          disabled={isLoading}
        />

        <PrimaryButton
          type="submit"
          label={isLoading ? "Creating account..." : "Sign Up"}
          loading={isLoading}
          fullWidth
        />
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-primary-600 hover:text-primary-700">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
