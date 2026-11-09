import { withShelfPlace } from "@/lib/seo/localizedCopy";
/**
 * Chaînes françaises : place — les textes des pages pays en français (France, Belgique, Suisse, Canada) : titres,
 * introductions « réponse d’abord », sections par mot-clé, prix et taxes, FAQ, à partir des chiffres en direct.
 * Canada : prix Apple avant taxes, TPS / TVH / TVQ / TVP / TVD par province ; ailleurs TVA incluse (20 %, 21 %, 8,1 %).
 * Mêmes arguments et mêmes formes de retour que l’anglais (lib/seo/countryCopy.ts).
 */
import type { Dict } from "../en";
import * as cc from "@/lib/seo/countryCopy";
import type { IntlPlaceInput, HomeCopyInput, RestockTimesBrief } from "@/lib/seo/countryCopy";
import { MODELS, catalogFor, citiesWithStores, statesWithStores, storesOf, modelByKey, type ModelKey, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { CA_PROVINCE_TAX, TAX_SOURCES, beforeTax, includedRate, taxName, withProvinceTax, pickupHelp, storeListSource } from "@/content/country-tax";
import type { Source } from "@/lib/content/types";
import type { Block, Faq } from "@/lib/content/types";
import type { KeywordSection } from "@/components/content/KeywordSections";
import type { FaqItem } from "@/lib/seo/enrich";
import { alertHref, fmtDuration } from "@/lib/seo/enrich";
import { fitTitleW, list, num, plural, price, stamp, hour } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, colorLabel, regionLabel } from "@/lib/i18n/places";
import { IN, NAME, L, cap, dans, noun } from "./util";

/* ------------------------------------------------------------------ small helpers */

const money = (code: CountryCode, v: number) => price(L(code), COUNTRIES[code], v);
const N = (code: CountryCode | undefined, v: number) => num(L(code), v);
const rate = (code: CountryCode, r: number) => `${num(L(code), r)} %`;
const apple = (s: Store) => appleStoreLabel(s, L(s.country));
/** "TVA", "TPS", "taxe à la consommation": the tax inside a price. */
function taxFr(c: Country): string {
  const t = taxName(c);
  return t === "VAT" ? "TVA" : t === "GST" ? "TPS" : t === "consumption tax" ? "taxe à la consommation" : "taxe";
}
/** "TVA de 20 % comprise" / "hors taxes" (Canada) / "aucune taxe de vente" (Hong Kong). */
export function taxNote(code: CountryCode): string {
  const c = COUNTRIES[code];
  if (!c.pricesIncludeTax) return code === "ca" ? "hors taxes, TPS/TVH et part provinciale en sus" : "hors taxe de vente";
  const r = includedRate(c);
  return r == null ? "aucune taxe de vente" : `${taxFr(c)} de ${rate(code, r)} comprise`;
}
/** A place given in French: the country itself reads "en France", anything else "à Paris", "au Québec". */
function where(code: CountryCode, place: string): string {
  return place === NAME[code] || place === COUNTRIES[code].name ? IN[code] : dans(place);
}
/** The French name of a page's place (the input carries the English one). */
function placeName(i: IntlPlaceInput): string {
  const lg = L(i.cc);
  return i.kind === "state" ? regionLabel(i.cc, i.name, lg) : cityLabel(i.cc, i.name, lg);
}
/** A place that is also a US store city or state gets its country: "London (Canada)". */
function labelOf(code: CountryCode, name: string): string {
  return cc.placeLabel(code, name) !== name ? `${name} (${NAME[code]})` : name;
}
const provinceFr = (p: string) => regionLabel("ca", p, "fr-CA");

/* ------------------------------------------------------------------ Canada: provincial taxes in French */

/** The provincial part's French name: TVP (C.-B.), TVD (Manitoba), TVQ (Québec). */
const PST: Record<string, string> = { "British Columbia": "TVP", Manitoba: "TVD", Quebec: "TVQ" };
function caLabel(p: string): string {
  const t = CA_PROVINCE_TAX[p];
  return t.hst ? "TVH" : t.pst ? `TPS + ${PST[p] ?? "taxe provinciale"}` : "TPS";
}
/** "TPS 5 % + TVQ 9,975 %". */
function caParts(p: string): string {
  const t = CA_PROVINCE_TAX[p];
  if (t.hst) return `TVH ${rate("ca", t.hst)}`;
  if (t.pst) return `TPS ${rate("ca", t.gst)} + ${PST[p] ?? "part provinciale"} ${rate("ca", t.pst)}`;
  return `TPS ${rate("ca", t.gst)}, sans part provinciale`;
}

/* ------------------------------------------------------------------ sources in French */

/** Apple's online store path for French readers (prices, pickup help). */
const SHOP: Partial<Record<CountryCode, string>> = { fr: "fr", be: "be-fr", ch: "ch-fr", ca: "ca" };
const RETAIL: Partial<Record<CountryCode, string>> = { fr: "fr", be: "befr", ch: "chfr", ca: "ca/fr" };
const EU_FR: Source = { label: "Your Europe (Union européenne) : taux de TVA appliqués dans les pays de l’UE", url: "https://europa.eu/youreurope/business/taxation/vat/vat-rules-rates/index_fr.htm" };
const TAX_FR: Partial<Record<CountryCode, Source>> = {
  fr: EU_FR,
  be: EU_FR,
  ch: { label: "Administration fédérale des contributions (AFC) : taux de TVA en Suisse", url: "https://www.estv.admin.ch/estv/fr/accueil/taxe-sur-la-valeur-ajoutee/taux-tva-suisse.html" },
  ca: { label: "Agence du revenu du Canada : calculatrice de la TPS/TVH et tableau des taux", url: "https://www.canada.ca/fr/agence-revenu/services/impot/entreprises/sujets/tps-tvh-entreprises/facturer-percevoir-quel-taux/calculatrice.html" },
};
function taxSource(code: Exclude<CountryCode, "us">): Source {
  return TAX_FR[code] ?? { label: `${TAX_SOURCES[code].label} (en anglais)`, url: TAX_SOURCES[code].url };
}
function pickupHelpFr(code: CountryCode): Source {
  const p = SHOP[code];
  // Apple's Canadian help page exists in English only (the /ca/fr/shop help answers 404).
  if (p && code !== "ca") return { label: `Apple, aide « Livraison et retrait » (${NAME[code]}) : pièces à présenter au comptoir`, url: `https://www.apple.com/${p}/shop/help/shipping_delivery` };
  const en = pickupHelp(code);
  return { label: `Apple, aide « Livraison et retrait » (${NAME[code]}, en anglais) : pièces à présenter au comptoir`, url: en.url };
}
function storeListFr(code: CountryCode): Source {
  const p = RETAIL[code];
  if (p) return { label: `Liste officielle des Apple Store (${NAME[code]})`, url: `https://www.apple.com/${p}/retail/storelist/` };
  return { label: `Liste officielle des Apple Store (${NAME[code]}, en anglais)`, url: storeListSource(code).url };
}
const shopPath = (code: CountryCode) => SHOP[code] ?? COUNTRIES[code].buyPath ?? COUNTRIES[code].shopPath;

/* ------------------------------------------------------------------ time */

function sinceWhen(now = Date.now()): string {
  return now - Date.parse(`${cc.INTL_TRACKING_SINCE}T00:00:00Z`) < 30 * 86400_000 ? "dans le registre ouvert le 2 novembre" : "sur 30 jours glissants";
}
function whenIn(code: CountryCode, iso: string | Date): string {
  return stamp(L(code), iso, COUNTRIES[code].timeZone, true);
}

/* ------------------------------------------------------------------ tax */

function taxSentence(code: CountryCode, region?: string): string {
  const c = COUNTRIES[code];
  const duo = cc.priceOf(code, "duo");
  if (duo == null) return "";
  if (code === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    if (t) return `Prix Apple de l’iPhone Duo 256GB : ${money(code, duo)} hors taxes. En ajoutant ${caParts(region!)} (${provinceFr(region!)}), on arrive à environ ${money(code, t.total)} au retrait.`;
    return `Prix Apple de l’iPhone Duo 256GB : ${money(code, duo)} hors taxes ; la province du magasin y ajoute de 5 % à 15 % au moment de payer.`;
  }
  const r = includedRate(c);
  if (r == null) return `Sans taxe de vente ${IN[code]}, les ${money(code, duo)} affichés pour l’iPhone Duo 256GB sont exactement ce que coûte le retrait.`;
  return `${taxFr(c)} comprise : les ${money(code, duo)} affichés pour l’iPhone Duo 256GB ${IN[code]} intègrent déjà ${rate(code, r)} de ${taxFr(c)}, et le comptoir de retrait n’ajoute rien.`;
}

const PRICE_ROWS: [ModelKey, string][] = [["duo", "256GB"], ["duo", "1TB"], ["18-pro-max", "256GB"], ["18-pro-max", "1TB"], ["18-pro", "256GB"]];

function priceSection(code: CountryCode, placeName: string, region?: string, model: ModelKey = "duo"): KeywordSection {
  const c = COUNTRIES[code];
  const m = modelByKey(model)!;
  const base = cc.priceOf(code, model) ?? 0;
  const rows: [string, number][] = PRICE_ROWS.flatMap(([k, st]) => { const p = cc.priceOf(code, k, st); return p == null ? [] : [[`${modelByKey(k)!.name} ${st}`, p] as [string, number]]; });
  const src = code === "us" ? TAX_SOURCES.ca : taxSource(code);
  if (code === "ca") {
    const t = region ? CA_PROVINCE_TAX[region] : undefined;
    if (t) {
      const R = provinceFr(region!);
      const table: Block = {
        t: "table",
        head: ["iPhone", "Prix Apple hors taxes", `Total avec ${caLabel(region!)} (${rate(code, t.total)})`],
        rows: rows.map(([label, p]) => [label, money(code, p), money(code, withProvinceTax(p, region!)!.total)]),
        caption: `Prix Apple au Canada majoré de ${caLabel(region!)} (${rate(code, t.total)}) · ${R}`,
        source: `[${src.label}](${src.url}) · tarifs relevés sur apple.com/ca`,
      };
      return {
        id: "price-with-tax",
        h2: `${m.name} ${dans(placeName)} : le prix taxes comprises`,
        lead: `Hors taxes, Apple affiche l’${m.name} 256GB à **${money(code, base)}**. ${cap(dans(R))}, en ajoutant ${caParts(region!)}, la facture du retrait monte à environ **${money(code, withProvinceTax(base, region!)!.total)}**${placeName !== R ? ` pour un magasin ${dans(placeName)}` : ""}.`,
        blocks: [{ t: "note", text: "**Ce qui fixe le taux :** la province où se trouve le magasin de retrait, et non votre domicile." }, table],
      };
    }
    const provinces = Object.keys(CA_PROVINCE_TAX).filter((p) => storesOf("ca").some((s) => s.state === p));
    const cheapest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total < CA_PROVINCE_TAX[a].total ? b : a));
    const dearest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total > CA_PROVINCE_TAX[a].total ? b : a));
    return {
      id: "price-with-tax",
      h2: `${m.name} au Canada : le prix taxes comprises, province par province`,
      lead: `Apple affiche **${money(code, base)}** hors taxes pour un ${m.name} 256GB. La taxe dépend ensuite de la province du magasin : environ **${money(code, withProvinceTax(base, cheapest)!.total)}** ${dans(provinceFr(cheapest))} (${rate(code, CA_PROVINCE_TAX[cheapest].total)}), et jusqu’à **${money(code, withProvinceTax(base, dearest)!.total)}** ${dans(provinceFr(dearest))} (${rate(code, CA_PROVINCE_TAX[dearest].total)}).`,
      blocks: [{
        t: "table",
        head: ["Province", "Taxe appliquée", "Taux total", `${m.short} 256GB, total`],
        rows: provinces.map((p) => [provinceFr(p), caLabel(p), rate(code, CA_PROVINCE_TAX[p].total), money(code, withProvinceTax(base, p)!.total)]),
        caption: "Taxe de vente au retrait, pour chaque province dotée d’un Apple Store",
        source: `[${src.label}](${src.url}) · tarifs relevés sur apple.com/ca`,
      }],
    };
  }
  const r = includedRate(c);
  const tn = taxFr(c);
  return {
    id: "price",
    h2: `${money(code, base)} pour l’${m.name} ${IN[code]}, ${taxNote(code)}`,
    lead: r == null
      ? `Aucune taxe ne vient s’ajouter ${where(code, placeName)} : **ni TVA, ni taxe de vente**. L’${m.name} 256GB se paie donc **${money(code, base)}**, le montant d’apple.com.`
      : `**${tn} de ${rate(code, r)} déjà comprise** : l’${m.name} 256GB coûte **${money(code, base)}** ${IN[code]} (soit ${money(code, beforeTax(c, base))} hors taxes), sans supplément au moment du retrait ${where(code, placeName)}.`,
    blocks: [{
      t: "table",
      head: r == null ? ["iPhone", "Prix affiché par Apple"] : ["iPhone", "Prix affiché par Apple", `Montant hors ${tn} (${rate(code, r)})`],
      rows: rows.map(([label, p]) => (r == null ? [label, money(code, p)] : [label, money(code, p), money(code, beforeTax(c, p))])),
      caption: `Tarifs Apple ${IN[code]}${r == null ? "" : ` (${tn} comprise)`}`,
      source: `[${src.label}](${src.url}) · tarifs relevés sur apple.com/${shopPath(code)}`,
    }],
  };
}

function taxFaq(code: CountryCode, placeName: string, region?: string): FaqItem {
  const c = COUNTRIES[code];
  const duo = cc.priceOf(code, "duo") ?? 0;
  if (code === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    return t
      ? { q: `iPhone Duo ${dans(placeName)} : quel prix une fois les taxes ajoutées ?`, a: `Comptez environ ${money(code, t.total)} pour le 256GB, soit le prix Apple de ${money(code, duo)} majoré de ${rate(code, t.rate)} de ${caLabel(region!)} (${provinceFr(region!)}) ; le taux suit la province où l’on retire le téléphone.` }
      : { q: "Les prix d’Apple au Canada comprennent-ils les taxes ?", a: `Non : ${money(code, duo)} pour l’iPhone Duo 256GB, c’est hors taxes. Selon la province du magasin, TPS, TVH ou taxe provinciale viennent s’ajouter, de 5 % en Alberta jusqu’à 14,975 % au Québec.` };
  }
  const r = includedRate(c);
  return r == null
    ? { q: `Un iPhone acheté ${IN[code]} est-il taxé ?`, a: `Non : ${IN[code]}, on ne paie ni TVA ni taxe de vente. Le retrait d’un iPhone Duo 256GB revient à ${money(code, duo)}, soit le prix exact d’apple.com.` }
    : { q: `La ${taxFr(c)} est-elle comprise dans les prix d’apple.com ${IN[code]} ?`, a: `Oui. Pour un iPhone Duo 256GB, les ${money(code, duo)} affichés intègrent déjà ${rate(code, r)} de ${taxFr(c)}, et le comptoir de retrait n’ajoute rien.` };
}

/* ------------------------------------------------------------------ region / city pages */

function placeTitle(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = labelOf(i.cc, placeName(i));
  return fitTitleW([
    ...(k > 1 ? [`Apple Store ${w} : stock iPhone Duo en direct (${N(i.cc, k)} magasins)`] : []),
    `Apple Store ${w} : stock iPhone Duo en direct`,
    `Apple Store ${w} : stock iPhone du jour`,
    `Apple Store ${w} : stock iPhone`,
  ]);
}

function priceBit(code: CountryCode, region?: string): string {
  const duo = cc.priceOf(code, "duo");
  if (duo == null) return "";
  if (code === "ca") { const t = region ? withProvinceTax(duo, region) : null; return t ? `, environ ${money(code, t.total)} taxes comprises ${dans(provinceFr(region!))}` : `, ${money(code, duo)} avant taxes`; }
  return `, ${money(code, duo)} ${taxNote(code)}`;
}

function placeDescription(i: IntlPlaceInput): string {
  const k = N(i.cc, i.stores.length);
  const w = dans(labelOf(i.cc, placeName(i)));
  return fitTitleW([
    `iPhone Duo en retrait en ce moment dans ${N(i.cc, i.stockNow.duo)} des ${k} Apple Store ${w}, 18 Pro Max dans ${N(i.cc, i.stockNow["18-pro-max"])}. Stock en direct par magasin, heures de retour en stock${priceBit(i.cc, i.region)}.`,
    `iPhone Duo en retrait en ce moment dans ${N(i.cc, i.stockNow.duo)} des ${k} Apple Store ${w}, 18 Pro Max dans ${N(i.cc, i.stockNow["18-pro-max"])}. Stock en direct par magasin, retours en stock.`,
  ], 155);
}

function placeIntro(i: IntlPlaceInput): string {
  const lg = L(i.cc);
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? ` (${plural(lg, i.cities, { one: "# ville", other: "# villes" })})` : "";
  return `${cap(dans(placeName(i)))}, **${plural(lg, i.stores.length, { one: "# Apple Store", other: "# Apple Store" })}** au registre${cities}. En rayon pour le retrait à cet instant : iPhone Duo **${N(i.cc, i.stockNow.duo)}**, 18 Pro Max **${N(i.cc, i.stockNow["18-pro-max"])}**, 18 Pro **${N(i.cc, i.stockNow["18-pro"])}**.`;
}

/** The two scarcest configurations of a model at a place, in French ("256GB Ciel nocturne"). */
function scarcest(i: IntlPlaceInput, model: ModelKey, k = 2): { label: string; stores: number }[] {
  const items = catalogFor(model, i.cc);
  const counts = new Map<string, number>(items.map((c) => [c.partNumber, 0]));
  for (const s of i.stores) for (const p of i.stock.get(s.storeNumber)?.perModel[model].parts ?? []) if (counts.has(p)) counts.set(p, (counts.get(p) ?? 0) + 1);
  const by = new Map(items.map((c) => [c.partNumber, c]));
  return [...counts.entries()].map(([p, n]) => ({ label: `${by.get(p)!.storage} ${colorLabel(by.get(p)!.color, L(i.cc))}`, stores: n })).sort((a, b) => a.stores - b.stores).slice(0, k);
}

function duoLead(i: IntlPlaceInput): string {
  const lg = L(i.cc);
  const k = i.stores.length;
  const have = cc.duoStoresNow(i);
  const st = i.duo;
  if (have.length > 0) return `iPhone Duo en rayon dans **${N(i.cc, have.length)} ${k === 1 ? "magasin sur 1" : `magasins sur ${N(i.cc, k)}`}** : ${list(lg, have.map((s) => apple(s)), 4, (r) => `${N(i.cc, r)} de plus`)}.`;
  const none = k === 1 ? "**Le magasin** a l’iPhone Duo hors rayon" : `**Les ${N(i.cc, k)} magasins** ont l’iPhone Duo hors rayon`;
  if (st.month > 0) return `${none} à cet instant, malgré **${plural(lg, st.month, { one: "# retour consigné", other: "# retours consignés" })}** ${sinceWhen()}.`;
  return `${none} à cet instant, sans aucun retour de Duo consigné ${sinceWhen()}.`;
}

function duoPoints(i: IntlPlaceInput, w: string, alert: string): Block[] {
  const lg = L(i.cc);
  const k = i.stores.length;
  const have = cc.duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (have.length > 0 && st.month > 0) items.push(`**${cap(sinceWhen())} :** ${plural(lg, st.month, { one: "# retour de Duo consigné", other: "# retours de Duo consignés" })} dans ces magasins`);
  if (st.lastRestock && last) items.push(`**Retour le plus récent :** ${whenIn(i.cc, st.lastRestock.at)}, chez ${apple(last)}`);
  if (st.medianMs != null) items.push(`**Temps médian en rayon :** environ ${fmtDuration(st.medianMs, lg)} pour un Duo revenu`);
  const targets = k === 1 ? "le magasin" : k <= 3 ? `les ${k === 2 ? "deux" : "trois"} magasins` : `les ${Math.min(k, 5)} magasins les plus proches`;
  items.push(`**À faire :** [mettre un iPhone Duo en veille ${dans(w)}](${alert}) sur ${targets} que vous pourriez rejoindre`);
  items.push("**Une veille** porte sur un magasin et une configuration précise ; l’alerte part une fois la disponibilité repérée");
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: "**Tout peut basculer en peu de temps :** une veille vous évite de recharger apple.com en boucle." });
  blocks.push({ t: "ul", items });
  return blocks;
}

function placeSections(i: IntlPlaceInput): KeywordSection[] {
  const lg = L(i.cc);
  const k = i.stores.length;
  const w = placeName(i);
  const alert = alertHref({ model: "duo", state: i.regionSlug, city: i.kind === "city" ? i.citySlug : undefined, country: i.cc });
  const scarce = scarcest(i, "18-pro-max");
  const pm = catalogFor("18-pro-max", i.cc).length;
  const of = (x: number) => `${N(i.cc, x)} ${k === 1 ? "magasin sur 1" : `magasins sur ${N(i.cc, k)}`}`;
  return [
    {
      id: "iphone-duo",
      h2: `iPhone Duo ${dans(w)} : où est-il en rayon ?`,
      lead: duoLead(i),
      blocks: duoPoints(i, w, alert),
    },
    {
      id: "iphone-18-pro-max",
      h2: `iPhone 18 Pro Max ${dans(w)} : les rayons, magasin par magasin`,
      lead: `iPhone 18 Pro Max en rayon dans **${of(i.stockNow["18-pro-max"])}** ; cela représente **${cc.pairsPct(i, "18-pro-max")} %** des ${N(i.cc, k * pm)} paires magasin–configuration suivies ici.`,
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**Les plus rares à cet instant :** ${list(lg, scarce.map((x) => `${x.label} (${N(i.cc, x.stores)}/${N(i.cc, k)})`))}`] : []),
        `**iPhone 18 Pro :** ${of(i.stockNow["18-pro"])}, soit ${cc.pairsPct(i, "18-pro")} % des paires en rayon`,
        `**${cap(sinceWhen())} :** ${i.max.month ? plural(lg, i.max.month, { one: "# retour de 18 Pro Max consigné", other: "# retours de 18 Pro Max consignés" }) : "aucun retour de 18 Pro Max consigné pour l’instant"}`,
        ...(i.max.medianMs != null ? [`**Temps médian en rayon :** environ ${fmtDuration(i.max.medianMs, lg)} pour un Pro Max revenu`] : []),
      ] }],
    },
    priceSection(i.cc, w, i.cc === "ca" ? i.region : undefined),
  ];
}

/* ------------------------------------------------------------------ country: store index and home */

function storesIndexTitle(code: CountryCode): string {
  const k = storesOf(code).length;
  return fitTitleW([
    ...(k > 1 ? [`Apple Store ${NAME[code]} : stock iPhone Duo en direct dans les ${N(code, k)} magasins`] : []),
    `Apple Store ${NAME[code]} : stock iPhone Duo en direct`,
    `Apple Store ${NAME[code]} : stock iPhone en direct`,
  ], 70);
}

function homeTitle(code: CountryCode): string {
  const stores = storesOf(code);
  const k = stores.length;
  if (k === 1) {
    const city = cityLabel(code, stores[0].city, L(code));
    return fitTitleW([`Apple Store ${NAME[code]} : stock iPhone Duo à ${city}, en direct`, `Apple Store ${NAME[code]} : stock iPhone Duo à ${city}`, `Stock iPhone Duo ${IN[code]} : ${apple(stores[0])}`]);
  }
  return fitTitleW([
    `Stock iPhone Duo ${IN[code]} : les ${N(code, k)} Apple Store, toutes les 15 s`,
    `Stock iPhone Duo ${IN[code]} : ${N(code, k)} Apple Store, toutes les 15 s`,
    `Stock iPhone ${IN[code]} : ${N(code, k)} Apple Store en direct`,
  ]);
}

function homeH1(code: CountryCode): string {
  const stores = storesOf(code);
  const k = stores.length;
  if (k === 1) {
    const city = cityLabel(code, stores[0].city, L(code));
    return `Rayons iPhone de l’Apple Store ${/^[aeiouyhâéèêîôû]/i.test(city) ? `d’${city}` : `de ${city}`}, en direct`;
  }
  return `Rayons iPhone des ${N(code, k)} Apple Store ${IN[code]}, en direct`;
}

function allStoresPhrase(code: CountryCode): string {
  const k = storesOf(code).length;
  return k === 1 ? `l’unique Apple Store ${IN[code]}` : `${N(code, k)} Apple Store suivis ${IN[code]}`;
}

function spreadPhrase(code: CountryCode): string {
  const c = COUNTRIES[code];
  const lg = L(code);
  const regions = statesWithStores(code);
  const cities = citiesWithStores(code);
  const k = storesOf(code).length;
  const villes = plural(lg, cities.length, { one: "# ville", other: "# villes" });
  if (k === 1) return `à ${cityLabel(code, cities[0].name, lg)}`;
  if (cities.length === 1) return `tous à ${cityLabel(code, cities[0].name, lg)}`;
  if (!c.regionNoun || regions.length === 1) return `répartis entre ${villes}`;
  const nn = noun(c);
  return `répartis entre ${villes} et ${N(code, regions.length)} ${regions.length === 1 ? nn.one : nn.other}`;
}

function modelPageTitles(code: CountryCode, model: ModelKey): { title: string; h2: string[] } {
  const m = modelByKey(model)!;
  const k = storesOf(code).length;
  const all = k === 1 ? "dans l’Apple Store" : `dans les ${N(code, k)} Apple Store`;
  return {
    title: fitTitleW([`${m.name} en stock ${IN[code]} : en direct ${all}`, `${m.name} en stock ${IN[code]} : en direct`, `Stock ${m.name} ${IN[code]}`], 70),
    h2: [`${m.name} : dans quels magasins ${IN[code]} est-il en rayon ?`, priceSection(code, NAME[code], undefined, model).h2],
  };
}

function modelIntro(code: CountryCode, model: ModelKey, inStock: number): string {
  const m = modelByKey(model)!;
  const k = storesOf(code).length;
  const r = cc.priceRange(code, model);
  const p = code === "ca" ? `**${money(code, r.low)}** hors taxes` : `**${money(code, r.low)}**, ${taxNote(code)}`;
  const now = inStock === 0
    ? `${m.name} hors rayon pour le retrait dans ${k === 1 ? `**l’unique Apple Store** ${IN[code]}` : `**les ${N(code, k)} Apple Store** ${IN[code]}`}`
    : `${m.name} en rayon pour le retrait dans **${N(code, inStock)} ${k === 1 ? "Apple Store sur 1" : `Apple Store sur ${N(code, k)}`}** ${IN[code]}`;
  return `${now}, d’après la dernière observation ; prix de départ ${p}.`;
}

function modelDescription(code: CountryCode, model: ModelKey, inStock: number): string {
  const m = modelByKey(model)!;
  const k = storesOf(code).length;
  const r = cc.priceRange(code, model);
  const of = k === 1 ? `${N(code, inStock)} sur 1` : `${N(code, inStock)} des ${N(code, k)}`;
  return fitTitleW([
    `L’${m.name} est-il en stock ${IN[code]} ? ${of} Apple Store l’ont en retrait en ce moment. En direct par magasin et configuration, dès ${money(code, r.low)}${code === "ca" ? " avant taxes" : ""}, avec les heures de retour en stock.`,
    `${m.name} ${IN[code]} : ${of} Apple Store l’ont en ce moment. Stock de retrait en direct par magasin et configuration, retours en stock et alertes.`,
  ], 155);
}

function modelRows(code: CountryCode, storesNow: Record<ModelKey, number>, restocks: Record<ModelKey, number>): string[][] {
  const prefix = code === "us" ? "" : `/${code}`;
  return MODELS.map((m) => [`[${m.name}](${prefix}/stock/${m.slug})`, N(code, catalogFor(m.key, code).length), N(code, storesNow[m.key] ?? 0), N(code, restocks[m.key] ?? 0)]);
}

function homeDescription(code: CountryCode): string {
  const k = storesOf(code).length;
  return `Le stock en retrait des iPhone Duo, 18 Pro et 18 Pro Max dans ${allStoresPhrase(code)}, vérifié en direct toutes les 15 secondes. ${k === 1 ? "Prix" : "Heures de retour en stock, prix"} en ${COUNTRIES[code].currency} ; une notification dès que votre magasin est réapprovisionné.`;
}

function homeIntro(code: CountryCode): string {
  const k = storesOf(code).length;
  const of = k === 1 ? "sur 1" : `des ${N(code, k)}`;
  return `En rayon pour le retrait ${IN[code]}, à cet instant : iPhone Duo dans **{{duo.storesNow}} ${of}** Apple Store, iPhone 18 Pro dans **{{pro.storesNow}}**, iPhone 18 Pro Max dans **{{pm.storesNow}}**.`;
}

function homeSections(i: HomeCopyInput): KeywordSection[] {
  const code = i.cc;
  const c = COUNTRIES[code];
  const stores = storesOf(code);
  const k = stores.length;
  const lg = L(code);
  return [
    {
      id: "iphone-stock",
      h2: `Rayons iPhone ${IN[code]} : Duo, 18 Pro et Pro Max, magasin après magasin`,
      lead: `ShelfSpring consigne ce qu’apple.com répond sur le retrait en magasin pour chaque configuration, dans ${allStoresPhrase(code)} : magasin par magasin${k > 1 ? `, ${c.regionNoun ? noun(c).one : "ville"} par ${c.regionNoun ? noun(c).one : "ville"}` : ""}, configuration par configuration.`,
      blocks: [
        { t: "table", head: ["iPhone", "Configurations suivies", "Magasins où il est en rayon", "Retours consignés"], rows: modelRows(code, i.storesNow, i.restocks), caption: `Périmètre du registre ${IN[code]} · relevé du {{asOf}}` },
        { t: "ul", items: [
          `**Périmètre :** ${spreadPhrase(code)} · prix et références d’Apple ${IN[code]}`,
          "**Inventaire actualisé en continu** à partir d’un flux synchronisé",
          "**Confirmation obligatoire :** une réponse isolée d’apple.com ne crée jamais, à elle seule, un retour ni un départ",
          `**Chaque changement confirmé** rejoint le [registre des retours](${i.restocksPath}), source des graphiques de ${i.index?.indexable ? `[chaque fiche magasin](${i.index.path})` : "la fiche du magasin"}`,
        ] },
        { t: "img", id: "phone-notification" },
      ],
    },
    priceSection(code, NAME[code]),
    {
      id: "alerts",
      h2: `Veilles Apple Store ${IN[code]} : le fonctionnement`,
      lead: `Les rayons se consultent gratuitement ; l’abonnement sert à ne plus avoir à les surveiller vous-même. Retenez ${k === 1 ? "l’Apple Store" : "les Apple Store"} que vous pourriez rejoindre et l’iPhone exact : une alerte part dès que ${k === 1 ? "le magasin" : "l’un d’eux"} le liste pour le retrait.`,
      blocks: [
        { t: "ol", items: [
          "Ouvrez **Créer une veille**, puis fixez modèle, capacité et finition.",
          k === 1 ? `Gardez le magasin : ${apple(stores[0])}, ${cityLabel(code, stores[0].city, lg)}.` : "Retenez les magasins à votre portée ; les plus proches viennent en tête, avec distance routière en kilomètres et temps de trajet.",
          "Sur iPhone, enregistrez ShelfSpring sur l’écran d’accueil puis autorisez les notifications ([guide d’installation](/install)).",
          "À l’arrivée de l’alerte, ouvrez apple.com depuis la notification et payez en choisissant ce magasin pour le retrait.",
        ] },
        { t: "table", head: ["Formule", "Tarif mensuel (USD)", "Veilles incluses"], rows: [["Plus", "$5 par mois", "10"], ["Pro", "$10 par mois", "20"], ["Max", "$20 par mois", "50"]], caption: "Une veille porte sur un magasin et une configuration précise ; la consultation des rayons reste gratuite ([formules](/pricing))" },
        { t: "note", text: "**Notre position :** l’iPhone Duo justifie une veille dans chaque magasin accessible ; pour les 18 Pro et Pro Max, lisez d’abord les chiffres en direct." },
        { t: "img", id: "apple-store-pickup-counter" },
      ],
    },
  ];
}

function homeFaq(code: CountryCode, rt: RestockTimesBrief): Faq[] {
  const k = storesOf(code).length;
  const p = code === "us" ? "" : `/${code}`;
  const count = plural(L(code), rt.n, { one: "# retour confirmé", other: "# retours confirmés" });
  const where = rt.storesTotal === 1 ? "" : `, dans ${N(code, rt.stores)} magasins sur ${N(code, rt.storesTotal)}`;
  const when = rt.n === 0
    ? `Rien de confirmé dans le registre ouvert le 2 novembre. [Heures de retour du Duo ${IN[code]}](${rt.path}) les relève un à un, par heure du magasin et par jour.`
    : rt.peakHour != null
      ? `Les retours se regroupent vers **${hour(L(code), rt.peakHour, true)}, heure du magasin** : ${count}${where} depuis le 2 novembre. [Le détail par heure et par jour](${rt.path}).`
      : `${cap(count)}${where} depuis le 2 novembre, répartis sur trop peu de jours pour avancer une heure type. [Le détail par heure et par jour](${rt.path}).`;
  return [
    { q: `Où l’iPhone Duo est-il en rayon ${IN[code]} à cet instant ?`, a: `Dans {{duo.storesNow}} magasins sur ${N(code, k)} lors de la dernière observation ({{asOf}}). [Rayons iPhone Duo ${IN[code]}](${p}/stock/iphone-duo) détaille chaque magasin et chaque configuration.` },
    { q: `À quelles heures l’iPhone Duo revient-il ${IN[code]} ?`, a: when },
    { q: "Une alerte arrive-t-elle tout de suite ?", a: "Elle part dès que la disponibilité correspondante est repérée et confirmée ; contrôle à la source, synchronisation et acheminement peuvent ajouter du délai. Vérifiez toujours la commande auprès d’Apple." },
    { q: "Que faut-il payer ?", a: "Rayons en direct, carte et registre des retours sont en accès libre. Les veilles : Plus à $5/mois pour 10, Pro à $10 pour 20, Max à $20 pour 50, facturées en dollars US ; le renouvellement s’arrête quand vous voulez ([formules](/pricing))." },
    taxFaq(code, NAME[code]),
    { q: "Pouvez-vous mettre le téléphone de côté pour moi ?", a: `Non. Le registre vous signale qu’un magasin le liste ; la commande se passe sur apple.com avec retrait en magasin, et c’est Apple qui le réserve ensuite ([aide d’Apple sur le retrait](${pickupHelpFr(code).url})).` },
  ];
}

const homeLabels: Dict["place"]["home"] = {
  appName: (code) => `ShelfSpring · rayons iPhone ${IN[code]}`,
  offer: "Rayons en direct, carte et registre des retours en accès libre ; veilles payantes en option",
  itemList: (code) => `Apple Store ${IN[code]}`,
  restockTimesChip: "Heures de retour du Duo",
  storesByRegion: (code) => `Parcourir par ${noun(COUNTRIES[code]).one}`,
  browse: (code) => `Explorer les rayons ${IN[code]}`,
  selloutH2: (code) => `Combien de temps un retour d’iPhone reste-t-il en rayon ${IN[code]} ?`,
  selloutLabel: (code) => `dans l’ensemble des Apple Store ${IN[code]}`,
  last24Label: (code) => IN[code],
  newsroom: "Apple Newsroom : l’iPhone Duo arrive dans les Apple Store du monde entier (23 octobre 2026, en anglais)",
};

/** Store <title> and H1: the store as people search it ("Apple Champs-Élysées", "Apple Store Lille"), then the promise. */
export function storeTitleVariants(lead: string, region: string | null): string[] {
  const r = region ? ` (${region})` : "";
  return [
    `${lead}${r} : stock iPhone du jour, retrait et horaires`,
    `${lead}${r} : stock iPhone, retrait et horaires`,
    `${lead}${r} : stock iPhone et horaires`,
    `${lead} : stock iPhone du jour, retrait et horaires`,
    `${lead} : stock iPhone, retrait et horaires`,
    `${lead} : stock iPhone et horaires`,
    `${lead} : stock iPhone`,
    `${lead} – stock`,
  ];
}

function storeTitle(s: Store, region?: string): string {
  const lg = L(s.country);
  // A store named after its city ("Lille", "Brussels") reads as people search it: "Apple Store Lille", "Apple Store Bruxelles".
  const lead = s.name === s.city ? `Apple Store ${cityLabel(s.country, s.city, lg)}` : appleStoreLabel(s, lg);
  const shown = region && !lead.toLowerCase().includes(region.toLowerCase()) && !s.name.toLowerCase().includes(region.toLowerCase()) ? region : null;
  return fitTitleW(storeTitleVariants(lead, shown));
}

const basePlace: Dict["place"] = {
  sinceWhen,
  placeLabel: labelOf,
  whenIn,
  taxSentence,
  priceSection,
  taxFaq,
  placeTitle,
  placeDescription,
  placeIntro,
  placeSections,
  storesIndexTitle,
  homeTitle,
  homeH1,
  allStoresPhrase,
  spreadPhrase,
  modelPageTitles,
  modelIntro,
  modelDescription,
  modelRows,
  homeDescription,
  homeIntro,
  homeSections,
  homeFaq,
  home: homeLabels,
  storeTitle,
  sources: (code) => ({ pickupHelp: pickupHelpFr(code), storeList: storeListFr(code), tax: taxSource(code) }),
};

export const place: Dict["place"] = withShelfPlace("fr", basePlace);
