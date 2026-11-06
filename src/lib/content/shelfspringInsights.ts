/** Derived only from recorded returns. No query, forecast or claim about current availability. */
export interface ReturnEvidence {
  restocks: number;
  stores: number;
  byPart: readonly { partNumber: string; restocks: number }[];
  unknown?: boolean;
}
export interface PickupPattern {
  known: boolean;
  total: number;
  activeConfigurations: number;
  activeStores: number;
  leaders: { partNumber: string; restocks: number; share: number }[];
  tied: boolean;
}
export function pickupPattern(data: ReturnEvidence): PickupPattern {
  if (data.unknown) return { known: false, total: 0, activeConfigurations: 0, activeStores: 0, leaders: [], tied: false };
  const rows = data.byPart.filter((p) => p.restocks > 0).map((p) => ({ ...p }));
  rows.sort((a, b) => b.restocks - a.restocks || a.partNumber.localeCompare(b.partNumber));
  const total = Math.max(0, data.restocks);
  const top = rows[0]?.restocks;
  // Preserve a tie instead of presenting one alphabetically-first configuration as the winner.
  const leaders = top == null ? [] : rows.filter((p) => p.restocks === top).map((p) => ({ ...p, share: total > 0 ? Math.round(p.restocks / total * 100) : 0 }));
  return { known: true, total, activeConfigurations: rows.length, activeStores: Math.max(0, data.stores), leaders, tied: leaders.length > 1 };
}
