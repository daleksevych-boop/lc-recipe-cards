import { prisma } from "@/lib/db";
import RecipesClient from "./RecipesClient";

export const dynamic = "force-dynamic";

export default async function RecipesPage() {
  const recipes = await prisma.recipe.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      items: { select: { netWeight: true, pricePerUnitSnapshot: true } },
    },
  });
  const list = recipes.map((r) => {
    const cost = r.items.reduce(
      (acc, it) => acc + it.netWeight * it.pricePerUnitSnapshot,
      0,
    );
    return {
      id: r.id,
      nameUk: r.nameUk,
      nameEn: r.nameEn,
      status: r.status,
      sellingPriceNet: r.sellingPriceNet,
      updatedAt: r.updatedAt.toISOString(),
      cost,
    };
  });
  return <RecipesClient initial={list} />;
}
