import { prisma } from "@/lib/db";
import RecipeEditor from "./RecipeEditor";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RecipeEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const [recipe, ingredients] = await Promise.all([
    prisma.recipe.findUnique({
      where: { id: params.id },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
        steps: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.ingredient.findMany({ orderBy: { nameUk: "asc" } }),
  ]);
  if (!recipe) notFound();
  return (
    <RecipeEditor
      recipe={JSON.parse(JSON.stringify(recipe))}
      ingredients={JSON.parse(JSON.stringify(ingredients))}
    />
  );
}
