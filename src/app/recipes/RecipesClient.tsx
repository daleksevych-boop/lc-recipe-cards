"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type RecipeRow = {
  id: string;
  nameUk: string;
  nameEn: string;
  status: string;
  sellingPriceNet: number | null;
  updatedAt: string;
  cost: number;
};

export default function RecipesClient({ initial }: { initial: RecipeRow[] }) {
  const router = useRouter();
  const [list, setList] = useState(initial);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<{
    nameUk: string;
    nameEn: string;
    template: "blank" | "croissant";
  }>({ nameUk: "", nameEn: "", template: "croissant" });

  async function create() {
    if (!form.nameUk || !form.nameEn) {
      alert("Заповніть обидві назви");
      return;
    }
    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      alert("Помилка");
      return;
    }
    const created = await res.json();
    router.push(`/recipes/${created.id}`);
  }

  async function duplicate(id: string) {
    const res = await fetch(`/api/recipes/${id}/duplicate`, { method: "POST" });
    if (!res.ok) return alert("Помилка");
    const created = await res.json();
    router.push(`/recipes/${created.id}`);
  }

  async function remove(id: string) {
    if (!confirm("Видалити техкартку?")) return;
    const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("Помилка");
    setList((l) => l.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Техкартки</h1>
          <p className="text-sm text-stone-600">
            Усі ваші техкартки. Натисніть на назву для редагування.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="rounded-md bg-[#7D9622] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          + Нова ТК
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-stone-100 text-left text-xs uppercase text-stone-600">
            <tr>
              <th className="px-3 py-2">Назва</th>
              <th className="px-3 py-2">Статус</th>
              <th className="px-3 py-2 text-right">Собівартість, грн</th>
              <th className="px-3 py-2 text-right">Ціна нетто, грн</th>
              <th className="px-3 py-2 text-right">Фудкост, грн</th>
              <th className="px-3 py-2 text-right">Фудкост, %</th>
              <th className="px-3 py-2">Оновлено</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {list.map((r) => {
              const fcUah =
                r.sellingPriceNet != null ? r.sellingPriceNet - r.cost : null;
              const fcPct =
                r.sellingPriceNet != null && r.sellingPriceNet > 0
                  ? (r.cost / r.sellingPriceNet) * 100
                  : null;
              return (
                <tr key={r.id} className="hover:bg-stone-50">
                  <td className="px-3 py-2">
                    <Link
                      href={`/recipes/${r.id}`}
                      className="font-medium text-blue-700 hover:underline"
                    >
                      {r.nameUk}
                    </Link>
                    <div className="text-xs text-stone-500">{r.nameEn}</div>
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-3 py-2 text-right">{r.cost.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right">
                    {r.sellingPriceNet != null
                      ? r.sellingPriceNet.toFixed(2)
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {fcUah != null ? fcUah.toFixed(2) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {fcPct != null ? `${fcPct.toFixed(1)}%` : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-stone-500">
                    {new Date(r.updatedAt).toLocaleString("uk-UA")}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <a
                      href={`/api/recipes/${r.id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="mr-2 text-stone-700 hover:underline"
                    >
                      PDF
                    </a>
                    <button
                      onClick={() => duplicate(r.id)}
                      className="mr-2 text-stone-700 hover:underline"
                    >
                      копія
                    </button>
                    <button
                      onClick={() => remove(r.id)}
                      className="text-red-600 hover:underline"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-stone-500">
                  Ще немає жодної ТК.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {creating && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setCreating(false)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">Нова техкартка</h2>
            <div className="mt-3 space-y-2">
              <label className="block text-sm">
                Назва (UA)
                <input
                  className="mt-1 w-full rounded border px-3 py-2 text-sm"
                  value={form.nameUk}
                  onChange={(e) => setForm({ ...form, nameUk: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                Назва (EN, для PDF)
                <input
                  className="mt-1 w-full rounded border px-3 py-2 text-sm"
                  value={form.nameEn}
                  onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                />
              </label>
              <fieldset className="mt-3 rounded-md border border-stone-200 p-2 text-sm">
                <legend className="px-1 text-xs text-stone-600">Шаблон</legend>
                <label className="flex items-center gap-2 py-1">
                  <input
                    type="radio"
                    checked={form.template === "croissant"}
                    onChange={() => setForm({ ...form, template: "croissant" })}
                  />
                  Круасан (стандарт 95г брутто / 80г нетто)
                </label>
                <label className="flex items-center gap-2 py-1">
                  <input
                    type="radio"
                    checked={form.template === "blank"}
                    onChange={() => setForm({ ...form, template: "blank" })}
                  />
                  Порожній
                </label>
              </fieldset>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-md border px-4 py-2 text-sm"
                onClick={() => setCreating(false)}
              >
                Скасувати
              </button>
              <button
                className="rounded-md bg-[#7D9622] px-4 py-2 text-sm font-semibold text-white"
                onClick={create}
              >
                Створити та редагувати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    draft: { label: "чернетка", cls: "bg-stone-200 text-stone-700" },
    published: { label: "опублік.", cls: "bg-green-100 text-green-800" },
    archived: { label: "архів", cls: "bg-amber-100 text-amber-800" },
  };
  const m = map[status] ?? { label: status, cls: "bg-stone-100" };
  return (
    <span className={`rounded px-2 py-0.5 text-xs ${m.cls}`}>{m.label}</span>
  );
}
