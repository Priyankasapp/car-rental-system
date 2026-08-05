// app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      //  payload
      const payload = {
        ...formData,
        phone: formData.phone.trim() !== "" ? formData.phone.trim() : undefined,
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      // Redirect to OTP verification with email pre-filled in query params
      router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
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
            Join UrbanDrive
          </h2>
          <p className="mt-2 text-center body-md text-on-surface-variant">
            Create an executive account to unlock seamless vehicle rentals.
          </p>
        </div>

        {error && (
          <div className="bg-error-container/20 border-l-4 border-error p-4 rounded-md text-sm text-error">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block label-sm mb-1.5 text-on-surface">
                First Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="executive-input block w-full px-4 py-3 rounded-lg border border-border bg-background text-on-surface body-md focus:border-primary"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block label-sm mb-1.5 text-on-surface">
                Last Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="executive-input block w-full px-4 py-3 rounded-lg border border-border bg-background text-on-surface body-md focus:border-primary"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block label-sm mb-1.5 text-on-surface">
              Email Address <span className="text-error">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="executive-input block w-full px-4 py-3 rounded-lg border border-border bg-background text-on-surface body-md focus:border-primary"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block label-sm mb-1.5 text-on-surface">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="executive-input block w-full px-4 py-3 rounded-lg border border-border bg-background text-on-surface body-md focus:border-primary"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="executive-btn w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-on-primary bg-primary hover:bg-primary-container disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? "Registering..." : "Send Verification Code"}
            </button>
          </div>
        </form>

        <p className="text-center body-md text-on-surface-variant mt-4">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}