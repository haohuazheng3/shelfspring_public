import { unstable_noStore } from "next/cache";

/** A failed read is not a valid empty inventory snapshot. Keep the existing dynamic-page fallback,
 * but opt the failed render out of shared caching so ISR cannot freeze that fallback as fresh data. */
export function doNotCacheReadFailure(): void {
  unstable_noStore();
}
