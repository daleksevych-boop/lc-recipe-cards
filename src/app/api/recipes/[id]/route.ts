import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const itemSchema = z.object({
  ingredientId: z.string().nullable().optional(),
  displayName: z.string().min(1),
  unit: z.enum(["kg", "l", "pcs"]),
  grossWeight: z.number().nonnegative(),
  netWeight: z.number().nonnegative(),
  pricePerUnitSnapshot: z.number().nonnegative().default(0),
  sortOrder: z.number().int().nonnegative().default(0),
});

const stepSchema = z.object({
  stepNumber: z.number().int().min(1),
  text: z.string().min(1),
  sortOrder: z.number().int().nonnegative().default(0),
});

const updateSchema = z.object({
  nameUk: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  versionCode: z.string().optional(),
  sellingPriceNet: z.number().nullable().optional(),
  totalWeightKg: z.number().nullable().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  authorEmail: z.string().nullable().optional(),
  items: z.array(itemSchema).optional(),
  steps: z.array(stepSchema).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const r = await prisma.recipe.findUnique({
    where: { id: params.id },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      steps: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!r) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(r);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await req.json();
  const parsed = updateSchema.parse(body);
  const { items, steps, ...recipeFields } = parsed;

  const updated = await prisma.$transaction(async (tx) => {
    if (Object.keys(recipeFields).length > 0) {
      await tx.recipe.update({
        where: { id: params.id },
        data: recipeFields,
      });
    }
    if (items) {
      await tx.recipeItem.deleteMany({ where: { recipeId: params.id } });
      if (items.length > 0) {
        await tx.recipeItem.createMany({
          data: items.map((it, idx) => ({
            recipeId: params.id,
            ingredientId: it.ingredientId ?? null,
            displayName: it.displayName,
            unit: it.unit,
            grossWeight: it.grossWeight,
            netWeight: it.netWeight,
            pricePerUnitSnapshot: it.pricePerUnitSnapshot,
            sortOrder: it.sortOrder ?? idx,
          })),
        });
      }
    }
    if (steps) {
      await tx.recipeStep.deleteMany({ where: { recipeId: params.id } });
      if (steps.length > 0) {
        await tx.recipeStep.createMany({
          data: steps.map((s, idx) => ({
            recipeId: params.id,
            stepNumber: s.stepNumber,
            text: s.text,
            sortOrder: s.sortOrder ?? idx,
          })),
        });
      }
    }
    // Snapshot version for history
    const fresh = await tx.recipe.findUnique({
      where: { id: params.id },
      include: { items: true, steps: true },
    });
    await tx.recipeVersion.create({
      data: {
        recipeId: params.id,
        snapshot: JSON.stringify(fresh),
      },
    });
    return fresh;
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  await prisma.recipe.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
