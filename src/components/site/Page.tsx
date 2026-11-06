export function Page({ title, lead, children, wide }: { title: string; lead?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`site-content mx-auto px-4 pt-12 sm:pt-16 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
      <div className="page-intro">
        <h1 className="display text-3xl sm:text-5xl">{title}</h1>
        {lead && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-2">{lead}</p>}
      </div>
      <div className="pane prose-site mt-8 p-6 sm:p-8">{children}</div>
    </div>
  );
}
