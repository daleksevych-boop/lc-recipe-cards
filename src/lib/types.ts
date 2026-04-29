// Shared types used across the app and PDF templates.

export type Unit = "kg" | "l" | "pcs";

export interface RecipeItemView {
  displayName: string;
  unit: Unit;
  /** For unit=kg/l — kilograms/liters. For unit=pcs — number of pieces (can be fractional, e.g. 0.5). */
  grossWeight: number;
  netWeight: number;
  pricePerUnitSnapshot: number;
  /** VAT % snapshot (e.g. 20). */
  vatPctSnapshot: number;
}

export interface RecipeStepView {
  stepNumber: number;
  text: string;
}

export interface RecipeView {
  nameUk: string;
  nameEn: string;
  versionCode: string;
  /** Country / market: "NO" | "FR" | null. */
  country: string | null;
  /** Selling price gross (incl. VAT), UAH. User input. */
  sellingPriceGross: number | null;
  /** Selling price net of VAT, UAH. Computed from gross. */
  sellingPriceNet: number | null;
  /** Recipe-level VAT %. */
  vatPct: number;
  /** Total weight override (kg). If null — use sum of net weights. */
  totalWeightKg: number | null;
  items: RecipeItemView[];
  steps: RecipeStepView[];
}

export interface CostSummary {
  /** UAH, sum of (netWeight * pricePerUnitSnapshot) per item. NET of VAT. */
  costTotal: number;
  /** UAH, sum of (netWeight * pricePerUnitSnapshot * (1 + vatPctSnapshot/100)). GROSS (incl. VAT). */
  costTotalGross: number;
  /** UAH per recipe item, NET of VAT (same order as items). */
  perItemCost: number[];
  /** UAH per recipe item, GROSS incl. VAT (same order as items). */
  perItemCostGross: number[];
  /** Foodcost in UAH = sellingPriceNet - costTotal. null if no price. */
  foodcostUah: number | null;
  /** Foodcost in % = costTotal / sellingPriceNet * 100. null if no price. */
  foodcostPct: number | null;
  /** Sum of net weights converted to kg (kg/l → kg, pcs → not summed; pcs items contribute 0 to total weight). */
  totalNetKg: number;
}
