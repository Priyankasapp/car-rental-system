/* eslint-disable @next/next/no-page-custom-font */
// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CarProvider } from "@/context/CarContext";
import { BookingProvider } from "@/context/BookingContext"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
      data-scroll-behavior="smooth" 
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-background">
        <AuthProvider>
          <CarProvider>
            <BookingProvider>  {/*  Add BookingProvider here */}
              {children}
            </BookingProvider>
          </CarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}