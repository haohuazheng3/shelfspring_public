/** These worksheets do not query inventory or change an account. Invalid input stays unknown. */
export function numericInput(raw: string, max: number, integer = false): number | null {
  if (!raw.trim()) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 && n <= max && (!integer || Number.isInteger(n)) ? n : null;
}
export function ruleBudget(stores: number, configurations: number, limit: number) {
  const rules = stores * configurations;
  return { rules, fits: rules <= limit, over: Math.max(0, rules - limit), completeStores: configurations > 0 ? Math.floor(limit / configurations) : 0 };
}
export function tripBudget(distance: number, rate: number, fixed: number, minutes: number, hourly: number) {
  const cash = distance * rate + fixed;
  const timeValue = minutes / 60 * hourly;
  return { cash, timeValue, combined: cash + timeValue };
}
export function pickupNextStep(ready: boolean, canCollect: boolean, deliveryFits: boolean): string {
  if (ready && canCollect) return "You have a practical pickup option. Follow the confirmed order's collection instructions, then review any delivery order you intend to change.";
  if (deliveryFits) return "Delivery fits your stated deadline. Compare its receiving arrangements with the effort of pickup before changing a workable order.";
  if (!canCollect) return "Pickup is not practical with your current schedule. Check the current delivery options or make another arrangement for your deadline.";
  return "Keep checking acceptable pickup options, but do not travel on a stock listing alone. Wait for Apple's ready notification and keep a fallback for your deadline.";
}
