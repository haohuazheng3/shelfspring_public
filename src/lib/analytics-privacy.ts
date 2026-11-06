/** Back-office pages contain messages and operational data; analytics never runs there. */
export function analyticsPrivatePath(pathname: string): boolean {
  const path = pathname.split(/[?#]/, 1)[0];
  try { return /^\/admin(?:\/|$)/i.test(decodeURIComponent(path)); }
  catch { return /^\/admin(?:\/|$)/i.test(path); }
}

/** A loaded tracker cannot be unloaded safely; entering or leaving admin starts a fresh document. */
export function analyticsDocumentBoundary(from: string, to: string): boolean {
  return analyticsPrivatePath(from) !== analyticsPrivatePath(to);
}
