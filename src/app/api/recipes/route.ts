import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  nameUk: z.string().min(1),
  nameEn: z.string().min(1),
  template: z.enum(["blank", "croissant"]).optional().default("blank"),
});

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

  // Croissant template: standard 95g gross / 80g net base item.
  const isCroissant = parsed.template === "croissant";
  const baseItem = isCroissant
    ? {
        displayName: "Croissant",
        unit: "kg",
        grossWeight: 0.095,
        netWeight: 0.08,
        pricePerUnitSnapshot: 0,
        sortOrder: 0,
      }
    : null;

  const created = await prisma.recipe.create({
    data: {
      nameUk: parsed.nameUk,
      nameEn: parsed.nameEn,
      totalWeightKg: isCroissant ? 0.08 : null,
      ...(baseItem ? { items: { create: [baseItem] } } : {}),
    },
  });
  return NextResponse.json(created, { status: 201 });
}
