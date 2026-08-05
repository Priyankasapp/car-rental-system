/* eslint-disable @next/next/no-page-custom-font */
// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

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
      className={` h-full antialiased scroll-smooth`}
      data-scroll-behavior="smooth" 
    >
      <head>
   <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

</head>
      <body className="min-h-full flex flex-col bg-background">
        {children}
      </body>
    </html>
  );
}
