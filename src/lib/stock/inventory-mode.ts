/** Preview inventory is display-only, including when a caller bypasses the feed dispatcher. */
export function previewInventoryMode(env: Record<string, string | undefined> = process.env): boolean {
  // Unknown nonempty values also disable delivery; a misspelled flag must never enable notifications.
  return env.VERCEL_ENV === "preview" || Boolean(env.PREVIEW_INVENTORY_MODE && env.PREVIEW_INVENTORY_MODE !== "0");
}

/** Same physical inventory, private application state; never collect or mutate source stock. */
export function sharedInventoryMode(env: Record<string, string | undefined> = process.env): boolean {
  return env.INVENTORY_FEED_MODE === "shared";
}
