export function Page({ title, lead, children, wide, contents }: { title: string; lead?: string; children: React.ReactNode; wide?: boolean; contents?: { id: string; label: string }[] }) {
  return (
    <div className={`field-page document-page ${wide ? "document-page-wide" : ""}`}>
      <header className="document-intro">
        <div className="document-rule" aria-hidden="true" />
        <h1 className="field-title">{title}</h1>
        {lead && <p className="field-lead">{lead}</p>}
      </header>
      <div className={contents ? "document-layout" : undefined}>
        {contents && <nav className="document-index" aria-label="Page sections"><div className="eyebrow">In this document</div><ol>{contents.map((item, index) => <li key={item.id}><a href={`#${item.id}`}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{item.label}</a></li>)}</ol></nav>}
        <div className="document-body prose-site">{children}</div>
      </div>
    </div>
  );
}
