"use client";

import { useMemo, useState } from "react";
import { parseDelimited, rowsToIngredients } from "@/lib/csv";

type Ingredient = {
  id: string;
  nameUk: string;
  nameEn: string | null;
  unit: string;
  pricePerUnit: number;
  wasteColdPct: number;
  wasteHotPct: number;
  supplier: string | null;
  notes: string | null;
};

const BLANK: Omit<Ingredient, "id"> = {
  nameUk: "",
  nameEn: "",
  unit: "kg",
  pricePerUnit: 0,
  wasteColdPct: 0,
  wasteHotPct: 0,
  supplier: "",
  notes: "",
};

export default function IngredientsClient({
  initialIngredients,
}: {
  initialIngredients: Ingredient[];
}) {
  const [list, setList] = useState<Ingredient[]>(initialIngredients);
  const [editing, setEditing] = useState<
    | { mode: "create"; data: Omit<Ingredient, "id"> }
    | { mode: "edit"; data: Ingredient }
    | null
  >(null);
  const [filter, setFilter] = useState("");
  const [importOpen, setImportOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (i) =>
        i.nameUk.toLowerCase().includes(q) ||
        (i.nameEn ?? "").toLowerCase().includes(q),
    );
  }, [list, filter]);

  async function save() {
    if (!editing) return;
    const data = editing.data;
    if (editing.mode === "create") {
      const res = await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        alert("Помилка створення");
        return;
      }
      const created: Ingredient = await res.json();
      setList((l) => [...l, created].sort((a, b) => a.nameUk.localeCompare(b.nameUk)));
    } else {
      const res = await fetch(`/api/ingredients/${editing.data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        alert("Помилка оновлення");
        return;
      }
      const updated: Ingredient = await res.json();
      setList((l) =>
        l
          .map((i) => (i.id === updated.id ? updated : i))
          .sort((a, b) => a.nameUk.localeCompare(b.nameUk)),
      );
    }
    setEditing(null);
  }

  async function remove(id: string) {
    if (!confirm("Видалити інгредієнт?")) return;
    const res = await fetch(`/api/ingredients/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Не вдалось видалити (можливо, використовується в рецепті)");
      return;
    }
    setList((l) => l.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Довідник інгредієнтів</h1>
          <p className="text-sm text-stone-600">
            Назва, одиниця, ціна за од. (грн), % втрат при холодній і тепловій
            обробці. Ціна використовується для розрахунку фудкосту.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setImportOpen(true)}
            className="rounded-md border border-stone-300 px-4 py-2 text-sm font-semibold hover:bg-stone-50"
          >
            ⬆ Імпорт CSV
          </button>
          <button
            onClick={() => setEditing({ mode: "create", data: { ...BLANK } })}
            className="rounded-md bg-[#7D9622] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            + Додати інгредієнт
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Пошук за назвою…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full rounded-md border bg-white px-3 py-2 text-sm"
      />

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-stone-100 text-left text-xs uppercase text-stone-600">
            <tr>
              <th className="px-3 py-2">Назва (UA)</th>
              <th className="px-3 py-2">EN</th>
              <th className="px-3 py-2">Од.</th>
              <th className="px-3 py-2 text-right">Ціна, грн/од.</th>
              <th className="px-3 py-2 text-right">Втрати хол. %</th>
              <th className="px-3 py-2 text-right">Втрати теп. %</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((i) => (
              <tr key={i.id} className="hover:bg-stone-50">
                <td className="px-3 py-2 font-medium">{i.nameUk}</td>
                <td className="px-3 py-2 text-stone-500">{i.nameEn}</td>
                <td className="px-3 py-2">{i.unit}</td>
                <td className="px-3 py-2 text-right">
                  {i.pricePerUnit.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right">{i.wasteColdPct}</td>
                <td className="px-3 py-2 text-right">{i.wasteHotPct}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() =>
                      setEditing({ mode: "edit", data: { ...i } })
                    }
                    className="mr-2 text-blue-600 hover:underline"
                  >
                    редагувати
                  </button>
                  <button
                    onClick={() => remove(i.id)}
                    className="text-red-600 hover:underline"
                  >
                    видалити
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-stone-500">
                  Нічого не знайдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {importOpen && (
        <ImportModal
          onClose={() => setImportOpen(false)}
          onImported={(refreshed) => {
            setList(refreshed);
            setImportOpen(false);
          }}
        />
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <h2 className="text-lg font-semibold">
            {editing.mode === "create"
              ? "Новий інгредієнт"
              : `Редагування: ${editing.data.nameUk || "—"}`}
          </h2>
          <Form
            data={editing.data}
            onChange={(d) => setEditing({ ...editing, data: d } as never)}
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setEditing(null)}
              className="rounded-md border px-4 py-2 text-sm"
            >
              Скасувати
            </button>
            <button
              onClick={save}
              className="rounded-md bg-[#7D9622] px-4 py-2 text-sm font-semibold text-white"
            >
              Зберегти
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Form({
  data,
  onChange,
}: {
  data: Omit<Ingredient, "id"> | Ingredient;
  onChange: (d: Omit<Ingredient, "id"> | Ingredient) => void;
}) {
  const set = <K extends keyof typeof data>(k: K, v: (typeof data)[K]) =>
    onChange({ ...data, [k]: v });

  return (
    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
      <Field label="Назва (UA) *">
        <input
          className="input"
          value={data.nameUk}
          onChange={(e) => set("nameUk", e.target.value)}
        />
      </Field>
      <Field label="Назва (EN)">
        <input
          className="input"
          value={data.nameEn ?? ""}
          onChange={(e) => set("nameEn", e.target.value)}
        />
      </Field>
      <Field label="Одиниця *">
        <select
          className="input"
          value={data.unit}
          onChange={(e) => set("unit", e.target.value as never)}
        >
          <option value="kg">кг (kg)</option>
          <option value="l">л (l)</option>
          <option value="pcs">шт (pcs)</option>
        </select>
      </Field>
      <Field label="Ціна, грн / од. *">
        <input
          type="number"
          step="0.01"
          className="input"
          value={data.pricePerUnit}
          onChange={(e) => set("pricePerUnit", parseFloat(e.target.value) || 0)}
        />
      </Field>
      <Field label="Втрати, холодна обробка, %">
        <input
          type="number"
          step="0.1"
          className="input"
          value={data.wasteColdPct}
          onChange={(e) => set("wasteColdPct", parseFloat(e.target.value) || 0)}
        />
      </Field>
      <Field label="Втрати, теплова обробка, %">
        <input
          type="number"
          step="0.1"
          className="input"
          value={data.wasteHotPct}
          onChange={(e) => set("wasteHotPct", parseFloat(e.target.value) || 0)}
        />
      </Field>
      <Field label="Постачальник">
        <input
          className="input"
          value={data.supplier ?? ""}
          onChange={(e) => set("supplier", e.target.value)}
        />
      </Field>
      <Field label="Нотатки">
        <input
          className="input"
          value={data.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
        />
      </Field>
      <style>{`
        .input { width: 100%; border: 1px solid #e7e5e4; border-radius: 6px; padding: 6px 8px; background: #fff; }
        .input:focus { outline: none; border-color: #7D9622; box-shadow: 0 0 0 2px rgba(125,150,34,0.2); }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs text-stone-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function ImportModal({
  onClose,
  onImported,
}: {
  onClose: () => void;
  onImported: (list: Ingredient[]) => void;
}) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"upsert" | "append">("upsert");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<
    | null
    | {
        created: number;
        updated: number;
        errors: { row: number; error: string }[];
      }
  >(null);

  const preview = useMemo(() => {
    if (!text.trim()) return null;
    const rows = parseDelimited(text);
    return rowsToIngredients(rows);
  }, [text]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const t = await f.text();
    setText(t);
  }

  async function doImport() {
    if (!preview || preview.rows.length === 0) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/ingredients/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: preview.rows, mode }),
      });
      if (!res.ok) {
        const err = await res.text();
        alert("Помилка імпорту: " + err);
        return;
      }
      const data = (await res.json()) as {
        created: number;
        updated: number;
        errors: { row: number; error: string }[];
      };
      setResult(data);

      const refreshed = await fetch("/api/ingredients").then((r) => r.json());
      onImported(refreshed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="text-lg font-semibold">Імпорт інгредієнтів</h2>
      <p className="mt-1 text-sm text-stone-600">
        Вставте таблицю з Google Sheets / Excel (Ctrl+C → Ctrl+V) або завантажте
        CSV-файл. Перший рядок — заголовки.
      </p>
      <details className="mt-2 text-xs text-stone-600">
        <summary className="cursor-pointer">
          Підтримувані заголовки колонок
        </summary>
        <div className="mt-1 rounded bg-stone-50 p-2 font-mono">
          Назва (UA, обов&apos;язкова), Назва (EN), Од., Ціна, Втрати хол. %,
          Втрати теп. %, Постачальник, Нотатки
          <br />
          Англ. синоніми: nameUk, nameEn, unit, pricePerUnit, wasteColdPct,
          wasteHotPct, supplier, notes
          <br />
          Од.: kg / l / pcs (або кг / л / шт)
        </div>
      </details>

      <div className="mt-3 flex items-center gap-3">
        <label className="rounded-md border border-stone-300 px-3 py-1.5 text-xs cursor-pointer hover:bg-stone-50">
          Вибрати .csv файл
          <input
            type="file"
            accept=".csv,.tsv,.txt,text/csv"
            onChange={onFile}
            className="hidden"
          />
        </label>
        <span className="text-xs text-stone-500">
          або вставте текст у поле нижче
        </span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder={
          "Назва (UA)\tОд.\tЦіна\tВтрати хол. %\nКруасан класичний\tшт\t12.5\t0\nСир крем\tкг\t180\t2"
        }
        className="mt-3 w-full rounded-md border bg-white p-2 font-mono text-xs"
      />

      {preview && (
        <div className="mt-3 rounded border bg-stone-50 p-2 text-xs">
          <div>
            Розпізнано рядків: <b>{preview.rows.length}</b>
            {preview.errors.length > 0 && (
              <span className="ml-2 text-red-600">
                Помилок: {preview.errors.length}
              </span>
            )}
          </div>
          {preview.errors.length > 0 && (
            <ul className="ml-4 mt-1 list-disc text-red-700">
              {preview.errors.slice(0, 10).map((e, i) => (
                <li key={i}>
                  рядок {e.row}: {e.error}
                </li>
              ))}
            </ul>
          )}
          {preview.rows.length > 0 && (
            <div className="mt-2 max-h-40 overflow-auto">
              <table className="w-full">
                <thead className="text-stone-500">
                  <tr>
                    <th className="text-left">Назва</th>
                    <th className="text-left">EN</th>
                    <th>Од.</th>
                    <th className="text-right">Ціна</th>
                    <th className="text-right">Хол.%</th>
                    <th className="text-right">Теп.%</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.slice(0, 30).map((r, i) => (
                    <tr key={i} className="border-t">
                      <td>{r.nameUk}</td>
                      <td className="text-stone-500">{r.nameEn}</td>
                      <td className="text-center">{r.unit}</td>
                      <td className="text-right">{r.pricePerUnit}</td>
                      <td className="text-right">{r.wasteColdPct}</td>
                      <td className="text-right">{r.wasteHotPct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.rows.length > 30 && (
                <div className="mt-1 text-stone-500">
                  … і ще {preview.rows.length - 30}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-3 text-xs">
        <label className="mr-3">
          <input
            type="radio"
            checked={mode === "upsert"}
            onChange={() => setMode("upsert")}
          />{" "}
          Оновити за назвою (рекомендовано)
        </label>
        <label>
          <input
            type="radio"
            checked={mode === "append"}
            onChange={() => setMode("append")}
          />{" "}
          Тільки додавати нові
        </label>
      </div>

      {result && (
        <div className="mt-2 rounded border bg-green-50 p-2 text-xs text-green-800">
          Готово: створено {result.created}, оновлено {result.updated}
          {result.errors.length > 0 && (
            <span className="ml-2 text-red-700">
              , помилок: {result.errors.length}
            </span>
          )}
        </div>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Закрити
        </button>
        <button
          disabled={busy || !preview || preview.rows.length === 0}
          onClick={doImport}
          className="rounded-md bg-[#7D9622] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Імпорт…" : `Імпортувати ${preview?.rows.length ?? 0}`}
        </button>
      </div>
    </Modal>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
