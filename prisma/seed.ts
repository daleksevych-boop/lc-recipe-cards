import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Wipe and re-seed for predictable preview
  await prisma.recipeStep.deleteMany();
  await prisma.recipeItem.deleteMany();
  await prisma.recipeVersion.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.ingredient.deleteMany();

  const ing = await prisma.ingredient.createManyAndReturn
    ? null
    : null;

  // Approximate ingredient prices (UAH per kg / per pcs) — used for foodcost
  // demo purposes. User will edit these in the app.
  const ingredients = [
    { nameUk: "Круасан", nameEn: "Croissant", unit: "pcs", pricePerUnit: 12 },
    { nameUk: "Крем-сир", nameEn: "Cream Cheese", unit: "kg", pricePerUnit: 280 },
    { nameUk: "Лолло Біонда", nameEn: "Lollo Bionda Lettuce", unit: "kg", pricePerUnit: 180, wasteColdPct: 25 },
    { nameUk: "Оселедець", nameEn: "Herring", unit: "kg", pricePerUnit: 320, wasteColdPct: 3 },
    { nameUk: "Яйце варене", nameEn: "Boiled Eggs", unit: "pcs", pricePerUnit: 6 },
    { nameUk: "Огірок мариновий", nameEn: "Pickled Cucumber", unit: "kg", pricePerUnit: 90, wasteColdPct: 10 },
    { nameUk: "Маринована цибуля (н/ф)", nameEn: "(SF) Marinated onion", unit: "kg", pricePerUnit: 120, wasteColdPct: 12 },
    { nameUk: "Зелена цибуля", nameEn: "Green Onion", unit: "kg", pricePerUnit: 220, wasteColdPct: 25 },
    { nameUk: "Кріп", nameEn: "Dill", unit: "kg", pricePerUnit: 250, wasteColdPct: 50 },
    { nameUk: "Одноразова упаковка", nameEn: "Disposable packaging", unit: "pcs", pricePerUnit: 4 },
    { nameUk: "Серветка", nameEn: "Napkin", unit: "pcs", pricePerUnit: 0.5 },
  ];

  const created = [] as { id: string; nameEn: string }[];
  for (const i of ingredients) {
    const r = await prisma.ingredient.create({ data: i });
    created.push({ id: r.id, nameEn: r.nameEn ?? r.nameUk });
  }
  const byName = new Map(created.map((c) => [c.nameEn, c.id]));

  const recipe = await prisma.recipe.create({
    data: {
      nameUk: "Оселедець",
      nameEn: "Herring",
      versionCode: "NO | 03.26",
      sellingPriceNet: 95,
      status: "published",
      totalWeightKg: 0.264,
    },
  });

  // Items in PDF row order
  type Row = { en: string; unit: "kg" | "pcs"; gross: number; net: number };
  const rows: Row[] = [
    { en: "Croissant", unit: "pcs", gross: 1, net: 1 },
    { en: "Cream Cheese", unit: "kg", gross: 0.037, net: 0.035 },
    { en: "Lollo Bionda Lettuce", unit: "kg", gross: 0.020, net: 0.015 },
    { en: "Herring", unit: "kg", gross: 0.062, net: 0.060 },
    { en: "Boiled Eggs", unit: "pcs", gross: 0.5, net: 0.5 },
    { en: "Pickled Cucumber", unit: "kg", gross: 0.028, net: 0.025 },
    { en: "(SF) Marinated onion", unit: "kg", gross: 0.017, net: 0.015 },
    { en: "Green Onion", unit: "kg", gross: 0.004, net: 0.003 },
    { en: "Dill", unit: "kg", gross: 0.002, net: 0.001 },
    { en: "Disposable packaging", unit: "pcs", gross: 1, net: 1 },
    { en: "Napkin", unit: "pcs", gross: 1, net: 1 },
  ];

  for (let idx = 0; idx < rows.length; idx++) {
    const r = rows[idx];
    const ingId = byName.get(r.en);
    const ing = await prisma.ingredient.findUnique({ where: { id: ingId! } });
    await prisma.recipeItem.create({
      data: {
        recipeId: recipe.id,
        ingredientId: ingId,
        displayName: r.en,
        unit: r.unit,
        grossWeight: r.gross,
        netWeight: r.net,
        pricePerUnitSnapshot: ing?.pricePerUnit ?? 0,
        sortOrder: idx,
      },
    });
  }

  const steps = [
    "Cut the baked and cooled croissant horizontally according to the “Croissant Cutting Instructions”.",
    "Spread cream cheese sauce evenly over the bottom part of the croissant.",
    "Heat croissant in the microwave oven - 8 sec.",
    "Add ingredients in the following order: lolo bionda, herring.",
    "Slice egg into even rounds.",
    "Add ingredients in the following order: boiled egg, pickled cucumber, marinated onion, green onion, dill.",
    "Serve ready croissant according to the guest's order.",
  ];
  for (let i = 0; i < steps.length; i++) {
    await prisma.recipeStep.create({
      data: {
        recipeId: recipe.id,
        stepNumber: i + 1,
        text: steps[i],
        sortOrder: i,
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log("Seeded recipe id:", recipe.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
