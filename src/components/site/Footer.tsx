import { PendingLink as Link } from "@/components/ui/PendingLink";
import { Logo } from "./Logo";
import { topStates } from "@/lib/seo/links";
import { TrackingChoice } from "./Consent";
import { switchCountries } from "./countries";
import type { Locale } from "@/lib/i18n/locales";
import { dict } from "@/lib/i18n/dict";
import { cityPages, regionPages, storeRefs } from "@/lib/seo/countryLinks";
import { cityLabel, regionLabel, storeLabel } from "@/lib/i18n/places";
import { curatedRecommendations } from "@/lib/seo/curation";

type DirectoryLink = { href: string; label: string; className?: string };

const READING: DirectoryLink[] = [
  { href: "/pickup-planning", label: "Four pickup planning worksheets" },
  { href: "/iphone-duo-restock-times", label: "Understand restock timing" },
  { href: "/iphone-duo-sell-out-times", label: "Read the sell-out window" },
  { href: "/iphone-duo-stock-alerts", label: "Choose a stock alert" },
  { href: "/iphone-duo-near-me", label: "Look for nearby stock" },
  { href: "/how-to-get-an-iphone-duo", label: "Plan your iPhone pickup" },
  { href: "/how-to-grab-an-iphone-duo-restock", label: "Prepare your order" },
  { href: "/which-iphone-duo-restocks-most", label: "Compare configurations" },
  { href: "/apple-store-pickup-availability-explained", label: "Decode pickup availability" },
  { href: "/iphone-duo-back-in-stock", label: "See what came back" },
  { href: "/iphone-duo-stock-checker", label: "Check current stock" },
  { href: "/where-to-buy-iphone-duo", label: "Explore buying options" },
];

/**
 * A task directory and colophon. English and native pages share one shape — 01 shelves by model, 02 places on
 * record (A–Z), 03 about the notebook — and the dictionary words; native pages link into their own country tree.
 */
export function Footer({ loc }: { loc: Locale }) {
  const D = dict(loc.lang);
  const F = D.chrome.footer;
  const native = loc.native;
  const cc = loc.cc;
  const p = native ? `/${cc}` : "";
  const localPlaces = [
    ...regionPages(cc).map((r) => ({ href: r.href, label: regionLabel(cc, r.name, loc.lang) })),
    ...cityPages(cc).map((c) => ({ href: c.href, label: cityLabel(cc, c.name, loc.lang) })),
  ];
  // Which places: the same picks as always (a native version's regions and cities, else its stores; the US's eight
  // biggest states). In what order: A–Z, so the column reads as an index rather than a ranking.
  const picked = native
    ? (localPlaces.length ? localPlaces : storeRefs(cc).map((x) => ({ href: x.href, label: storeLabel(x.store, loc.lang) }))).slice(0, 8)
    : topStates(8).map((s) => ({ href: s.href, label: s.name }));
  const places = [...picked].sort((a, b) => a.label.localeCompare(b.label, native ? loc.tag : "en"));
  const shelves: DirectoryLink[] = [
    { href: `${p}/stock/iphone-duo`, label: F.duoStock },
    { href: `${p}/stock/iphone-18-pro`, label: F.proStock },
    { href: `${p}/stock/iphone-18-pro-max`, label: F.proMaxStock },
    { href: `${p}/map`, label: F.liveMap },
    { href: `${p}/restocks`, label: F.restockLog },
    ...(native ? [{ href: `${p}/iphone-duo-restock-times`, label: F.restockTimes }] : []),
  ];
  const product: DirectoryLink[] = [
    { href: "/how-it-works", label: native ? `${F.howItWorks} · ${F.englishOnly}` : F.howItWorks },
    { href: "/watch-speed-report", label: native ? `Watch-speed evidence · ${F.englishOnly}` : "Watch-speed field notes" },
    { href: "/pickup-planning", label: native ? `Pickup planning · ${F.englishOnly}` : "Pickup planning worksheets" },
    { href: "/blog", label: native ? `Journal · ${F.englishOnly}` : "The ShelfSpring journal" },
    { href: "/pricing", label: native ? F.pricing : "Plans & alerts" },
    { href: "/install", label: F.getApp, className: "not-in-app" },
    { href: "/about", label: F.about },
    { href: "/contact", label: F.contact },
  ];
  return (
    <footer className="site-footer" lang={loc.tag}>
      <div className="footer-inner">
        <div className="footer-opening">
          <div className="footer-identity">
            <Link href={native ? `/${loc.id}` : "/"} aria-label="ShelfSpring"><Logo /></Link>
            <a href="mailto:contact@shelfspring.com" className="footer-contact">contact@shelfspring.com <span aria-hidden="true">↗</span></a>
          </div>
          <p className="footer-statement">{native ? F.blurbIn(D.place.allStoresPhrase(cc)) : "A little less refreshing. A clearer path to pickup."}</p>
        </div>
        <div className="footer-directory">
          <Directory title={F.product} number="01" links={shelves} />
          <Directory title={F.storesIn} number="02" links={[...places, { href: `${p}/stores`, label: F.allStores }]} />
          <Directory title={native ? F.company : "Make it yours"} number="03" links={product} />
        </div>
        {!native && <details className="footer-disclosure">
          <summary><span>Notes for your next pickup</span><span className="footer-disclosure-symbol" aria-hidden="true">+</span></summary>
          <ul className="footer-reading">{curatedRecommendations(READING).map((item) => <li key={item.href}><Link href={item.href}>{item.label}<span aria-hidden="true">↗</span></Link></li>)}</ul>
        </details>}
        <details className="footer-disclosure">
          <summary><span>{native ? F.countries : "Choose your market"}</span><span className="footer-disclosure-symbol" aria-hidden="true">+</span></summary>
          <ul className="footer-markets">{switchCountries().map((c) => <li key={c.cc}><Link href={c.cc === "us" ? "/" : `/${c.cc}`}><span className="footer-market-code" aria-hidden="true">{c.cc.toUpperCase()}</span>{native ? c.names?.[loc.lang] ?? c.name : c.name}</Link></li>)}</ul>
        </details>
        <div className="footer-colophon">
          <p className="footer-trademark">{F.trademark}</p>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} ShelfSpring</span>
            <ul className="footer-legal">
              <li><Link href="/terms">{F.terms}</Link></li>
              <li><Link href="/privacy">{F.privacy}</Link></li>
              <li><Link href="/refunds">{F.refunds}</Link></li>
              <li><Link href="/api/health">{F.status} <span aria-hidden="true">↗</span></Link></li>
              <li><TrackingChoice /></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Directory({ title, number, links }: { title: string; number: string; links: DirectoryLink[] }) {
  return <div className="footer-directory-group">
    <h2><span aria-hidden="true">{number}</span>{title}</h2>
    <ul>{links.map((item) => <li key={item.href} className={item.className}><Link href={item.href}>{item.label}</Link></li>)}</ul>
  </div>;
}
