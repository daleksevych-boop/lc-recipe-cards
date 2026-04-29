import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [recipeCount, ingredientCount, recent] = await Promise.all([
    prisma.recipe.count(),
    prisma.ingredient.count(),
    prisma.recipe.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold">Технологічні картки</h1>
        <p className="mt-2 text-stone-600">
          Створюйте, редагуйте та експортуйте техкартки круасанів за
          стандартом Lviv Croissants. Усі ціни — у грн без ПДВ. Фудкост рахується
          автоматично з довідника інгредієнтів.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Техкартки" value={recipeCount} href="/recipes" />
        <StatCard
          label="Інгредієнти у довіднику"
          value={ingredientCount}
          href="/ingredients"
        />
        <Link
          href="/recipes"
          className="rounded-lg bg-[#7D9622] p-5 text-white shadow-sm transition hover:opacity-90"
        >
          <div className="text-sm opacity-90">Швидка дія</div>
          <div className="mt-1 text-xl font-semibold">
            Створити нову ТК →
          </div>
        </Link>
      </section>

      {recent.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">Останні редаговані</h2>
          <ul className="mt-3 divide-y rounded-lg border bg-white">
            {recent.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/recipes/${r.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-stone-50"
                >
                  <span>
                    <span className="font-medium">{r.nameUk}</span>
                    <span className="ml-2 text-stone-500">{r.nameEn}</span>
                  </span>
                  <span className="text-xs text-stone-500">
                    {new Date(r.updatedAt).toLocaleString("uk-UA")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border bg-white p-5 shadow-sm transition hover:shadow"
    >
      <div className="text-sm text-stone-600">{label}</div>
      <div className="mt-1 text-3xl font-bold">{value}</div>
    </Link>
  );
}
