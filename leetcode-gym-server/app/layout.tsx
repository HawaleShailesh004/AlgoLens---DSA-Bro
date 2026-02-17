import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlgoLens Gym",
  description: "LeetCode spotter, coach, and review queue",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-zinc-950 text-zinc-100 antialiased">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
