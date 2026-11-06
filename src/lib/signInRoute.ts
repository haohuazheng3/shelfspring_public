/**
 * Keep an explicit local return destination after sign-in, including the account page that required it.
 * Without one, returning paid members go to their account; new free members start alert setup.
 */
export function afterSignInPath({ next, home, paid }: { next?: string | null; home: string; paid: boolean }): string {
  const safe = next && next.startsWith("/") && !next.startsWith("//") && !/[\\\u0000-\u001f\u007f]/.test(next) ? next : null;
  if (safe) return safe;
  if (paid) return "/account";
  // A country's home in English (/jp) or one of its languages (/ja-jp).
  return `${/^\/[a-z]{2}(-[a-z]{2})?$/.test(home) ? home : "/"}#notify`;
}

/** Clerk's `__client_uat` cookie (readable by scripts): 0 when signed out, a timestamp when signed in. */
export function signedInFromCookie(cookie: string): boolean {
  return [...cookie.matchAll(/(?:^|;\s*)__client_uat(?:_[^=]*)?=(\d+)/g)].some((m) => Number(m[1]) > 0);
}
