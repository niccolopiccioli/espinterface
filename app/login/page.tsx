"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Cpu, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Clear errors on mount
  useEffect(() => {
    setErrors({});
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: "Invalid email or password" });
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setErrors({ general: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      
      <div className="relative w-full max-w-md">
        {/* Login card */}
        <div
          className="rounded-xl p-8 shadow-2xl"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Logo and title */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-xl mb-4"
              style={{ backgroundColor: "var(--hw-success-dim)" }}
            >
              <Cpu className="h-10 w-10" style={{ color: "var(--hw-success)" }} />
            </div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--foreground)" }}
            >
              ESP-Control
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              Hardware Dashboard Login
            </p>
          </div>

          {/* Demo credentials hint */}
          <div
            className="rounded-lg p-3 mb-6 text-sm"
            style={{
              backgroundColor: "var(--hw-success-dim)",
              border: "1px solid var(--hw-success)",
            }}
          >
            <p style={{ color: "var(--hw-success)" }} className="font-medium mb-1">
              Demo Credentials
            </p>
            <p style={{ color: "var(--foreground)" }} className="text-xs opacity-80">
              Email: <span className="font-mono">admin@esp32.local</span>
            </p>
            <p style={{ color: "var(--foreground)" }} className="text-xs opacity-80">
              Password: <span className="font-mono">esp32admin</span>
            </p>
          </div>

          {/* Error message */}
          {errors.general && (
            <div
              className="flex items-center gap-2 rounded-lg p-3 mb-6"
              style={{
                backgroundColor: "var(--hw-danger-dim)",
                border: "1px solid var(--hw-danger)",
              }}
            >
              <AlertCircle
                className="h-4 w-4 flex-shrink-0"
                style={{ color: "var(--hw-danger)" }}
              />
              <p
                className="text-sm"
                style={{ color: "var(--hw-danger)" }}
              >
                {errors.general}
              </p>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                style={{ color: "var(--foreground)" }}
                className="text-sm font-medium"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: "var(--muted-foreground)" }}
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@esp32.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 h-11"
                  style={{
                    backgroundColor: "var(--hw-surface)",
                    borderColor: errors.email ? "var(--hw-danger)" : "var(--border)",
                    color: "var(--foreground)",
                  }}
                />
              </div>
              {errors.email && (
                <p
                  className="text-xs"
                  style={{ color: "var(--hw-danger)" }}
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                style={{ color: "var(--foreground)" }}
                className="text-sm font-medium"
              >
                Password
              </Label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: "var(--muted-foreground)" }}
                />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 h-11"
                  style={{
                    backgroundColor: "var(--hw-surface)",
                    borderColor: errors.password ? "var(--hw-danger)" : "var(--border)",
                    color: "var(--foreground)",
                  }}
                />
              </div>
              {errors.password && (
                <p
                  className="text-xs"
                  style={{ color: "var(--hw-danger)" }}
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 font-medium"
              style={{
                backgroundColor: "var(--hw-success)",
                color: "#000",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p
              className="text-xs"
              style={{ color: "var(--muted-foreground)" }}
            >
              Protected by NextAuth.js
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
