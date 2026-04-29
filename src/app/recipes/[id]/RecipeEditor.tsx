"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type Unit = "kg" | "l" | "pcs";

type Ingredient = {
  id: string;
  nameUk: string;
  nameEn: string | null;
  unit: string;
  pricePerUnit: number;
  wasteColdPct: number;
  wasteHotPct: number;
};

type Item = {
  id?: string;
  ingredientId: string | null;
  displayName: string;
  unit: Unit;
  grossWeight: number;
  netWeight: number;
  pricePerUnitSnapshot: number;
  vatPctSnapshot: number;
  sortOrder: number;
};

type Step = {
  id?: string;
  stepNumber: number;
  text: string;
  sortOrder: number;
};

type Recipe = {
  id: string;
  nameUk: string;
  nameEn: string;
  versionCode: string;
  country: string | null;
  sellingPriceGross: number | null;
  sellingPriceNet: number | null;
  vatPct: number;
  totalWeightKg: number | null;
  status: string;
  items: Item[];
  steps: Step[];
};

export default function RecipeEditor({
  recipe: initialRecipe,
  ingredients,
}: {
  recipe: Recipe;
  ingredients: Ingredient[];
}) {
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe>(initialRecipe);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const debouncedSave = useRef<ReturnType<typeof setTimeout> | null>(null);

  const vatRate = recipe.vatPct ?? 20;
  const sellingPriceNet =
    recipe.sellingPriceGross != null
      ? recipe.sellingPriceGross / (1 + vatRate / 100)
      : null;

  const cost = useMemo(
    () =>
      recipe.items.reduce(
        (acc, it) => acc + (it.netWeight || 0) * (it.pricePerUnitSnapshot || 0),
        0,
      ),
    [recipe.items],
  );
  const costGross = useMemo(
    () =>
      recipe.items.reduce(
        (acc, it) =>
          acc +
          (it.netWeight || 0) *
            (it.pricePerUnitSnapshot || 0) *
            (1 + (it.vatPctSnapshot ?? vatRate) / 100),
        0,
      ),
    [recipe.items, vatRate],
  );

  const foodcostUah =
    sellingPriceNet != null ? sellingPriceNet - cost : null;
  const foodcostPct =
    sellingPriceNet != null && sellingPriceNet > 0
      ? (cost / sellingPriceNet) * 100
      : null;

  const totalNetKg = useMemo(
    () =>
      recipe.items
        .filter((i) => i.unit === "kg" || i.unit === "l")
        .reduce((a, b) => a + (b.netWeight || 0), 0),
    [recipe.items],
  );

  // Auto-save with debounce
  useEffect(() => {
    if (debouncedSave.current) clearTimeout(debouncedSave.current);
    debouncedSave.current = setTimeout(() => save(), 800);
    return () => {
      if (debouncedSave.current) clearTimeout(debouncedSave.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe]);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/recipes/${recipe.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameUk: recipe.nameUk,
          nameEn: recipe.nameEn,
          versionCode: recipe.versionCode,
          country: recipe.country,
          sellingPriceGross: recipe.sellingPriceGross,
          vatPct: recipe.vatPct,
          totalWeightKg: null, // computed from items
          status: recipe.status,
          items: recipe.items.map((it, idx) => ({
            ingredientId: it.ingredientId,
            displayName: it.displayName,
            unit: it.unit,
            grossWeight: it.grossWeight,
            netWeight: it.netWeight,
            pricePerUnitSnapshot: it.pricePerUnitSnapshot,
            vatPctSnapshot: it.vatPctSnapshot ?? vatRate,
            sortOrder: idx,
          })),
          steps: recipe.steps.map((s, idx) => ({
            stepNumber: idx + 1,
            text: s.text,
            sortOrder: idx,
          })),
        }),
      });
      if (!res.ok) throw new Error("save failed");
      setSavedAt(new Date().toLocaleTimeString("uk-UA"));
      setPreviewKey((k) => k + 1); // refresh iframe
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  function addItem(ing?: Ingredient) {
    const item: Item = {
      ingredientId: ing?.id ?? null,
      displayName: ing?.nameEn || ing?.nameUk || "",
      unit: (ing?.unit as Unit) ?? "kg",
      grossWeight: 0,
      netWeight: 0,
      pricePerUnitSnapshot: ing?.pricePerUnit ?? 0,
      vatPctSnapshot: vatRate,
      sortOrder: recipe.items.length,
    };
    setRecipe({ ...recipe, items: [...recipe.items, item] });
  }

  function updateItem(idx: number, patch: Partial<Item>) {
    const next = [...recipe.items];
    next[idx] = { ...next[idx], ...patch };
    setRecipe({ ...recipe, items: next });
  }

  function removeItem(idx: number) {
    setRecipe({
      ...recipe,
      items: recipe.items.filter((_, i) => i !== idx),
    });
  }

  function moveItem(idx: number, dir: -1 | 1) {
    const next = [...recipe.items];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setRecipe({ ...recipe, items: next });
  }

  function addStep() {
    setRecipe({
      ...recipe,
      steps: [
        ...recipe.steps,
        {
          stepNumber: recipe.steps.length + 1,
          text: "",
          sortOrder: recipe.steps.length,
        },
      ],
    });
  }

  function updateStep(idx: number, text: string) {
    const next = [...recipe.steps];
    next[idx] = { ...next[idx], text };
    setRecipe({ ...recipe, steps: next });
  }

  function removeStep(idx: number) {
    setRecipe({
      ...recipe,
      steps: recipe.steps
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, stepNumber: i + 1 })),
    });
  }

  function moveStep(idx: number, dir: -1 | 1) {
    const next = [...recipe.steps];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setRecipe({
      ...recipe,
      steps: next.map((s, i) => ({ ...s, stepNumber: i + 1 })),
    });
  }

  // Recompute gross from net + waste% when an ingredient is linked
  function autoGross(idx: number) {
    const it = recipe.items[idx];
    if (!it.ingredientId) return;
    const ing = ingredients.find((g) => g.id === it.ingredientId);
    if (!ing) return;
    const waste = (ing.wasteColdPct + ing.wasteHotPct) / 100;
    const gross = waste >= 1 ? it.netWeight : it.netWeight / (1 - waste);
    updateItem(idx, { grossWeight: round(gross, 4) });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/recipes" className="text-sm text-stone-500 hover:underline">
            ← всі ТК
          </Link>
          <h1 className="text-2xl font-bold">
            {recipe.nameUk || "(без назви)"}
          </h1>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-stone-500">
            {saving
              ? "збереження…"
              : savedAt
                ? `збережено о ${savedAt}`
                : "автозбереження активне"}
          </span>
          <a
            href={`/api/recipes/${recipe.id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-stone-800 px-3 py-1.5 text-white hover:opacity-90"
          >
            Завантажити PDF
          </a>
          <button
            onClick={() => router.push("/recipes")}
            className="rounded-md border px-3 py-1.5"
          >
            Готово
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* LEFT: form */}
        <div className="space-y-4">
          <Section title="Основне">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Назва (UA)">
                <input
                  className="input"
                  value={recipe.nameUk}
                  onChange={(e) =>
                    setRecipe({ ...recipe, nameUk: e.target.value })
                  }
                />
              </Field>
              <Field label="Назва (EN, для PDF)">
                <input
                  className="input"
                  value={recipe.nameEn}
                  onChange={(e) =>
                    setRecipe({ ...recipe, nameEn: e.target.value })
                  }
                />
              </Field>
              <Field label="Версія (футер)">
                <input
                  className="input"
                  value={recipe.versionCode}
                  onChange={(e) =>
                    setRecipe({ ...recipe, versionCode: e.target.value })
                  }
                />
              </Field>
              <Field label="Статус">
                <select
                  className="input"
                  value={recipe.status}
                  onChange={(e) =>
                    setRecipe({ ...recipe, status: e.target.value })
                  }
                >
                  <option value="draft">чернетка</option>
                  <option value="published">опублікована</option>
                  <option value="archived">архів</option>
                </select>
              </Field>
              <Field label="Країна">
                <select
                  className="input"
                  value={recipe.country ?? "NO"}
                  onChange={(e) => {
                    const c = e.target.value as "NO" | "FR";
                    const newVat = c === "NO" ? 25 : 20;
                    setRecipe({
                      ...recipe,
                      country: c,
                      vatPct: newVat,
                      items: recipe.items.map((it) => ({
                        ...it,
                        vatPctSnapshot: newVat,
                      })),
                    });
                  }}
                >
                  <option value="NO">Norway (ПДВ 25%)</option>
                  <option value="FR">France (ПДВ 20%)</option>
                </select>
              </Field>
              <Field label={`Total weight, кг (авто з нетто)`}>
                <input
                  type="text"
                  className="input bg-stone-100"
                  value={totalNetKg.toFixed(3)}
                  readOnly
                />
              </Field>
              <Field label={`Ціна брутто (грн, з ПДВ ${vatRate}%)`}>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={recipe.sellingPriceGross ?? ""}
                  onChange={(e) =>
                    setRecipe({
                      ...recipe,
                      sellingPriceGross:
                        e.target.value === ""
                          ? null
                          : parseFloat(e.target.value),
                    })
                  }
                />
              </Field>
              <Field label={`Ціна нетто (авто, без ПДВ)`}>
                <input
                  type="text"
                  className="input bg-stone-100"
                  value={
                    sellingPriceNet != null
                      ? sellingPriceNet.toFixed(2)
                      : ""
                  }
                  readOnly
                />
              </Field>
            </div>
          </Section>

          <Section title="Калькулятор фудкосту">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Stat
                label="Собівартість нетто"
                value={`${cost.toFixed(2)} грн`}
              />
              <Stat
                label={`Собівартість брутто (з ПДВ ${vatRate}%)`}
                value={`${costGross.toFixed(2)} грн`}
              />
              <Stat
                label="Ціна нетто"
                value={
                  sellingPriceNet != null
                    ? `${sellingPriceNet.toFixed(2)} грн`
                    : "—"
                }
              />
              <Stat
                label="Ціна брутто"
                value={
                  recipe.sellingPriceGross != null
                    ? `${recipe.sellingPriceGross.toFixed(2)} грн`
                    : "—"
                }
              />
              <Stat
                label="Фудкост (грн)"
                value={
                  foodcostUah != null ? `${foodcostUah.toFixed(2)} грн` : "—"
                }
                accent={foodcostUah != null && foodcostUah < 0}
              />
              <Stat
                label="Фудкост (%)"
                value={foodcostPct != null ? `${foodcostPct.toFixed(1)}%` : "—"}
                accent={foodcostPct != null && foodcostPct > 35}
              />
            </div>
            <p className="mt-2 text-xs text-stone-500">
              Фудкост (%) = собівартість нетто / ціна нетто × 100%.
              Підсвічується червоним при &gt; 35%.
            </p>
          </Section>

          <Section title="Склад">
            <ItemTable
              items={recipe.items}
              ingredients={ingredients}
              onUpdate={updateItem}
              onRemove={removeItem}
              onMove={moveItem}
              onAutoGross={autoGross}
            />
            <AddItem ingredients={ingredients} onAdd={addItem} />
          </Section>

          <Section title="Технологія приготування">
            {recipe.steps.length === 0 && (
              <p className="text-sm text-stone-500">
                Поки немає кроків. Додайте перший.
              </p>
            )}
            <ol className="space-y-2">
              {recipe.steps.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-2 w-6 text-right text-sm text-stone-500">
                    {idx + 1}.
                  </span>
                  <textarea
                    className="input flex-1"
                    rows={2}
                    value={s.text}
                    onChange={(e) => updateStep(idx, e.target.value)}
                  />
                  <div className="mt-1 flex flex-col gap-1 text-xs">
                    <button onClick={() => moveStep(idx, -1)}>↑</button>
                    <button onClick={() => moveStep(idx, 1)}>↓</button>
                    <button
                      onClick={() => removeStep(idx)}
                      className="text-red-600"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ol>
            <button
              onClick={addStep}
              className="mt-3 rounded-md border px-3 py-1.5 text-sm"
            >
              + Додати крок
            </button>
          </Section>
        </div>

        {/* RIGHT: live preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Прев&apos;ю PDF</span>
            <span className="text-stone-500">
              оновлюється після автозбереження
            </span>
          </div>
          <div className="aspect-[210/297] overflow-hidden rounded border bg-white shadow">
            <iframe
              key={previewKey}
              src={`/print/${recipe.id}`}
              className="h-full w-full"
              style={{ border: 0 }}
            />
          </div>
        </div>
      </div>

      <style>{`
        .input { width: 100%; border: 1px solid #e7e5e4; border-radius: 6px; padding: 6px 8px; background: #fff; font-size: 13px; }
        .input:focus { outline: none; border-color: #7D9622; box-shadow: 0 0 0 2px rgba(125,150,34,0.2); }
      `}</style>
    </div>
  );
}

function round(n: number, d: number) {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border bg-white p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-700">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
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

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-stone-500">{label}</div>
      <div
        className={`mt-1 text-lg font-bold ${accent ? "text-red-600" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

function ItemTable({
  items,
  ingredients,
  onUpdate,
  onRemove,
  onMove,
  onAutoGross,
}: {
  items: Item[];
  ingredients: Ingredient[];
  onUpdate: (idx: number, patch: Partial<Item>) => void;
  onRemove: (idx: number) => void;
  onMove: (idx: number, dir: -1 | 1) => void;
  onAutoGross: (idx: number) => void;
}) {
  if (items.length === 0)
    return <p className="text-sm text-stone-500">Поки немає інгредієнтів.</p>;
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs uppercase text-stone-600">
        <tr>
          <th className="py-1">Назва (для PDF)</th>
          <th className="py-1">Од.</th>
          <th className="py-1 text-right">Брутто</th>
          <th className="py-1 text-right">Нетто</th>
          <th className="py-1 text-right">Ціна, грн</th>
          <th className="py-1"></th>
        </tr>
      </thead>
      <tbody>
        {items.map((it, idx) => {
          const sum = (it.netWeight || 0) * (it.pricePerUnitSnapshot || 0);
          return (
            <tr key={idx} className="border-t align-top">
              <td className="py-1.5">
                <input
                  className="input"
                  value={it.displayName}
                  onChange={(e) =>
                    onUpdate(idx, { displayName: e.target.value })
                  }
                />
                {it.ingredientId && (
                  <select
                    className="input mt-1 text-xs"
                    value={it.ingredientId ?? ""}
                    onChange={(e) => {
                      const ing = ingredients.find(
                        (g) => g.id === e.target.value,
                      );
                      onUpdate(idx, {
                        ingredientId: e.target.value || null,
                        unit: (ing?.unit as Unit) ?? it.unit,
                        pricePerUnitSnapshot: ing?.pricePerUnit ?? 0,
                        // Auto-translate: when ingredient is changed, keep
                        // displayName in sync with the EN name from the
                        // ingredient master.
                        displayName: ing?.nameEn || ing?.nameUk || "",
                      });
                    }}
                  >
                    {ingredients.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nameUk}
                      </option>
                    ))}
                  </select>
                )}
              </td>
              <td className="py-1.5">
                <select
                  className="input"
                  value={it.unit}
                  onChange={(e) =>
                    onUpdate(idx, { unit: e.target.value as Unit })
                  }
                >
                  <option value="kg">kg</option>
                  <option value="l">l</option>
                  <option value="pcs">pcs</option>
                </select>
              </td>
              <td className="py-1.5 text-right">
                <input
                  type="number"
                  step="0.001"
                  className="input text-right"
                  value={it.grossWeight}
                  onChange={(e) =>
                    onUpdate(idx, {
                      grossWeight: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </td>
              <td className="py-1.5 text-right">
                <input
                  type="number"
                  step="0.001"
                  className="input text-right"
                  value={it.netWeight}
                  onChange={(e) =>
                    onUpdate(idx, {
                      netWeight: parseFloat(e.target.value) || 0,
                    })
                  }
                  onBlur={() => onAutoGross(idx)}
                />
              </td>
              <td className="py-1.5 text-right text-stone-700 font-medium">
                {sum.toFixed(2)}
              </td>
              <td className="py-1.5 text-right text-xs">
                <div className="flex flex-col items-end gap-0.5">
                  <button onClick={() => onMove(idx, -1)}>↑</button>
                  <button onClick={() => onMove(idx, 1)}>↓</button>
                  <button
                    onClick={() => onRemove(idx)}
                    className="text-red-600"
                  >
                    ×
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function AddItem({
  ingredients,
  onAdd,
}: {
  ingredients: Ingredient[];
  onAdd: (ing?: Ingredient) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = ingredients.filter((i) => {
    const q = search.toLowerCase();
    return (
      i.nameUk.toLowerCase().includes(q) ||
      (i.nameEn ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="mt-3 flex items-center gap-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-md bg-[#7D9622] px-3 py-1.5 text-sm font-semibold text-white"
      >
        + Додати з довідника
      </button>
      <button
        onClick={() => onAdd(undefined)}
        className="rounded-md border px-3 py-1.5 text-sm"
      >
        + Свій рядок
      </button>
      {open && (
        <div className="absolute z-10 mt-2 w-80 rounded-md border bg-white p-2 shadow-lg">
          <input
            className="w-full rounded border px-2 py-1 text-sm"
            placeholder="пошук…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="mt-2 max-h-60 overflow-auto">
            {filtered.map((i) => (
              <button
                key={i.id}
                onClick={() => {
                  onAdd(i);
                  setOpen(false);
                  setSearch("");
                }}
                className="block w-full rounded px-2 py-1 text-left text-sm hover:bg-stone-100"
              >
                <div>{i.nameUk}</div>
                <div className="text-xs text-stone-400">
                  {i.pricePerUnit.toFixed(2)} грн/{i.unit}
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="p-2 text-xs text-stone-500">
                Нічого не знайдено
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
