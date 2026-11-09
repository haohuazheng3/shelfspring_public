import { withShelfPlace } from "@/lib/seo/localizedCopy";
/**
 * Dutch strings: place — the copy builders of the country pages, written for the Netherlands (/nl-nl) and Belgium
 * (/nl-be): titles, Answer-First intros, keyword sections, price/btw sections and FAQs, from live numbers.
 * Voice: ShelfSpring's observation ledger (rentree = a confirmed return, "in/uit het schap", uitvoering, winkeltijd).
 * Same functions, arguments and return shapes as English (lib/seo/countryCopy.ts). Other countries get a correct
 * Dutch fallback (Canada's provincial tax, Hong Kong without VAT), though only NL and BE have Dutch pages.
 */
import * as CC from "@/lib/seo/countryCopy";
import type { IntlPlaceInput, HomeCopyInput, RestockTimesBrief } from "@/lib/seo/countryCopy";
import { CA_PROVINCE_TAX, beforeTax, includedRate, pickupHelp, storeListSource, withProvinceTax, TAX_SOURCES } from "@/content/country-tax";
import { MODELS, catalogFor, citiesWithStores, statesWithStores, storesOf, modelByKey, type ModelKey, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import { alertHref, type FaqItem } from "@/lib/seo/enrich";
import type { KeywordSection } from "@/components/content/KeywordSections";
import type { Block, Faq, Source } from "@/lib/content/types";
import { num, pct, price, stamp, list, fitTitleW, hour, unit, secs } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, colorLabel, countryLabel, regionLabel } from "@/lib/i18n/places";
import type { Dict } from "../en";

const L = "nl" as const;
const money = (cc: CountryCode, v: number) => price(L, COUNTRIES[cc], v);
const n$ = (v: number) => num(L, v);
/** "Nederland", "België". */
const land = (cc: CountryCode) => countryLabel(cc, L);
/** "in Nederland", "in de Verenigde Staten", "in het Verenigd Koninkrijk". */
const ARTICLE: Partial<Record<CountryCode, string>> = { us: "de ", uk: "het ", ae: "de " };
const inC = (cc: CountryCode) => `in ${ARTICLE[cc] ?? ""}${land(cc)}`;
/** Apple's own store in the reader's language: NL apple.com/nl, Belgium's Dutch store apple.com/be-nl. */
const SHOP: Partial<Record<CountryCode, string>> = { nl: "nl", be: "be-nl" };
const shopOf = (cc: CountryCode) => SHOP[cc] ?? COUNTRIES[cc].buyPath ?? COUNTRIES[cc].shopPath;
/** The Dutch word for a country's regions (Dutch provinces, Belgian gewesten…). */
const NOUN: Record<string, [string, string]> = {
  state: ["staat", "staten"], province: ["provincie", "provincies"], area: ["gebied", "gebieden"], department: ["departement", "departementen"],
  prefecture: ["prefectuur", "prefecturen"], emirate: ["emiraat", "emiraten"], canton: ["kanton", "kantons"], region: ["gewest", "gewesten"],
  county: ["provincie", "provincies"], city: ["stad", "steden"],
};
const noun = (cc: CountryCode, many = false) => (NOUN[COUNTRIES[cc].regionNoun ?? "area"] ?? NOUN.area)[many ? 1 : 0];
/** The tax inside the price, in Dutch. */
const taxWord = (cc: CountryCode) => { const t = COUNTRIES[cc].taxNote; return /^VAT/.test(t) ? "btw" : /^GST/.test(t) ? "GST" : /^consumption/.test(t) ? "consumptiebelasting" : "btw"; };
/** "21% btw inbegrepen", "geen btw" (Hong Kong), "vóór belasting" (Canada, the US). */
const taxNote = (cc: CountryCode) => { const r = includedRate(COUNTRIES[cc]); return r == null ? (cc === "hk" ? "geen btw" : "vóór belasting") : `${pct(L, r)} ${taxWord(cc)} inbegrepen`; };
/** A count with its noun. */
const cnt = (n: number, one: string, many: string) => `${n$(n)} ${n === 1 ? one : many}`;
/** "2 d", "1 u 5 min": how long a listing stayed on the shelf. */
const dur = (ms: number) => {
  const s = Math.round(ms / 1000);
  if (s < 60) return "onder de minuut";
  const m = Math.floor(s / 60);
  if (m < 60) return unit(L, m, "m");
  const h = Math.floor(m / 60);
  if (h < 24) return secs(L, m * 60);
  const d = Math.floor(h / 24);
  return h % 24 ? `${unit(L, d, "d")} ${unit(L, h % 24, "h")}` : unit(L, d, "d");
};
/** A place named in Dutch (idempotent: a Dutch name passes through). */
const placeName = (i: IntlPlaceInput) => (i.kind === "city" ? cityLabel(i.cc, i.name, L) : regionLabel(i.cc, i.name, L));
const appleOf = (s: Store) => appleStoreLabel(s, L);
const fitT = (v: string[], max = 60) => fitTitleW(v, max);

/* ------------------------------------------------------------------ time */

/** The record window: "in het register vanaf 2 november" while the imported history is younger than 30 days, then "binnen het lopende venster van 30 dagen". */
function sinceWhen(now = Date.now()): string {
  return now - Date.parse(`${CC.INTL_TRACKING_SINCE}T00:00:00Z`) < 30 * 86400_000 ? "in het register vanaf 2 november" : "binnen het lopende venster van 30 dagen";
}
/** The short label of the same window: "Vanaf 2 november" / "Venster van 30 dagen". */
const sinceShort = (now = Date.now()) => (now - Date.parse(`${CC.INTL_TRACKING_SINCE}T00:00:00Z`) < 30 * 86400_000 ? "Vanaf 2 november" : "Venster van 30 dagen");

/** "3 nov, 10:05 CET" in the country's zone. */
function whenIn(cc: CountryCode, iso: string | Date): string {
  return stamp(L, iso, COUNTRIES[cc].timeZone, true);
}

/** A place that is also a US Apple Store city or state gets its country ("Manchester, Verenigd Koninkrijk"). */
function placeLabel(cc: CountryCode, name: string): string {
  return CC.placeLabel(cc, name) === name ? name : `${name}, ${land(cc)}`;
}

/* ------------------------------------------------------------------ tax */

function taxSentence(cc: CountryCode, region?: string): string {
  const duo = CC.priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    if (t) return `${money(cc, duo)} is de catalogusprijs van de iPhone Duo 256GB vóór belasting; ${region} rekent aan de balie ${pct(L, t.rate)} ${CA_PROVINCE_TAX[region!].label} erbij, samen grofweg ${money(cc, t.total)}.`;
    return `${money(cc, duo)} is de catalogusprijs van de iPhone Duo 256GB vóór belasting; de provincie van de afhaalwinkel telt daar 5% tot 15% bij op.`;
  }
  const r = includedRate(COUNTRIES[cc]);
  if (r == null) return `Hongkong heft geen omzetbelasting: een iPhone Duo 256GB die je in de winkel afhaalt, kost de catalogusprijs van ${money(cc, duo)} en geen cent meer.`;
  return `${money(cc, duo)} is de catalogusprijs van de iPhone Duo 256GB ${inC(cc)}; de ${pct(L, r)} ${taxWord(cc)} zit er al in, dus afhalen kost niets extra.`;
}

const PRICE_ROWS: [ModelKey, string][] = [["duo", "256GB"], ["duo", "1TB"], ["18-pro-max", "256GB"], ["18-pro-max", "1TB"], ["18-pro", "256GB"]];

/** The EU's VAT page in Dutch, for the two Dutch-speaking countries; the English source elsewhere. */
function taxSource(cc: CountryCode): Source {
  if (cc === "nl" || cc === "be") return { label: "Your Europe (EU): btw-regels en -tarieven per lidstaat", url: "https://europa.eu/youreurope/business/taxation/vat/vat-rules-rates/index_nl.htm" };
  return TAX_SOURCES[cc as Exclude<CountryCode, "us">];
}

function priceSection(cc: CountryCode, placeName: string, region?: string, model: ModelKey = "duo"): KeywordSection {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const base = CC.priceOf(cc, model) ?? 0;
  const src = taxSource(cc);
  const rows: [string, number][] = PRICE_ROWS.flatMap(([k, st]) => { const p = CC.priceOf(cc, k, st); return p == null ? [] : [[`${modelByKey(k)!.name} ${st}`, p] as [string, number]]; });
  if (cc === "ca") {
    const t = region ? CA_PROVINCE_TAX[region] : undefined;
    if (t) {
      const table: Block = {
        t: "table",
        head: ["Uitvoering", "Catalogusprijs (apple.com)", `Na ${pct(L, t.total)} ${t.label}`],
        rows: rows.map(([label, p]) => [label, money(cc, p), money(cc, withProvinceTax(p, region!)!.total)]),
        caption: `Afhalen in ${region}: Canadese catalogusprijs, ${t.label} (${pct(L, t.total)}) erbij geteld`,
        source: `[${src.label}](${src.url}); catalogusprijzen: apple.com/ca`,
      };
      return {
        id: "price-with-tax",
        h2: `Wat een ${m.name} na belasting kost in ${placeName}`,
        lead: `Catalogusprijs van de ${m.name} 256GB: **${money(cc, base)} vóór belasting**. ${region} heft daar ${pct(L, t.total)} ${t.label} op, dus een winkel in ${placeName} rekent grofweg **${money(cc, withProvinceTax(base, region!)!.total)}** af.`,
        blocks: [{ t: "note", text: "**De afhaalwinkel bepaalt het tarief:** het gaat om de provincie waar de winkel staat, niet om je factuuradres." }, table],
      };
    }
    const provinces = Object.keys(CA_PROVINCE_TAX).filter((p) => storesOf("ca").some((s) => s.state === p));
    const cheapest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total < CA_PROVINCE_TAX[a].total ? b : a));
    const dearest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total > CA_PROVINCE_TAX[a].total ? b : a));
    return {
      id: "price-with-tax",
      h2: `${m.name} na belasting, provincie voor provincie`,
      lead: `**${money(cc, base)}** is de catalogusprijs van een ${m.name} 256GB vóór belasting. Haal je hem op in ${cheapest} (${pct(L, CA_PROVINCE_TAX[cheapest].total)}), dan betaal je **${money(cc, withProvinceTax(base, cheapest)!.total)}**; in ${dearest} (${pct(L, CA_PROVINCE_TAX[dearest].total)}) loopt het op tot **${money(cc, withProvinceTax(base, dearest)!.total)}**.`,
      blocks: [{
        t: "table",
        head: ["Provincie", "Heffing", "Tarief", `${m.short} 256GB na belasting`],
        rows: provinces.map((p) => [p, CA_PROVINCE_TAX[p].label, pct(L, CA_PROVINCE_TAX[p].total), money(cc, withProvinceTax(base, p)!.total)]),
        caption: "Belasting aan de afhaalbalie, voor elke provincie met een Apple Store",
        source: `[${src.label}](${src.url}); catalogusprijzen: apple.com/ca`,
      }],
    };
  }
  const r = includedRate(c);
  const tn = taxWord(cc);
  return {
    id: "price",
    h2: `${m.name} ${inC(cc)}: ${money(cc, base)} catalogusprijs, ${taxNote(cc)}`,
    lead: r == null
      ? `Hongkong heft **geen btw** en geen omzetbelasting: de catalogusprijs van **${money(cc, base)}** op apple.com voor een ${m.name} 256GB is bij het afhalen in ${placeName} meteen het hele bedrag.`
      : `Voor **${money(cc, base)}** heb je de ${m.name} 256GB ${inC(cc)}; in dat bedrag zit al **${pct(L, r)} ${tn}** (${money(cc, beforeTax(c, base))} zonder), dus afhalen in ${placeName} brengt geen extra belasting mee.`,
    blocks: [{
      t: "table",
      head: r == null ? ["Uitvoering", "Catalogusprijs (apple.com)"] : ["Uitvoering", "Catalogusprijs (apple.com)", `Netto, zonder ${pct(L, r)} ${tn}`],
      rows: rows.map(([label, p]) => (r == null ? [label, money(cc, p)] : [label, money(cc, p), money(cc, beforeTax(c, p))])),
      caption: `Catalogusprijzen ${inC(cc)}${r == null ? "" : `, ${tn} zit erin`}`,
      source: `[${src.label}](${src.url}); catalogusprijzen: apple.com/${shopOf(cc)}`,
    }],
  };
}

function taxFaq(cc: CountryCode, placeName: string, region?: string): FaqItem {
  const duo = CC.priceOf(cc, "duo") ?? 0;
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    return t
      ? { q: `Wat kost een iPhone Duo 256GB na belasting in ${placeName}?`, a: `Grofweg ${money(cc, t.total)}: Apple vraagt ${money(cc, duo)} vóór belasting, en de ${pct(L, t.rate)} ${CA_PROVINCE_TAX[region!].label} van ${region} komt erbij in de winkel waar je afhaalt.` }
      : { q: "Zit de belasting al in Apples Canadese catalogusprijs?", a: `Nee: ${money(cc, duo)} voor een iPhone Duo 256GB is het bedrag vóór belasting. De provincie van de afhaalwinkel rekent daarna GST, HST of een eigen omzetbelasting; Alberta zit met 5% het laagst, Quebec met ${pct(L, 14.975)} het hoogst.` };
  }
  const r = includedRate(COUNTRIES[cc]);
  return r == null
    ? { q: "Komt er in Hongkong belasting bij als je een iPhone afhaalt?", a: `Er komt niets bij. Hongkong kent geen btw en geen omzetbelasting, dus een iPhone Duo 256GB kost aan de balie gewoon de catalogusprijs van ${money(cc, duo)}.` }
    : { q: `Zit de ${pct(L, r)} ${taxWord(cc)} al in wat apple.com ${inC(cc)} vraagt?`, a: `Ja, die zit erin: de ${money(cc, duo)} voor een iPhone Duo 256GB bevat ${pct(L, r)} ${taxWord(cc)}, dus aan de afhaalbalie betaal je geen extra belasting.` };
}

/* ------------------------------------------------------------------ region / city pages */

function placeTitle(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const w = placeLabel(i.cc, placeName(i));
  if (n === 1) return fitT([`Apple Store in ${w}: iPhone Duo in het schap?`, `Apple Store in ${w}: iPhones om af te halen`, `Apple Store ${w}: iPhone-schap`]);
  return fitT([
    `${n} Apple Stores in ${w}: iPhone Duo in het schap?`,
    `Apple Stores in ${w}: iPhone Duo-schap per winkel`,
    `Apple Stores in ${w}: afhaal-iPhones vandaag`,
    `Apple Stores ${w}: iPhone-schap`,
  ]);
}

/** The description's price clause. */
function priceBit(cc: CountryCode, region?: string): string {
  const duo = CC.priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") { const t = region ? withProvinceTax(duo, region) : null; return t ? `, grofweg ${money(cc, t.total)} na belasting` : `, ${money(cc, duo)} vóór belasting`; }
  const r = includedRate(COUNTRIES[cc]);
  return r == null ? `, ${money(cc, duo)}` : `, ${money(cc, duo)} met ${taxWord(cc)}`;
}

const shelfWord = (v: number) => (v > 0 ? "in het schap" : "uit het schap");

function placeDescription(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const w = placeLabel(i.cc, placeName(i));
  if (n === 1) {
    const one = appleOf(i.stores[0]);
    return fitT([
      `${one} in ${w}: iPhone Duo ${shelfWord(i.stockNow.duo)}, 18 Pro Max ${shelfWord(i.stockNow["18-pro-max"])}. Schapstatus en rentree-uren${priceBit(i.cc, i.region)}.`,
      `${one} in ${w}: afhaal-iPhones in het schap en de uren van eerdere rentrees.`,
    ], 155);
  }
  return fitT([
    `${cnt(n, "Apple Store", "Apple Stores")} in ${w}: iPhone Duo in het schap bij ${n$(i.stockNow.duo)}, 18 Pro Max bij ${n$(i.stockNow["18-pro-max"])}. Per winkel, met rentree-uren${priceBit(i.cc, i.region)}.`,
    `${cnt(n, "Apple Store", "Apple Stores")} in ${w}: Duo in het schap bij ${n$(i.stockNow.duo)}, 18 Pro Max bij ${n$(i.stockNow["18-pro-max"])}. Per winkel, met rentree-uren.`,
  ], 155);
}

/** The opening line: the place's store count, then each model's shelf count at the latest observation. */
function placeIntro(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const w = placeName(i);
  if (n === 1) return `In ${w} staat precies één Apple Store in het logboek: **${appleOf(i.stores[0])}**. Laatste waarneming: iPhone Duo **${shelfWord(i.stockNow.duo)}**, 18 Pro Max **${shelfWord(i.stockNow["18-pro-max"])}**, 18 Pro **${shelfWord(i.stockNow["18-pro"])}**.`;
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? ` (${cnt(i.cities, "stad", "steden")})` : "";
  return `${w}${cities} telt **${cnt(n, "Apple Store", "Apple Stores")}** in het logboek. Laatste waarneming, winkels met het model in het schap: Duo **${n$(i.stockNow.duo)}** · 18 Pro Max **${n$(i.stockNow["18-pro-max"])}** · 18 Pro **${n$(i.stockNow["18-pro"])}**.`;
}

/** The scarcest configurations of a model across the place's stores (colour names in Dutch). */
function scarcest(i: IntlPlaceInput, model: ModelKey, k = 2): { label: string; stores: number }[] {
  return CC.scarcest(i, model, 99).map((x) => {
    const cut = x.label.indexOf(" ");
    return { label: cut < 0 ? x.label : `${x.label.slice(0, cut)} ${colorLabel(x.label.slice(cut + 1), L)}`, stores: x.stores };
  }).slice(0, k);
}

function duoLead(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const have = CC.duoStoresNow(i);
  const st = i.duo;
  const since = sinceWhen();
  const returns = cnt(st.month, "bevestigde rentree", "bevestigde rentrees");
  if (n === 1) {
    const one = appleOf(i.stores[0]);
    if (have.length > 0) return `Bij de laatste waarneming lag de iPhone Duo in het schap bij **${one}**.`;
    if (st.month > 0) return `De iPhone Duo is bij **${one}** nu uit het schap; het logboek telt wel **${returns}** ${since}.`;
    return `De iPhone Duo is bij **${one}** uit het schap, en het logboek toont ${since} geen enkele bevestigde rentree.`;
  }
  if (have.length > 0) return `In het schap bij de laatste waarneming: ${list(L, have.map(appleOf), 4, (k) => `${n$(k)} meer`)} (**${n$(have.length)}/${n$(n)} winkels**).`;
  if (st.month > 0) return `De Duo is voorlopig uit het schap in alle **${n$(n)} winkels**; het logboek bevat wel **${returns}** ${since}.`;
  return `De Duo is uit het schap in alle **${n$(n)} winkels**, en het logboek toont ${since} geen bevestigde rentree.`;
}

function duoPoints(i: IntlPlaceInput, w: string, alert: string): Block[] {
  const n = i.stores.length;
  const have = CC.duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (have.length > 0 && st.month > 0) items.push(`**${sinceShort()}:** ${cnt(st.month, "Duo-rentree", "Duo-rentrees")} ${n === 1 ? "in deze winkel" : "verspreid over deze winkels"}`);
  if (st.lastRestock && last) items.push(`**Jongste rentree:** ${appleOf(last)}, ${whenIn(i.cc, st.lastRestock.at)}`);
  if (st.medianMs != null) items.push(`**Mediane schaptijd:** grofweg ${dur(st.medianMs)} tussen rentree en uit het schap`);
  const reach = n <= 3 ? (n === 2 ? "twee" : "drie") : `${Math.min(n, 5)} dichtstbijzijnde`;
  items.push(n === 1 ? `**Volglijst:** [volg de iPhone Duo bij ${appleOf(i.stores[0])}](${alert})` : `**Volglijst:** [volg de iPhone Duo in ${w}](${alert}) bij de ${reach} winkels die je kunt bereiken`);
  items.push("**Omvang van een melding:** één winkel en één exacte uitvoering; de melding volgt op gedetecteerde beschikbaarheid na synchronisatie, met wisselende vertraging");
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: "**Nog geen rentree genoteerd:** zet de uitvoering die je wilt op een volglijst en vergelijk de laatste waarneming voordat je bestelt." });
  blocks.push({ t: "ul", items });
  return blocks;
}

function placeSections(i: IntlPlaceInput): KeywordSection[] {
  const n = i.stores.length;
  const w = placeName(i);
  const alert = alertHref({ model: "duo", state: i.regionSlug, city: i.kind === "city" ? i.citySlug : undefined, country: i.cc });
  const scarce = scarcest(i, "18-pro-max");
  const pm = catalogFor("18-pro-max", i.cc).length;
  const pmNow = i.stockNow["18-pro-max"];
  return [
    {
      id: "iphone-duo",
      h2: n === 1 ? `${w}: ligt de iPhone Duo in het schap bij ${appleOf(i.stores[0])}?` : `${w}: waar de iPhone Duo in het schap ligt`,
      lead: duoLead(i),
      blocks: duoPoints(i, w, alert),
    },
    {
      id: "iphone-18-pro-max",
      h2: n === 1 ? `${w}: de 18 Pro Max in het schap?` : `${w}: de 18 Pro Max, winkel voor winkel`,
      lead: n === 1
        ? `**${appleOf(i.stores[0])}** heeft de iPhone 18 Pro Max ${pmNow ? "in het schap" : "nu uit het schap"}; van de ${n$(pm)} uitvoeringen staat **${pct(L, CC.pairsPct(i, "18-pro-max"))}** klaar om af te halen.`
        : `De Pro Max ligt in het schap bij **${n$(pmNow)}/${n$(n)} winkels**; tel je elke combinatie van winkel × uitvoering (${n$(n * pm)}), dan staat **${pct(L, CC.pairsPct(i, "18-pro-max"))}** in het schap.`,
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**Dunste keuze nu:** ${list(L, scarce.map((x) => `${x.label}, ${n === 1 ? shelfWord(x.stores) : `${n$(x.stores)}/${n$(n)} winkels`}`))}`] : []),
        `**18 Pro ernaast:** ${n === 1 ? shelfWord(i.stockNow["18-pro"]) : `${n$(i.stockNow["18-pro"])}/${n$(n)} winkels`}, ${pct(L, CC.pairsPct(i, "18-pro"))} van de ${n === 1 ? "uitvoeringen" : "combinaties"} in het schap`,
        `**Pro Max-rentrees, ${sinceShort().toLowerCase()}:** ${i.max.month ? cnt(i.max.month, "bevestigde rentree", "bevestigde rentrees") : "geen genoteerd"}`,
        ...(i.max.medianMs != null ? [`**Mediane schaptijd:** grofweg ${dur(i.max.medianMs)} voor een teruggekeerde Pro Max`] : []),
      ] }],
    },
    priceSection(i.cc, w, i.cc === "ca" ? i.region : undefined),
  ];
}

/* ------------------------------------------------------------------ country: store index and home */

function storesIndexTitle(cc: CountryCode): string {
  const n = storesOf(cc).length;
  const w = land(cc);
  return fitT([
    `Apple Store ${w}: ${n === 1 ? "één vestiging" : `${n} vestigingen`} en hun iPhone-schap`,
    `Apple Stores ${inC(cc)}: iPhone Duo in het schap?`,
    `Apple Stores ${w}: iPhone-schap`,
  ], 70);
}

function homeTitle(cc: CountryCode): string {
  const n = storesOf(cc).length;
  const w = land(cc);
  return fitT([
    n === 1 ? `Apple Store ${w}: iPhone Duo in het schap of niet` : `iPhone Duo ${inC(cc)}: het schap van ${n} Apple Stores`,
    `iPhone-schap ${w}: ${cnt(n, "Apple Store", "Apple Stores")}`,
    `iPhone-schap ${w}: waarnemingslogboek`,
  ]);
}

function homeH1(cc: CountryCode): string {
  const n = storesOf(cc).length;
  return n === 1 ? `Afhaallogboek voor de Apple Store ${inC(cc)}` : `Afhaallogboek voor ${n$(n)} Apple Stores ${inC(cc)}`;
}

/** "in heel Nederland", "in heel de Verenigde Staten"; a one-store country stays "in België". */
const acrossC = (cc: CountryCode) => (storesOf(cc).length === 1 ? inC(cc) : `in heel ${ARTICLE[cc] ?? ""}${land(cc)}`);

/** The coverage phrase: "3 Apple Stores in heel Nederland" / "de enige vestiging van Apple in België". */
function allStoresPhrase(cc: CountryCode): string {
  const n = storesOf(cc).length;
  return n === 1 ? `de enige vestiging van Apple ${inC(cc)}` : `${n$(n)} Apple Stores ${acrossC(cc)}`;
}

/** Where a country's stores are: "verspreid over 22 steden in 6 provincies". */
function spreadPhrase(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const regions = statesWithStores(cc);
  const cities = citiesWithStores(cc);
  const n = storesOf(cc).length;
  if (n === 1) return `gevestigd in ${cityLabel(cc, cities[0].name, L)}`;
  if (cities.length === 1) return `stuk voor stuk in ${cityLabel(cc, cities[0].name, L)}`;
  if (!c.regionNoun || regions.length === 1) return `verspreid over ${cnt(cities.length, "stad", "steden")}`;
  return `verspreid over ${cnt(cities.length, "stad", "steden")} in ${n$(regions.length)} ${noun(cc, regions.length !== 1)}`;
}

function modelPageTitles(cc: CountryCode, model: ModelKey): { title: string; h2: string[] } {
  const m = modelByKey(model)!;
  const n = storesOf(cc).length;
  const all = n === 1 ? "de Apple Store" : n === 2 ? "twee Apple Stores" : `${n} Apple Stores`;
  return {
    title: fitT([`${m.name} ${inC(cc)}: in het schap bij ${all}?`, `${m.name} ${inC(cc)}: schapstatus`, `${m.name}-schap ${inC(cc)}`], 70),
    h2: [`${m.name} ${inC(cc)}: in welke schappen hij nu ligt`, priceSection(cc, land(cc), undefined, model).h2],
  };
}

function modelIntro(cc: CountryCode, model: ModelKey, inStock: number): string {
  const m = modelByKey(model)!;
  const n = storesOf(cc).length;
  const r = CC.priceRange(cc, model);
  const priceTxt = cc === "ca" ? `**${money(cc, r.low)}** vóór belasting` : `**${money(cc, r.low)}**, ${taxNote(cc)}`;
  const lead = inStock === 0
    ? `De ${m.name} is uit het schap in ${n === 1 ? "de Apple Store" : `alle ${n$(n)} Apple Stores`} ${inC(cc)}`
    : `De ${m.name} ligt in het schap bij **${n$(inStock)}/${n$(n)}** Apple Stores ${inC(cc)}`;
  return `${lead}, volgens de getoonde waarnemingstijd; catalogusprijzen vanaf ${priceTxt}.`;
}

function modelDescription(cc: CountryCode, model: ModelKey, inStock: number): string {
  const m = modelByKey(model)!;
  const n = storesOf(cc).length;
  const r = CC.priceRange(cc, model);
  const now = n === 1 ? (inStock ? "In het schap bij de Apple Store." : "Uit het schap bij de Apple Store.") : `In het schap bij ${n$(inStock)}/${n$(n)} Apple Stores.`;
  return fitT([
    `${m.name} ${inC(cc)}: ${now} Per winkel en uitvoering, vanaf ${money(cc, r.low)}${cc === "ca" ? " vóór belasting" : ""}, met rentree-uren.`,
    `${m.name} ${inC(cc)}: ${now} Schap per winkel en uitvoering, rentree-uren en meldingen.`,
  ], 155);
}

function modelRows(cc: CountryCode, storesNow: Record<ModelKey, number>, restocks: Record<ModelKey, number>): string[][] {
  const prefix = cc === "us" ? "" : `/${cc}`;
  return MODELS.map((m) => [`[${m.name}](${prefix}/stock/${m.slug})`, n$(catalogFor(m.key, cc).length), n$(storesNow[m.key] ?? 0), n$(restocks[m.key] ?? 0)]);
}

function homeDescription(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const n = storesOf(cc).length;
  const cur = c.currency === "EUR" ? "euro" : c.currency;
  const where = n === 1 ? `bij ${appleOf(storesOf(cc)[0])}` : `in de ${n$(n)} Apple Stores ${inC(cc)}`;
  return fitT([
    `Ligt de iPhone Duo, 18 Pro of Pro Max in het schap ${where}? Waarnemingslogboek met rentree-uren, prijzen in ${cur} en pushmeldingen.`,
    `Ligt de iPhone Duo, 18 Pro of Pro Max in het schap ${where}? Logboek met rentree-uren, prijzen en pushmeldingen.`,
    `Ligt de iPhone Duo, 18 Pro of Pro Max in het schap ${where}? Logboek en pushmeldingen.`,
  ], 160);
}

function homeIntro(cc: CountryCode): string {
  const n = storesOf(cc).length;
  if (n === 1) {
    const s = appleOf(storesOf(cc)[0]);
    return `Laatste schaptelling bij ${s}: **{{duo.pairsNow}}/{{duo.pairsTotal}}** iPhone Duo-uitvoeringen in het schap, iPhone 18 Pro **{{pro.pairsNow}}**, iPhone 18 Pro Max **{{pm.pairsNow}}**.`;
  }
  return `Laatste schaptelling ${inC(cc)}: iPhone Duo bij **{{duo.storesNow}}/${n$(n)}** Apple Stores, 18 Pro bij **{{pro.storesNow}}**, 18 Pro Max bij **{{pm.storesNow}}**.`;
}

/** Where people look for a store that isn't there (Google Ads: "apple store rotterdam" 1,600, "apple store utrecht" 1,300 a month). */
const NO_STORE_HERE: Partial<Record<CountryCode, string>> = {
  nl: "**Rotterdam en Utrecht hebben geen Apple Store:** wie in Rotterdam woont, zit het dichtst bij Apple Den Haag (circa 20 km in vogelvlucht); vanuit Utrecht is Apple Amsterdam (circa 35 km) de kortste rit",
  be: "**Antwerpen en Gent hebben geen Apple Store:** de enige Belgische vestiging is Apple Brussels; vanuit Antwerpen is dat in vogelvlucht circa 45 km, vanuit Gent circa 50 km",
};

function homeSections(i: HomeCopyInput): KeywordSection[] {
  const cc = i.cc;
  const c = COUNTRIES[cc];
  const n = storesOf(cc).length;
  const stores = storesOf(cc);
  const unitWord = c.unit === "mi" ? "mijl" : "kilometers";
  return [
    {
      id: "iphone-stock",
      h2: `Het schap ${inC(cc)}, winkel voor winkel: Duo, 18 Pro, Pro Max`,
      lead: `ShelfSpring noteert de afhaalvermeldingen van apple.com voor elke uitvoering bij ${allStoresPhrase(cc)}, via een gesynchroniseerde voorraadfeed, leesbaar per winkel${n > 1 ? `, per ${c.regionNoun ? noun(cc) : "stad"}` : ""} en per uitvoering.`,
      blocks: [
        { t: "table", head: ["iPhone", "Gevolgde uitvoeringen", "Winkels met hem in het schap", "Rentrees in het logboek"], rows: modelRows(cc, i.storesNow, i.restocks), caption: `Reikwijdte van het logboek ${inC(cc)}, waargenomen {{asOf}}` },
        { t: "ul", items: [
          `**Reikwijdte:** ${spreadPhrase(cc)}; artikelnummers en catalogusprijzen volgen Apples winkel voor ${land(cc)}`,
          "**Lees het tijdstempel:** elk abonnement gebruikt dezelfde voorraadfeed; verzamelen en synchroniseren kunnen vertraging geven",
          "**Bevestiging bij de bron:** een genoteerde wijziging moet eerst bevestigd zijn; een melding reserveert geen voorraad",
          `**Elke bevestigde wijziging** gaat naar de [rentreelog](${i.restocksPath}), de bron van de uurgrafieken op ${i.index?.indexable ? `[elke winkelpagina](${i.index.path})` : "de winkelpagina"}`,
          ...(NO_STORE_HERE[cc] ? [NO_STORE_HERE[cc]!] : []),
        ] },
        { t: "img", id: "phone-notification" },
      ],
    },
    priceSection(cc, land(cc)),
    {
      id: "alerts",
      h2: `Een volglijst voor afhalen in de Apple Store ${inC(cc)}`,
      lead: `Maak een haalbare shortlist om af te halen: kies Apple Store${n === 1 ? "" : "s"} die je kunt bereiken en uitvoeringen die je wilt. Rondkijken blijft gratis; betaalde meldingen laten het je weten zodra een passende rentree ShelfSpring bereikt. De bezorgtijd wisselt.`,
      blocks: [
        { t: "ol", items: [
          "Open **Volgen** en stel model, capaciteit en afwerking in.",
          n === 1 ? `Selecteer de winkel: ${appleOf(stores[0])} in ${cityLabel(cc, stores[0].city, L)}.` : `Selecteer winkels binnen bereik; de lijst begint bij de dichtstbijzijnde, telkens met de geschatte afstand (${unitWord}) en rijtijd via de weg.`,
          "Installeer ShelfSpring op een iPhone vanuit Safari op het beginscherm en zet meldingen aan ([installatiegids](/install)).",
          "Ga vanuit een melding naar apple.com, controleer of de winkel hem nog toont en kies daar afhalen in de winkel.",
        ] },
        { t: "table", head: ["Volglijst", "Per maand (USD)", "Regels winkel × uitvoering"], rows: [["Plus", "$5", "10"], ["Pro", "$10", "20"], ["Max", "$20", "50"]], caption: "Elke regel volgt één winkel en één exacte uitvoering; het logboek lezen is gratis ([abonnementen](/pricing))" },
        { t: "note", text: "**Kies op basis van bewijs:** vergelijk actuele vermeldingen, steekproefgroottes en recente rentrees voordat je bepaalt welke winkels op je volglijst horen." },
        { t: "img", id: "apple-store-pickup-counter" },
      ],
    },
  ];
}

function homeFaq(cc: CountryCode, rt: RestockTimesBrief): Faq[] {
  const n = storesOf(cc).length;
  const p = cc === "us" ? "" : `/${cc}`;
  const one = n === 1 ? appleOf(storesOf(cc)[0]) : null;
  const ledger = `[volledig overzicht per uur en weekdag](${rt.path})`;
  const when = rt.n === 0
    ? `Het geïmporteerde register vanaf 2 november bevat nog geen bevestigde rentree; [het Duo-rentreeregister ${inC(cc)}](${rt.path}) zet ze straks allemaal op winkeltijd en weekdag.`
    : rt.peakHour != null
      ? `Ze clusteren rond **${hour(L, rt.peakHour, true)} winkeltijd**, op basis van ${cnt(rt.n, "bevestigde rentree", "bevestigde rentrees")} bij ${n$(rt.stores)}/${n$(rt.storesTotal)} winkels in het register vanaf 2 november (${ledger}).`
      : `Het register vanaf 2 november telt ${cnt(rt.n, "bevestigde rentree", "bevestigde rentrees")} bij ${n$(rt.stores)}/${n$(rt.storesTotal)} winkels, verspreid over te weinig dagen voor een vast uur (${ledger}).`;
  return [
    one
      ? { q: `Ligt de iPhone Duo nu in het schap bij ${one}?`, a: `Bij de laatste waarneming ({{asOf}}): {{duo.pairsNow}}/{{duo.pairsTotal}} uitvoeringen. [Het Duo-overzicht ${inC(cc)}](${p}/stock/iphone-duo) toont elke uitvoering met een eigen tijdstempel.` }
      : { q: `Waar ${inC(cc)} ligt de iPhone Duo op dit moment in het schap?`, a: `Bij {{duo.storesNow}}/${n$(n)} winkels volgens de laatste waarneming ({{asOf}}); [het Duo-overzicht ${inC(cc)}](${p}/stock/iphone-duo) toont elke winkel en uitvoering met een eigen tijdstempel.` },
    { q: `Op welk uur keert de iPhone Duo ${inC(cc)} terug in het schap?`, a: when },
    { q: "Wanneer bereikt een melding mij?", a: `Zodra een rentree in de gesynchroniseerde feed ${inC(cc)} opduikt. Verzamelen, synchroniseren, het netwerk en de instellingen van je toestel voegen elk wat vertraging toe, en elk abonnement leest dezelfde feed: controleer de vermelding bij Apple voordat je vertrekt.` },
    { q: "Wat is gratis en wat kost geld?", a: "Het logboek, de kaart en de rentreelog lezen is gratis. Meldingsregels: Plus ($5 per maand, 10 regels), Pro ($10, 20) en Max ($20, 50), afgerekend in Amerikaanse dollars en op te zeggen vanuit je account ([abonnementen](/pricing))." },
    taxFaq(cc, land(cc)),
    { q: "Houdt ShelfSpring een telefoon voor me apart?", a: `Dat kan niet: een melding wijst naar een gedetecteerde vermelding, en alleen een bestelling die je op apple.com plaatst en bevestigd krijgt, legt de telefoon vast ([Apples hulp bij afhalen](${sources(cc as Exclude<CountryCode, "us">).pickupHelp.url})).` },
  ];
}

const homeLabels: Dict["place"]["home"] = {
  appName: (cc: CountryCode) => `ShelfSpring afhaallogboek ${land(cc)}`,
  offer: "Logboek, kaart en rentreelog zijn gratis; meldingsabonnementen vanaf $5 per maand",
  itemList: (cc: CountryCode) => `Vestigingen van Apple ${inC(cc)}`,
  restockTimesChip: "Uren van eerdere rentrees",
  storesByRegion: (cc: CountryCode) => `Bladeren per ${noun(cc)}`,
  browse: (cc: CountryCode) => `Meer uit het logboek ${inC(cc)}`,
  selloutH2: (cc: CountryCode) => `Hoe lang bleef een teruggekeerde iPhone ${inC(cc)} in het schap?`,
  selloutLabel: (cc: CountryCode) => acrossC(cc),
  last24Label: (cc: CountryCode) => acrossC(cc),
  newsroom: "Apple Newsroom: iPhone Duo verkrijgbaar in Apple Stores wereldwijd (23 oktober 2026)",
};

/**
 * Store page <title> and H1: "Apple Den Haag: iPhones in het schap, afhalen & openingstijden". People search the store's
 * name as they say it ("apple brussel"), so a store named after its city reads with the Dutch city name.
 */
function storeTitle(s: Store, region?: string): string {
  const cc = s.country ?? "us";
  const city = cityLabel(cc, s.city, L);
  const name = s.name === s.city && city !== s.city ? `Apple ${city}` : appleOf(s);
  const shown = region && !name.toLowerCase().includes(region.toLowerCase()) && !s.name.toLowerCase().includes(region.toLowerCase()) ? region : null;
  const r = shown ? ` (${shown})` : "";
  return fitT([
    `${name}${r}: iPhones in het schap, afhalen & openingstijden`,
    `${name}${r}: iPhone-schap, afhalen & openingstijden`,
    `${name}${r}: iPhone-schap vandaag & openingstijden`,
    `${name}: iPhone-schap, afhalen & openingstijden`,
    `${name}: iPhone-schap & openingstijden`,
    `${name}: iPhone-schap`,
    `${name} – schap`,
  ]);
}

/** Apple's pickup help and store list in Dutch (NL: apple.com/nl; Belgium: the be-nl store and the benl store list). */
function sources(code: Exclude<CountryCode, "us">): { pickupHelp: Source; storeList: Source; tax: Source } {
  if (code === "nl") return {
    pickupHelp: { label: "Apple: levering en afhalen (Nederland), met wat je naar de winkel meebrengt", url: "https://www.apple.com/nl/shop/help/shipping_delivery" },
    storeList: { label: "Apple: overzicht van alle Apple Stores in Nederland", url: "https://www.apple.com/nl/retail/storelist/" },
    tax: taxSource(code),
  };
  if (code === "be") return {
    pickupHelp: { label: "Apple: levering en afhalen (België), met wat je naar de winkel meebrengt", url: "https://www.apple.com/be-nl/shop/help/shipping_delivery" },
    storeList: { label: "Apple: overzicht van de Apple Store in België", url: "https://www.apple.com/benl/retail/storelist/" },
    tax: taxSource(code),
  };
  return { pickupHelp: pickupHelp(code), storeList: storeListSource(code), tax: TAX_SOURCES[code] };
}

const basePlace: Dict["place"] = {
  sinceWhen,
  placeLabel,
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
  sources,
};


export const place: Dict["place"] = withShelfPlace("nl", basePlace);
