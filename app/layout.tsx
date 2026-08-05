/* eslint-disable @next/next/no-page-custom-font */
// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});


export const metadata: Metadata = {
  title: {
    default: "UrbanDrive | Premium & Luxury Car Rental",
    template: "%s | UrbanDrive"
  },
  description: "Experience premium, on-demand executive and luxury car rentals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} h-full antialiased scroll-smooth`}
      data-scroll-behavior="smooth" 
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-background">
        {children}
      </body>
    </html>
  );
}
