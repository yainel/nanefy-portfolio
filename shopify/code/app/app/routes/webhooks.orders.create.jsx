/**
 * orders/create webhook → roasting queue.
 * Every paid coffee order is scheduled for the next roast day (Tuesday or Friday).
 *
 * Subscribed in shopify.app.toml:
 *   [[webhooks.subscriptions]]
 *   topics = ["orders/create"]
 *   uri = "/webhooks/orders/create"
 */
import { authenticate } from "../shopify.server";
import db from "../db.server";

export async function action({ request }) {
  // Verifies the HMAC signature: requests that weren't sent by Shopify are rejected with 401
  const { shop, topic, payload } = await authenticate.webhook(request);
  if (topic !== "ORDERS_CREATE") return new Response("Unhandled topic", { status: 400 });

  const bags = payload.line_items
    .filter((line) => line.product_type === "Coffee")
    .reduce((total, line) => total + line.quantity, 0);
  if (bags === 0) return new Response();

  // Shopify retries webhooks, so the same order can arrive twice:
  // upsert on the order id makes every delivery after the first a harmless no-op
  await db.roastQueue.upsert({
    where: { orderId: String(payload.id) },
    update: {},
    create: {
      orderId: String(payload.id),
      orderName: payload.name,
      shop,
      bags,
      roastOn: nextRoastDay(new Date(payload.created_at)),
    },
  });

  // Answer quickly (Shopify waits 5 seconds); anything slow belongs in a background job
  return new Response();
}

/** Roast days are Tuesday (2) and Friday (5); orders after noon move to the following one. */
export function nextRoastDay(orderedAt) {
  const day = new Date(orderedAt);
  if (day.getHours() >= 12) day.setDate(day.getDate() + 1);
  while (![2, 5].includes(day.getDay())) day.setDate(day.getDate() + 1);
  day.setHours(7, 0, 0, 0);
  return day;
}
