// app/(auth)/layout.tsx
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      {/* Branding */}
      <div className="mb-8">
        <Link href="/" className="text-3xl font-bold text-blue-600">
          UrbanDrive
        </Link>
        <p className="text-center text-sm text-gray-500 mt-1">
          Premium Car Rental
        </p>
      </div>

      {/* Auth Form Container */}
      <div className="w-full max-w-md">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-gray-400">
        &copy; {new Date().getFullYear()} UrbanDrive. All rights reserved.
      </p>
    </div>
  );
}