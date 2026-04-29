import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { vatForCountry } from "@/lib/countryVat";

const createSchema = z.object({
  nameUk: z.string().min(1),
  nameEn: z.string().min(1),
  country: z.enum(["NO", "FR"]),
  template: z.enum(["croissant_classic", "croissant_butter"]),
});

// Croissant base options. The base ingredient is the croissant itself,
// added as the first row of the recipe so the user only fills in the toppings.
const CROISSANT_BASES = {
  croissant_classic: {
    nameUk: "Класичний круасан",
    nameEn: "Classic croissant",
    grossWeight: 0.095,
    netWeight: 0.08,
  },
  croissant_butter: {
    nameUk: "Масляний круасан",
    nameEn: "Butter croissant",
    grossWeight: 0.08,
    netWeight: 0.07,
  },
} as const;

export async function GET() {
  const list = await prisma.recipe.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { items: true, steps: true } },
    },
  });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createSchema.parse(body);

  const base = CROISSANT_BASES[parsed.template];
  const vat = vatForCountry(parsed.country);
  const baseItem = {
    displayName: base.nameEn,
    unit: "kg",
    grossWeight: base.grossWeight,
    netWeight: base.netWeight,
    pricePerUnitSnapshot: 0,
    vatPctSnapshot: vat,
    sortOrder: 0,
  };

  const created = await prisma.recipe.create({
    data: {
      nameUk: parsed.nameUk,
      nameEn: parsed.nameEn,
      country: parsed.country,
      vatPct: vat,
      totalWeightKg: null, // computed from items
      items: { create: [baseItem] },
    },
  });
  return NextResponse.json(created, { status: 201 });
}
