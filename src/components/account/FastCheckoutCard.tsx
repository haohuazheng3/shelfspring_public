/**
 * The dashboard's "prepare your pickup order" card: five numbered steps, two to four words each, so the push
 * leaves four taps; the guide and the member's own restock window one tap away. Lives next to "When your stores
 * restock"; the typical lifetime is the same US figure the guide quotes, so the two never disagree.
 */
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { duoRestockTimes } from "@/lib/content/restockTimes";
import { t } from "@/lib/i18n/server";

export async function FastCheckoutCard() {
  const d = t().account.fast, u = t().account.units;
  const times = await duoRestockTimes("us");
  const median = times.sellout?.medianSec ?? null;
  return (
    <section className="pane p-5 sm:p-6" aria-labelledby="fast-checkout">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id="fast-checkout" className="text-xl font-semibold">{d.title}</h2>
        <span className="text-xs text-ink-3">{d.sub}</span>
      </div>
      <div className="mt-5 border-y border-line py-4"><p className="text-xs text-ink-3">{d.lasts}</p><p className="mt-1 font-mono text-3xl">{median ?? "—"}{median != null && <span className="ms-1 text-base text-ink-3">{u.s}</span>}</p><p className="mt-2 text-xs text-ink-3">{d.push}</p></div>
      <ol className="mt-5 grid gap-4 sm:grid-cols-2">{d.steps.map((step, i) => <li key={step.title} className="flex gap-3"><span className="font-mono text-xs text-accent" aria-hidden>0{i + 1}</span><div><h3 className="text-sm font-semibold">{step.title}</h3><p className="mt-1 text-xs leading-relaxed text-ink-3">{step.hint}</p></div></li>)}</ol>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/how-to-grab-an-iphone-duo-restock" className="btn btn-primary btn-sm">{d.guide}</Link>
        <a href="#restock-times" className="btn btn-ghost btn-sm">{d.window}</a>
      </div>
    </section>
  );
}
