"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { FiFacebook, FiInstagram, FiTwitter } from "react-icons/fi";

const fleetLinks = [
  "Exotic Sports",
  "Executive SUVs",
  "Next-Gen Electric",
  "Classic Collection",
];

const companyLinks = ["About Us", "Our Process", "Contact", "Locations"];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white p-10 px-15">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Top Section */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-black">
              UrbanDrive
            </h2>

            <p className="mt-6 max-w-xs text-sm leading-7 text-gray-600">
              The world&apos;s most exclusive car rental platform. Defined by
              performance, delivered with precision.
            </p>

            <div className="mt-8 flex items-center gap-4">
              <Link
                href="#"
                className="rounded-full border border-gray-300 p-2 transition hover:bg-black hover:text-white"
              >
                <FiFacebook size={18} />
              </Link>

              <Link
                href="#"
                className="rounded-full border border-gray-300 p-2 transition hover:bg-black hover:text-white"
              >
                <FiInstagram size={18} />
              </Link>

              <Link
                href="#"
                className="rounded-full border border-gray-300 p-2 transition hover:bg-black hover:text-white"
              >
                <FiTwitter size={18} />
              </Link>
            </div>
          </div>

          {/* Fleet */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-black">
              Fleet
            </h3>

            <ul className="mt-6 space-y-4">
              {fleetLinks.map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-gray-600 transition hover:text-black"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-black">
              Company
            </h3>

            <ul className="mt-6 space-y-4">
              {companyLinks.map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-gray-600 transition hover:text-black"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-black">
              Newsletter
            </h3>

            <p className="mt-6 text-sm leading-6 text-gray-600">
              Stay updated with our latest fleet arrivals.
            </p>

            <form className="mt-6">
              <div className="flex overflow-hidden rounded-full border border-gray-300">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="flex-1 px-5 py-3 text-sm outline-none"
                />

                <button
                  type="submit"
                  className="m-1 flex items-center gap-2 rounded-full bg-black px-5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  Join
                  <Send size={15} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="my-12 border-t border-gray-200" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-gray-500 md:flex-row">
          <p>© 2026 UrbanDrive Executive. All Rights Reserved.</p>

          <div className="flex items-center gap-8">
            <Link href="#" className="transition hover:text-black">
              Privacy Policy
            </Link>

            <Link href="#" className="transition hover:text-black">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}