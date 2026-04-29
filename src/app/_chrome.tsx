"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// On /print/* pages we render the recipe card edge-to-edge with no global
// chrome (header / max-width main wrapper). Both the PDF generator and the
// in-editor live preview iframe target /print/[id], and they need a clean
// canvas without the site header pushing content down.
export function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isPrint = pathname.startsWith("/print/");
  if (isPrint) return <>{children}</>;
  return (
    <>
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ background: "#7D9622" }}
            />
            <span className="font-semibold">Lviv Croissants</span>
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
    </>
  );
}
