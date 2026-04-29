// Minimal layout for print pages — global chrome is suppressed by the root
// layout for /print/* routes (see app/_chrome.tsx). We only need to load the
// print font CSS here and inject the inline fit-scale script used by the
// live preview iframe in the recipe editor.
import "./print.css";

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
    <>
      {children}
      <script dangerouslySetInnerHTML={{ __html: FIT_SCRIPT }} />
    </>
  );
}
