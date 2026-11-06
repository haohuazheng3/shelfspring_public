/** Fixed vocabulary: public reports never carry free-form messages, URLs, or stack contents. */
export const ERROR_KINDS = ["Error", "TypeError", "ReferenceError", "SyntaxError", "RangeError", "URIError", "EvalError", "AggregateError"] as const;
export const ERROR_ROUTES = ["/", "/account", "/checkout/success", "/admin", "/api", "/map", "/stock", "/stores", "/restocks", "/blog", "/content"] as const;
export type ErrorKind = typeof ERROR_KINDS[number];
export type ErrorRoute = typeof ERROR_ROUTES[number];
export function errorKind(value: unknown): ErrorKind {
  return ERROR_KINDS.includes(value as ErrorKind) ? value as ErrorKind : "Error";
}
export function errorRoute(path: string): ErrorRoute {
  const clean = path.split(/[?#]/, 1)[0].replace(/^\/[a-z]{2}(?:-[a-z]{2})?(?=\/)/i, "");
  if (clean === "/" || clean === "") return "/";
  return ERROR_ROUTES.find((route) => route !== "/" && route !== "/content" && (clean === route || clean.startsWith(`${route}/`))) ?? "/content";
}
