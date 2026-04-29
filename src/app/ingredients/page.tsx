import { prisma } from "@/lib/db";
import IngredientsClient from "./IngredientsClient";

export const dynamic = "force-dynamic";

export default async function IngredientsPage() {
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { nameUk: "asc" },
  });
  return <IngredientsClient initialIngredients={ingredients} />;
}
