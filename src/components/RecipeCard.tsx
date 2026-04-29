// Print-ready recipe card. Matches Lviv Croissants standard
// PDF layout (Herring.pdf reference). All sizes are in mm/pt to render
// crisp on A4. Rendered server-side and consumed by Puppeteer.

import { formatWeightCell } from "@/lib/cost";
import type { RecipeView } from "@/lib/types";

const BRAND_GREEN = "#7D9622";
const TABLE_GREY = "#666666";
const ROW_BORDER = "#D6D6D6";
const TEXT_COLOR = "#111111";
const SUBTITLE_GREY = "#5A5A5A";

interface Props {
  recipe: RecipeView;
}

export function RecipeCard({ recipe }: Props) {
  const totalKg = recipe.totalWeightKg ?? recipe.items
    .filter((i) => i.unit === "kg" || i.unit === "l")
    .reduce((acc, i) => acc + (i.netWeight || 0), 0);

  return (
    <div className="rc-page">
      {/* Lviv Croissants logo as a faint centered watermark */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/lviv-croissants-logo.png"
        alt=""
        className="rc-watermark-img"
      />

      <div className="rc-content">
        <h1 className="rc-title">{recipe.nameEn || recipe.nameUk}</h1>
        <h2 className="rc-subtitle">Recipe card</h2>

        <table className="rc-table">
          <thead>
            <tr>
              <th className="rc-th rc-th-name">Product name</th>
              <th className="rc-th rc-th-num">Gross weight kg/pcs.</th>
              <th className="rc-th rc-th-num">Net weight kg/pcs.</th>
            </tr>
          </thead>
          <tbody>
            {recipe.items.map((it, idx) => (
              <tr key={idx} className="rc-row">
                <td className="rc-td rc-td-name">{it.displayName}</td>
                <td className="rc-td rc-td-num">
                  <strong>{formatWeightCell(it.grossWeight, it.unit)}</strong>
                </td>
                <td className="rc-td rc-td-num">
                  <strong>{formatWeightCell(it.netWeight, it.unit)}</strong>
                </td>
              </tr>
            ))}
            <tr className="rc-total">
              <td className="rc-total-label">Total weight</td>
              <td className="rc-total-num"></td>
              <td className="rc-total-num">
                {recipe.totalWeightKg != null
                  ? totalKg.toFixed(3).replace(".", ",")
                  : totalKg.toFixed(3).replace(".", ",")}
              </td>
            </tr>
          </tbody>
        </table>

        {recipe.steps.length > 0 && (
          <div className="rc-instr-block">
            <div className="rc-instr-header">Instructions:</div>
            <div className="rc-instr-body">
              {recipe.steps.map((s) => (
                <div className="rc-instr-step" key={s.stepNumber}>
                  {s.stepNumber}. {s.text}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rc-footer">
          <span className="rc-footer-text">
            © These instructions are part of the standards of the Lviv Croissants
            bakery chain. Any copying or transmission to third parties is
            prohibited and will result in consequences.
          </span>
          <span className="rc-footer-version">{recipe.versionCode}</span>
        </div>
      </div>

      <style>{`
        @page { size: A4; margin: 0; }
        html, body { margin: 0; padding: 0; }
        * { box-sizing: border-box; }
        body, h1, h2, h3, p, span, td, th, div, button, input, select, textarea {
          font-family: 'Carlito', 'Calibri', 'Segoe UI', sans-serif;
        }
        body {
          color: ${TEXT_COLOR};
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .rc-page {
          position: relative;
          width: 210mm;
          height: 297mm;
          padding: 14mm 14mm 12mm 14mm;
          background: #fff;
          overflow: hidden;
        }
        /* Live preview only: fit the A4 page to the iframe viewport width.
           Puppeteer renders with @media print, so this is ignored in PDF. */
        @media screen {
          html, body { height: 100%; overflow: hidden; }
          .rc-page {
            transform: scale(var(--fit-scale, 1));
            transform-origin: top left;
          }
        }
        .rc-watermark-img {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 150mm;
          height: auto;
          opacity: 0.07;
          pointer-events: none;
          z-index: 0;
        }

        .rc-content { position: relative; z-index: 1; padding-bottom: 24mm; }

        .rc-title {
          font-size: 22pt;
          color: ${BRAND_GREEN};
          text-align: center;
          font-weight: 700;
          margin: 4mm 0 2mm 0;
        }
        .rc-subtitle {
          font-size: 16pt;
          color: ${SUBTITLE_GREY};
          text-align: center;
          font-weight: 700;
          margin: 0 0 4mm 0;
        }

        .rc-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10.5pt;
        }
        .rc-th {
          background: ${TABLE_GREY};
          color: #fff;
          padding: 3mm 4mm;
          font-weight: 700;
          text-align: left;
          border: 1px solid ${TABLE_GREY};
        }
        .rc-th-num { text-align: center; }
        .rc-th-name { width: 44%; }

        .rc-row .rc-td {
          padding: 3mm 4mm;
          border: 1px solid ${ROW_BORDER};
        }
        .rc-td-name { font-weight: 400; }
        .rc-td-num { text-align: center; font-weight: 700; }

        .rc-total td {
          background: ${TABLE_GREY};
          color: #fff;
          padding: 3mm 4mm;
          font-weight: 700;
          border: 1px solid ${TABLE_GREY};
        }
        .rc-total-label { text-align: left; }
        .rc-total-num { text-align: center; }

        .rc-instr-block {
          margin-top: 6mm;
          border: 1px solid ${ROW_BORDER};
        }
        .rc-instr-header {
          background: ${BRAND_GREEN};
          color: #fff;
          font-weight: 700;
          padding: 3mm 4mm;
          font-size: 11pt;
        }
        .rc-instr-body {
          padding: 3mm 4mm 4mm 4mm;
        }
        .rc-instr-step {
          font-size: 10.5pt;
          line-height: 1.55;
          margin: 2mm 0;
        }

        .rc-footer {
          position: absolute;
          left: 14mm;
          right: 14mm;
          bottom: 6mm;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 8pt;
          color: ${SUBTITLE_GREY};
        }
        .rc-footer-text {
          flex: 1;
          text-align: center;
          font-style: italic;
        }
        .rc-footer-version {
          color: ${BRAND_GREEN};
          font-weight: 700;
          margin-left: 4mm;
        }
      `}</style>
    </div>
  );
}


