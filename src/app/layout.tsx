import type { Metadata } from "next";
import "./globals.css";
import { Chrome } from "./_chrome";

export const metadata: Metadata = {
  title: "Lviv Croissants — Технологічні картки",
  description: "Технологічні картки Lviv Croissants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <Chrome>{children}</Chrome>
      </body>
    </html>
  );
}
