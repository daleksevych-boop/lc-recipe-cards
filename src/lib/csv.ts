/**
 * Minimal CSV/TSV parser that handles:
 * - Auto-detection of separator (tab vs comma vs semicolon)
 * - Quoted fields with embedded separators and newlines
 * - Escaped quotes ("")
 * - Trailing newlines
 */
export function parseDelimited(text: string): string[][] {
  const trimmed = text.replace(/^\uFEFF/, ""); // strip BOM
  const sep = detectSeparator(trimmed);
  return parseWithSep(trimmed, sep);
}

function detectSeparator(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const tabCount = (firstLine.match(/\t/g) ?? []).length;
  const commaCount = (firstLine.match(/,/g) ?? []).length;
  const semiCount = (firstLine.match(/;/g) ?? []).length;
  if (tabCount >= commaCount && tabCount >= semiCount && tabCount > 0)
    return "\t";
  if (semiCount > commaCount) return ";";
  return ",";
}

function parseWithSep(text: string, sep: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === sep) {
        row.push(field);
        field = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += ch;
      }
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

export type IngredientImportRow = {
  nameUk: string;
  nameEn?: string | null;
  unit: "kg" | "l" | "pcs";
  pricePerUnit: number;
  wasteColdPct: number;
  wasteHotPct: number;
  supplier?: string | null;
  notes?: string | null;
};

const HEADER_ALIASES: Record<string, keyof IngredientImportRow> = {
  // UA
  "назва": "nameUk",
  "назва (ua)": "nameUk",
  "назва ua": "nameUk",
  "назва українською": "nameUk",
  "інгредієнт": "nameUk",
  "продукт": "nameUk",
  "name": "nameUk",
  "name (ua)": "nameUk",
  "name uk": "nameUk",
  "nameuk": "nameUk",
  // EN
  "назва (en)": "nameEn",
  "назва en": "nameEn",
  "name (en)": "nameEn",
  "name en": "nameEn",
  "nameen": "nameEn",
  "english": "nameEn",
  // unit
  "од.": "unit",
  "одиниця": "unit",
  "од": "unit",
  "unit": "unit",
  "units": "unit",
  // price
  "ціна": "pricePerUnit",
  "ціна, грн/од.": "pricePerUnit",
  "ціна за одиницю": "pricePerUnit",
  "ціна за од.": "pricePerUnit",
  "price": "pricePerUnit",
  "price per unit": "pricePerUnit",
  "priceperunit": "pricePerUnit",
  // cold waste
  "втрати хол.": "wasteColdPct",
  "втрати холодна": "wasteColdPct",
  "втрати, холодна обробка, %": "wasteColdPct",
  "холодна обробка": "wasteColdPct",
  "waste cold": "wasteColdPct",
  "waste cold pct": "wasteColdPct",
  "wastecoldpct": "wasteColdPct",
  // hot waste
  "втрати теп.": "wasteHotPct",
  "втрати теплова": "wasteHotPct",
  "втрати, теплова обробка, %": "wasteHotPct",
  "теплова обробка": "wasteHotPct",
  "waste hot": "wasteHotPct",
  "waste hot pct": "wasteHotPct",
  "wastehotpct": "wasteHotPct",
  // supplier
  "постачальник": "supplier",
  "supplier": "supplier",
  // notes
  "нотатки": "notes",
  "коментар": "notes",
  "notes": "notes",
  "comment": "notes",
};

const UNIT_ALIASES: Record<string, "kg" | "l" | "pcs"> = {
  kg: "kg",
  кг: "kg",
  кілограм: "kg",
  l: "l",
  л: "l",
  літр: "l",
  pcs: "pcs",
  pc: "pcs",
  шт: "pcs",
  штук: "pcs",
  штука: "pcs",
};

function num(s: string): number {
  if (!s) return 0;
  const cleaned = s.trim().replace(/\s/g, "").replace(",", ".").replace(/[^\d.\-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

export function rowsToIngredients(rows: string[][]): {
  rows: IngredientImportRow[];
  errors: { row: number; error: string }[];
} {
  if (rows.length === 0) return { rows: [], errors: [] };

  const headerCells = rows[0].map((h) => h.trim().toLowerCase());
  const colMap: Partial<Record<keyof IngredientImportRow, number>> = {};
  for (let i = 0; i < headerCells.length; i++) {
    const key = HEADER_ALIASES[headerCells[i]];
    if (key) colMap[key] = i;
  }

  if (colMap.nameUk === undefined) {
    return {
      rows: [],
      errors: [
        {
          row: 1,
          error:
            "Не знайдено колонку «Назва» / nameUk. Перевірте перший рядок: має бути заголовок.",
        },
      ],
    };
  }

  const out: IngredientImportRow[] = [];
  const errors: { row: number; error: string }[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const nameUk = (r[colMap.nameUk!] ?? "").trim();
    if (!nameUk) continue;

    const unitRaw = colMap.unit !== undefined ? (r[colMap.unit] ?? "").trim().toLowerCase() : "kg";
    const unit = UNIT_ALIASES[unitRaw] ?? "kg";

    const pricePerUnit = colMap.pricePerUnit !== undefined ? num(r[colMap.pricePerUnit]) : 0;
    const wasteColdPct = colMap.wasteColdPct !== undefined ? num(r[colMap.wasteColdPct]) : 0;
    const wasteHotPct = colMap.wasteHotPct !== undefined ? num(r[colMap.wasteHotPct]) : 0;

    if (pricePerUnit < 0) {
      errors.push({ row: i + 1, error: `Від'ємна ціна для "${nameUk}"` });
      continue;
    }
    if (wasteColdPct < 0 || wasteColdPct > 100) {
      errors.push({ row: i + 1, error: `Втрати холодні поза 0..100 для "${nameUk}"` });
      continue;
    }
    if (wasteHotPct < 0 || wasteHotPct > 100) {
      errors.push({ row: i + 1, error: `Втрати теплові поза 0..100 для "${nameUk}"` });
      continue;
    }

    out.push({
      nameUk,
      nameEn: colMap.nameEn !== undefined ? (r[colMap.nameEn] ?? "").trim() || null : null,
      unit,
      pricePerUnit,
      wasteColdPct,
      wasteHotPct,
      supplier:
        colMap.supplier !== undefined ? (r[colMap.supplier] ?? "").trim() || null : null,
      notes:
        colMap.notes !== undefined ? (r[colMap.notes] ?? "").trim() || null : null,
    });
  }

  return { rows: out, errors };
}
