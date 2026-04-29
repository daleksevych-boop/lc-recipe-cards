// Minimal layout for the print page — no global chrome, just our font setup.
import "./print.css";

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Recipe card</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
