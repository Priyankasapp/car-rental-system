"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }

      setSuccess("Password reset successful! Redirecting to login page...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        
        {/* Back Link */}
        <Link
          href="/login"
          className="inline-block text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-black mb-6 transition-colors"
        >
          &larr; Back to Sign In
        </Link>

        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-black">
            Set New Password
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter the reset code sent to your email along with your new password.
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            {success}
          </div>
        )}

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm transition-all text-black"
              placeholder="you@example.com"
            />
          </div>

          {/* OTP Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              Reset Code (OTP)
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.trim())}
              className="w-full text-center tracking-widest text-xl font-mono px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
              placeholder="123456"
            />
          </div>

          {/* New Password Input with Show/Hide Toggle */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-3 pr-16 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm transition-all text-black"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-black focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 cursor-pointer transition-colors shadow-sm"
          >
            {loading ? "Updating Password..." : "Reset Password"}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-6 mt-6 border-t border-gray-100 text-center text-sm text-gray-500">
          Remembered your password?{" "}
          <Link href="/login" className="font-semibold text-black hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center text-sm text-gray-500">
          Loading...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}