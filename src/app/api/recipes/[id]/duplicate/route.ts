import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const orig = await prisma.recipe.findUnique({
    where: { id: params.id },
    include: { items: true, steps: true },
  });
  if (!orig) return NextResponse.json({ error: "not found" }, { status: 404 });

  const copy = await prisma.recipe.create({
    data: {
      nameUk: `${orig.nameUk} (копія)`,
      nameEn: `${orig.nameEn} (copy)`,
      versionCode: orig.versionCode,
      country: orig.country,
      sellingPriceGross: orig.sellingPriceGross,
      sellingPriceNet: orig.sellingPriceNet,
      vatPct: orig.vatPct,
      totalWeightKg: orig.totalWeightKg,
      status: "draft",
      items: {
        create: orig.items.map((it) => ({
          ingredientId: it.ingredientId,
          displayName: it.displayName,
          unit: it.unit,
          grossWeight: it.grossWeight,
          netWeight: it.netWeight,
          pricePerUnitSnapshot: it.pricePerUnitSnapshot,
          vatPctSnapshot: it.vatPctSnapshot,
          sortOrder: it.sortOrder,
        })),
      },
      steps: {
        create: orig.steps.map((s) => ({
          stepNumber: s.stepNumber,
          text: s.text,
          sortOrder: s.sortOrder,
        })),
      },
    },
  });
  return NextResponse.json(copy, { status: 201 });
}
