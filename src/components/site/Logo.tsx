/**
 * An open shelf and ascending signal form a compact mark. Its silhouette works in one colour and
 * remains legible at favicon size. icon.svg, the PWA icons and the OG image use the same geometry.
 */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect width="64" height="64" rx="18" fill="#2455d6" />
      <path d="M15 40v9h34v-9M20 33V23m12 10V15m12 18V19" stroke="#fffdf7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The compact masthead keeps the name readable on a phone; utilities occupy their own rail.
 */
export function Logo({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={`brand-lockup ${compact ? "brand-lockup-compact" : ""} ${className}`}>
      <span className="shrink-0"><LogoMark /></span>
      <span className="brand-wordmark">ShelfSpring<span className="brand-period">.</span></span>
    </span>
  );
}
