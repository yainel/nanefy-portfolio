// @ts-check
/**
 * Shopify Function (product discount): "Buy 2+ bags of coffee, save 10% on all of them".
 * Runs on Shopify's servers for every cart and checkout, so the discount can't be bypassed
 * the way a theme script could, and it stacks according to the store's discount settings.
 */
import { DiscountApplicationStrategy } from "../generated/api";

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

const MIN_BAGS = 2;
const PERCENT_OFF = "10.0";

/** @type {FunctionRunResult} */
const NO_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  const coffeeLines = input.cart.lines.filter(
    (line) => line.merchandise.__typename === "ProductVariant" && line.merchandise.product.isCoffee
  );
  const bags = coffeeLines.reduce((total, line) => total + line.quantity, 0);

  if (bags < MIN_BAGS) return NO_DISCOUNT;

  return {
    discountApplicationStrategy: DiscountApplicationStrategy.First,
    discounts: [
      {
        message: `${MIN_BAGS}+ bags: ${parseFloat(PERCENT_OFF)}% off coffee`,
        targets: coffeeLines.map((line) => ({ cartLine: { id: line.id } })),
        value: { percentage: { value: PERCENT_OFF } },
      },
    ],
  };
}
