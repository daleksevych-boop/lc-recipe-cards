-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameUk" TEXT NOT NULL,
    "nameEn" TEXT,
    "unit" TEXT NOT NULL,
    "pricePerUnit" REAL NOT NULL,
    "wasteColdPct" REAL NOT NULL DEFAULT 0,
    "wasteHotPct" REAL NOT NULL DEFAULT 0,
    "supplier" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameUk" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "versionCode" TEXT NOT NULL DEFAULT 'NO | 03.26',
    "sellingPriceNet" REAL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "totalWeightKg" REAL,
    "authorEmail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RecipeItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "ingredientId" TEXT,
    "displayName" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "grossWeight" REAL NOT NULL,
    "netWeight" REAL NOT NULL,
    "pricePerUnitSnapshot" REAL NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "RecipeItem_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecipeItem_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecipeStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "RecipeStep_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecipeVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "snapshot" TEXT NOT NULL,
    "authorEmail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecipeVersion_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Ingredient_nameUk_idx" ON "Ingredient"("nameUk");

-- CreateIndex
CREATE INDEX "RecipeItem_recipeId_idx" ON "RecipeItem"("recipeId");

-- CreateIndex
CREATE INDEX "RecipeStep_recipeId_idx" ON "RecipeStep"("recipeId");

-- CreateIndex
CREATE INDEX "RecipeVersion_recipeId_idx" ON "RecipeVersion"("recipeId");
