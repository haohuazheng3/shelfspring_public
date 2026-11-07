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

/** A task directory and colophon. Native pages retain their own country and language links. */
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
  const places = native
    ? (localPlaces.length ? localPlaces : storeRefs(cc).map((x) => ({ href: x.href, label: storeLabel(x.store, loc.lang) }))).slice(0, 8)
    : topStates(8).map((s) => ({ href: s.href, label: s.name }));
  const stock: DirectoryLink[] = [
    { href: `${p}/stock/iphone-duo`, label: native ? F.duoStock : "iPhone Duo" },
    { href: `${p}/stock/iphone-18-pro`, label: native ? F.proStock : "iPhone 18 Pro" },
    { href: `${p}/stock/iphone-18-pro-max`, label: native ? F.proMaxStock : "iPhone 18 Pro Max" },
    { href: `${p}/restocks`, label: native ? F.restockLog : "Recent stock changes" },
    { href: `${p}/map`, label: native ? F.liveMap : "Explore the pickup map" },
    ...(native ? [{ href: `${p}/iphone-duo-restock-times`, label: F.restockTimes }] : []),
  ];
  const product: DirectoryLink[] = [
    { href: "/how-it-works", label: native ? `${F.howItWorks} · ${F.englishOnly}` : "How ShelfSpring works" },
    { href: "/pricing", label: native ? F.pricing : "Plans & alerts" },
    { href: "/install", label: native ? F.getApp : "Keep it on your home screen", className: "not-in-app" },
    { href: "/about", label: native ? F.about : "About the project" },
    { href: "/blog", label: native ? `Journal · ${F.englishOnly}` : "The ShelfSpring journal" },
    { href: "/contact", label: native ? F.contact : "Talk to us" },
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
          <Directory title={native ? F.product : "Find your configuration"} number="01" links={stock} />
          <Directory title={native ? F.storesIn : "Explore a place"} number="02" links={[...places, { href: `${p}/stores`, label: native ? F.allStores : "All stores & cities →" }]} />
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
          <p className="footer-trademark">{native ? F.trademark : "Independent of Apple. Apple, iPhone and Apple Store are trademarks of Apple Inc. Availability is a snapshot; confirm your order with Apple."}</p>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} ShelfSpring</span>
            <ul className="footer-legal">
              <li><Link href="/privacy">{native ? F.privacy : "Privacy"}</Link></li>
              <li><Link href="/terms">{native ? F.terms : "Terms"}</Link></li>
              <li><Link href="/refunds">{native ? F.refunds : "Refunds"}</Link></li>
              <li><TrackingChoice /></li>
              <li><Link href="/api/health">{native ? F.status : "System status"} <span aria-hidden="true">↗</span></Link></li>
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
