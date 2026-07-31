// app/(auth)/verify-otp/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // NOTE: Update this URL string to whatever your actual verification API route is named.
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, purpose: "REGISTER" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Verification failed.");
      }

      setSuccess("Email verified successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2500);
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
        <div>
          <h2 className="headline-lg text-center text-on-surface">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center body-md text-on-surface-variant">
            Enter the 6-digit verification code sent to your email address.
          </p>
        </div>

        {error && (
          <div className="bg-error-container/20 border-l-4 border-error p-4 rounded-md text-sm text-error">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-md text-sm text-green-700 dark:text-green-400">
            {success}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="block label-sm mb-1.5 text-on-surface">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="executive-input block w-full px-4 py-3 rounded-lg border border-border bg-background text-on-surface body-md focus:border-primary"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block label-sm mb-1.5 text-on-surface">
                Verification Code (OTP)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.trim())}
                className="executive-input block w-full text-center tracking-widest text-3xl font-mono px-4 py-3 rounded-lg border border-border bg-background text-on-surface focus:border-primary"
                placeholder="123456"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="executive-btn w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-on-primary bg-primary hover:bg-primary-container disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background text-on-surface">
        Loading...
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}