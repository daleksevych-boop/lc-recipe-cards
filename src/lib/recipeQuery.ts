import { prisma } from "./db";
import type { RecipeView, Unit } from "./types";

export async function getRecipeView(id: string): Promise<RecipeView | null> {
  const r = await prisma.recipe.findUnique({
    where: { id },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      steps: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!r) return null;
  return {
    nameUk: r.nameUk,
    nameEn: r.nameEn,
    versionCode: r.versionCode,
    country: r.country,
    sellingPriceGross: r.sellingPriceGross,
    sellingPriceNet: r.sellingPriceNet,
    vatPct: r.vatPct,
    totalWeightKg: r.totalWeightKg,
    items: r.items.map((it) => ({
      displayName: it.displayName,
      unit: it.unit as Unit,
      grossWeight: it.grossWeight,
      netWeight: it.netWeight,
      pricePerUnitSnapshot: it.pricePerUnitSnapshot,
      vatPctSnapshot: it.vatPctSnapshot,
    })),
    steps: r.steps.map((s) => ({ stepNumber: s.stepNumber, text: s.text })),
  };
}
