
// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to log in.");
      }

      // --------------------------------------------------------
      // Get logged-in user
      // --------------------------------------------------------

      const loggedInUser = data?.data?.user;

      if (!loggedInUser) {
        throw new Error("Invalid login response.");
      }

      // --------------------------------------------------------
      // Normalize role
      // --------------------------------------------------------

      const userRole = String(loggedInUser.role || "").toUpperCase();

      // --------------------------------------------------------
      // Refresh AuthContext / Server Components
      // --------------------------------------------------------

      router.refresh();

      // --------------------------------------------------------
      // Role-based initial redirect
      // --------------------------------------------------------

      const adminRoles = [
        "SUPERADMIN",
        "SUPER_ADMIN",
        "ADMIN",
        "STAFF",
      ];

      if (adminRoles.includes(userRole)) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-on-surface px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-surface-container-lowest dark:bg-surface-container-low p-8 rounded-2xl border border-border shadow-executive">

        {/* Header */}
        <div>
          <h2 className="headline-lg text-center text-on-surface font-semibold tracking-tight">
            Welcome back
          </h2>

          <p className="mt-2 text-center body-md text-on-surface-variant">
            Sign in to manage your executive rentals and reserve your next
            drive.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-error-container/20 border-l-4 border-error p-4 rounded-lg text-sm text-error flex items-center gap-2">
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>

          <div className="space-y-4">

            {/* Email */}
            <div>
              <label className="block label-sm mb-1.5 text-on-surface font-medium">
                Email address
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="executive-input block w-full px-4 py-3 rounded-lg border border-border bg-background text-on-surface body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block label-sm mb-1.5 text-on-surface font-medium">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="executive-input block w-full px-4 py-3 pr-12 rounded-lg border border-border bg-background text-on-surface body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="••••••••"
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />

                      <path
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Forgot password */}
          <div className="flex items-center justify-between text-sm">
            <Link
              href="/forgot-password"
              className="label-sm text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="executive-btn w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-on-primary bg-primary hover:bg-primary-container active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer shadow-md"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-on-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />

                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>

                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>

        {/* Register */}
        <p className="text-center body-md text-on-surface-variant mt-4">
          Don&#39;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline"
          >
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}

