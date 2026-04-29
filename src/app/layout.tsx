import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lviv Croissants — ТК-пісочниця",
  description:
    "Технологічні картки круасанів: рецептура, фудкост, експорт у PDF за стандартом мережі.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: "#7D9622" }}
              />
              <span className="font-semibold">Lviv Croissants</span>
              <span className="text-stone-500">·</span>
              <span className="text-stone-600">ТК-пісочниця</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/recipes" className="hover:underline">
                Техкартки
              </Link>
              <Link href="/ingredients" className="hover:underline">
                Інгредієнти
              </Link>
              <Link href="/help" className="hover:underline text-stone-500">
                Як користуватись
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
