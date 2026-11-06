/**
 * Two open, offset forms make a compact, continuous mark. Its silhouette works in one colour and
 * remains legible at favicon size. icon.svg, the PWA icons and the OG image use the same geometry.
 */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect width="64" height="64" rx="18" fill="#153c32" />
      <path d="M15 35V26c0-6.63 5.37-12 12-12h16v9H28a4 4 0 0 0-4 4v8h-9Z" fill="#f3f4c4" />
      <path d="M49 29v9c0 6.63-5.37 12-12 12H21v-9h15a4 4 0 0 0 4-4v-8h9Z" fill="#f3f4c4" />
    </svg>
  );
}

/**
 * `compact` hides the wordmark below 420 px and lets it truncate above that: on a phone the header row
 * must hold the mark, "My alerts", search and the theme toggle, so the wordmark is the one thing that gives way.
 */
export function Logo({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={`inline-flex min-w-0 max-w-full items-center gap-2.5 ${className}`}>
      <span className="shrink-0"><LogoMark /></span>
      <span className={`brand-wordmark min-w-0 truncate text-[1.1rem] font-semibold tracking-[-0.045em] text-ink ${compact ? "hidden min-[420px]:inline-block" : ""}`}>ShelfSpring</span>
    </span>
  );
}
