// Minimal layout for the print page — no global chrome, just our font setup.
import "./print.css";

// On screen (live preview iframe), scale the A4 page down to fit the iframe
// width using a CSS variable updated by an inline script. In print mode the
// transform is disabled so Puppeteer renders at native A4.
const FIT_SCRIPT = `(function(){
  function fit(){
    var px = (210 * 96 / 25.4); // 210mm in CSS px at 96dpi
    var w = window.innerWidth || document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--fit-scale', String(w / px));
  }
  fit();
  window.addEventListener('resize', fit);
})();`;

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
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: FIT_SCRIPT }} />
      </body>
    </html>
  );
}
