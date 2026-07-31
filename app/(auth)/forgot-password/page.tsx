"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to process request.");
      }

      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
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
            Reset Password
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your email address and we&#39;ll send you a password reset code.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm transition-all"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 cursor-pointer transition-colors shadow-sm"
          >
            {loading ? "Sending Code..." : "Send Reset Code"}
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