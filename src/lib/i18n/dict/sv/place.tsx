import { withShelfPlace } from "@/lib/seo/localizedCopy";
/**
 * Swedish strings: place — the copy builders of a country's page tree (English: lib/seo/countryCopy.ts), written
 * for /sv-se/…: titles that lead with what Swedes type ("apple store sverige", "apple mall of scandinavia",
 * "iphone duo pris"), Answer-First intros, keyword sections, the price/tax section (moms ingår) and FAQs.
 * Built for Sweden; the other countries' branches are kept so the functions stay complete.
 */
import { MODELS, catalogFor, citiesWithStores, statesWithStores, storesOf, modelByKey, type ModelKey, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import { priceOf, priceRange, scarcest, pairsPct, duoStoresNow, type IntlPlaceInput, type HomeCopyInput, type RestockTimesBrief } from "@/lib/seo/countryCopy";
import { CA_PROVINCE_TAX, CA_TAX_SOURCE, TAX_SOURCES, beforeTax, includedRate, pickupHelp, storeListSource, withProvinceTax } from "@/content/country-tax";
import { alertHref, type FaqItem } from "@/lib/seo/enrich";
import { stamp } from "@/lib/i18n/format";
import type { Block, Faq, Source } from "@/lib/content/types";
import type { KeywordSection } from "@/components/content/KeywordSections";
import type { Dict } from "../en";
import { SV, about, apple, color, fit, klock, kr, land, n, noun, pc, pl, taxNote, taxWord, words } from "./util";

const TRACKING_START = Date.parse("2026-11-02T00:00:00Z");

/** "sedan registret öppnades den 2 november" while the 30-day window reaches back to the start, else "under de senaste 30 dagarna". */
function sinceWhen(now = Date.now()): string {
  return now - TRACKING_START < 30 * 86400_000 ? "sedan registret öppnades den 2 november" : "under de senaste 30 dagarna";
}

/** "2 nov. 15:04 CET" in the country's zone. */
function whenIn(cc: CountryCode, iso: string | Date): string {
  return stamp(SV, iso, COUNTRIES[cc].timeZone, true);
}

/** The Stockholm stores: there is no Apple Store inside Stockholm city, Solna and Täby are where Stockholm shops. */
const STOCKHOLM = new Set(["R626", "R505"]);

/* ------------------------------------------------------------------ sources */

/** Apple's Swedish pages, and Your Europe's VAT page in Swedish. */
function sources(code: Exclude<CountryCode, "us">): { pickupHelp: Source; storeList: Source; tax: Source } {
  const help = pickupHelp(code);
  const list = storeListSource(code);
  const tax: Source = code === "se"
    ? { label: "Your Europe (EU): momsregler och momssatser", url: "https://europa.eu/youreurope/business/taxation/vat/vat-rules-rates/index_sv.htm" }
    : TAX_SOURCES[code];
  return {
    pickupHelp: { label: `Apples supportsida om leverans och hämtning i butik, ${land(code)}: legitimation och orderbekräftelse vid disken`, url: help.url },
    storeList: { label: `Apples förteckning över butiker, ${land(code)}`, url: list.url },
    tax,
  };
}

/* ------------------------------------------------------------------ tax */

function taxSentence(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    if (t) return `iPhone Duo 256GB listas hos Apple för ${kr(cc, duo)} före skatt; i ${region} tillkommer ${pc(t.rate)} ${CA_PROVINCE_TAX[region!].label}, totalt runt ${kr(cc, t.total)}.`;
    return `iPhone Duo 256GB listas hos Apple för ${kr(cc, duo)} före skatt; provinsen där du hämtar lägger på 5–15 %.`;
  }
  const r = includedRate(c);
  if (r == null) return `iPhone Duo 256GB: ${kr(cc, duo)}. Hongkong tar inte ut moms, så samma belopp gäller vid disken.`;
  return `iPhone Duo 256GB: ${kr(cc, duo)} i ${land(cc)}, med ${pc(r)} ${taxWord(c)} redan inräknad – samma belopp gäller när du hämtar i butik.`;
}

const PRICE_ROWS: [ModelKey, string][] = [["duo", "256GB"], ["duo", "1TB"], ["18-pro-max", "256GB"], ["18-pro-max", "1TB"], ["18-pro", "256GB"]];

function priceSection(cc: CountryCode, placeName: string, region?: string, model: ModelKey = "duo"): KeywordSection {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const base = priceOf(cc, model) ?? 0;
  const src = cc === "us" ? TAX_SOURCES.ca : sources(cc).tax;
  const shop = c.buyPath ?? c.shopPath;
  const rows: [string, number][] = PRICE_ROWS.flatMap(([k, st]) => { const p = priceOf(cc, k, st); return p == null ? [] : [[`${modelByKey(k)!.name} ${st}`, p] as [string, number]]; });
  if (cc === "ca") {
    const t = region ? CA_PROVINCE_TAX[region] : undefined;
    if (t) {
      return {
        id: "price-with-tax",
        h2: `Vad kostar ${m.name} med skatt i ${placeName}?`,
        lead: `Apple listar ${m.name} 256GB för **${kr(cc, base)} före skatt**. I ${region} tillkommer ${pc(t.total)} ${t.label}, så en hämtning i ${placeName} landar runt **${kr(cc, withProvinceTax(base, region!)!.total)}**.`,
        blocks: [
          { t: "note", text: "**Skattesatsen följer butiken:** det är provinsen där du hämtar som räknas, inte var du bor." },
          { t: "table", head: ["iPhone", "Listpris på apple.com", `Inkl. ${pc(t.total)} ${t.label}`], rows: rows.map(([label, p]) => [label, kr(cc, p), kr(cc, withProvinceTax(p, region!)!.total)]), caption: `${region}: Apples listpris i Kanada med ${t.label} (${pc(t.total)}) pålagd`, source: `[${CA_TAX_SOURCE.label}](${CA_TAX_SOURCE.url}); listpriser från apple.com/ca` },
        ],
      };
    }
    const provinces = Object.keys(CA_PROVINCE_TAX).filter((p) => storesOf("ca").some((s) => s.state === p));
    return {
      id: "price-with-tax",
      h2: `Vad kostar ${m.name} med skatt i Kanada? Provins för provins`,
      lead: `Apple listar ${m.name} 256GB för **${kr(cc, base)}** före skatt; ovanpå det lägger hämtningsprovinsen ${pc(5)} till ${pc(15)}.`,
      blocks: [{
        t: "table",
        head: ["Provins", "Skatt", "Sats", `${m.short} 256GB inkl. skatt`],
        rows: provinces.map((p) => [p, CA_PROVINCE_TAX[p].label, pc(CA_PROVINCE_TAX[p].total), kr(cc, withProvinceTax(base, p)!.total)]),
        caption: "Skatt vid hämtning i butik, i provinser som har en Apple Store",
        source: `[${CA_TAX_SOURCE.label}](${CA_TAX_SOURCE.url}); listpriser från apple.com/ca`,
      }],
    };
  }
  const r = includedRate(c);
  const tw = taxWord(c);
  return {
    id: "price",
    h2: `Vad kostar ${m.name} i ${land(cc)}? ${kr(cc, base)}, ${taxNote(c)}`,
    lead: r == null
      ? `${m.name} 256GB listas för **${kr(cc, base)}** på apple.com, och det är också summan vid disken i ${placeName}: Hongkong tar **inte ut någon moms**.`
      : `${m.name} 256GB: **${kr(cc, base)}** i ${land(cc)}, där **${pc(r)} ${tw} redan är inräknad** (${kr(cc, beforeTax(c, base))} exklusive ${tw}). Hämtar du i ${placeName} tillkommer ingenting.`,
    blocks: [{
      t: "table",
      head: r == null ? ["iPhone", "Listpris på apple.com"] : ["iPhone", "Listpris på apple.com", `Exkl. ${pc(r)} ${tw}`],
      rows: rows.map(([label, p]) => (r == null ? [label, kr(cc, p)] : [label, kr(cc, p), kr(cc, beforeTax(c, p))])),
      caption: `Apples listpriser i ${land(cc)}${r == null ? "" : `, inklusive ${tw}`}`,
      source: `[${src.label}](${src.url}); listpriser från apple.com/${shop}`,
    }],
  };
}

function taxFaq(cc: CountryCode, placeName: string, region?: string): FaqItem {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo") ?? 0;
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    return t
      ? { q: `Vad landar iPhone Duo på med skatt i ${placeName}?`, a: `Runt ${kr(cc, t.total)} för 256GB: Apples listpris ${kr(cc, duo)} plus ${pc(t.rate)} ${CA_PROVINCE_TAX[region!].label} i ${region}, som tas ut på hämtningsorten.` }
      : { q: "Är skatten inräknad i Apples priser i Kanada?", a: `Nej. iPhone Duo 256GB listas för ${kr(cc, duo)} före skatt; butikens provins avgör om GST, HST eller provinsskatt läggs på – från ${pc(5)} i Alberta upp till ${pc(14.975)} i Québec.` };
  }
  const r = includedRate(c);
  return r == null
    ? { q: "Tar Hongkong ut moms på en iPhone?", a: `Nej. Utan moms i Hongkong betalar du ${kr(cc, duo)} för iPhone Duo 256GB vid hämtning – samma siffra som på apple.com.` }
    : { q: `Är ${taxWord(c) === "GST" ? "GST:n" : `${taxWord(c)}en`} redan inräknad i apple.com-priset i ${land(cc)}?`, a: `Ja – listpriset ${kr(cc, duo)} för iPhone Duo 256GB innehåller ${pc(r)} ${taxWord(c)}, och vid hämtning i butik läggs inget på.` };
}

/* ------------------------------------------------------------------ region / city pages */

function placeTitle(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = i.name;
  return fit([
    `Apple Store ${w}: iPhone Duo i lager i ${k === 2 ? "båda butikerna" : `alla ${k} butiker`}`,
    `Apple Store ${w}: iPhone Duo i lager, live`,
    `Apple Store ${w}: iPhone i lager idag`,
    `Apple Store ${w}: iPhone i lager`,
  ]);
}

function priceBit(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") { const t = region ? withProvinceTax(duo, region) : null; return t ? `, ca ${kr(cc, t.total)} med skatt` : `, ${kr(cc, duo)} utan skatt`; }
  return `, ${kr(cc, duo)} ${taxNote(c)}`;
}

function placeDescription(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = i.name;
  return fit([
    `${k} Apple Store-butiker i ${w}: ${i.stockNow.duo} har iPhone Duo att hämta nu, ${i.stockNow["18-pro-max"]} har 18 Pro Max. Lager live per butik, påfyllningstider${priceBit(i.cc, i.region)}.`,
    `${k} Apple Store-butiker i ${w}: ${i.stockNow.duo} har iPhone Duo att hämta nu, ${i.stockNow["18-pro-max"]} har 18 Pro Max. Live per butik, påfyllningstider.`,
  ], 155);
}

function placeIntro(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? `, i ${pl(i.cities, "stad", "städer")}` : "";
  return `${i.name}${cities} · **${pl(k, "Apple Store", "Apple Store-butiker")}**. På hyllan just nu: iPhone Duo i **${i.stockNow.duo}**, 18 Pro Max i **${i.stockNow["18-pro-max"]}**, 18 Pro i **${i.stockNow["18-pro"]}**.`;
}

function duoLead(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  if (have.length > 0) return `iPhone Duo står på hyllan i **${have.length} av ${k} butiker**: ${words(have.map((s) => apple(s)), 4)}.`;
  if (st.month > 0) return `Hyllorna är tomma på iPhone Duo i alla **${k} butikerna** just nu, trots **${pl(st.month, "återkomst", "återkomster")}** ${sinceWhen()}.`;
  return `Hyllorna är tomma på iPhone Duo i alla **${k} butikerna** just nu, och registret har ingen återkomst av Duo ${sinceWhen()}.`;
}

function duoPoints(i: IntlPlaceInput, w: string, alert: string): Block[] {
  const k = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (have.length > 0 && st.month > 0) items.push(`**I registret ${sinceWhen()}:** ${pl(st.month, "återkomst av Duo", "återkomster av Duo")} i butikerna här`);
  if (st.lastRestock && last) items.push(`**Senaste återkomst:** ${whenIn(i.cc, st.lastRestock.at)} hos ${apple(last)}`);
  if (st.medianMs != null) items.push(`**Median på hyllan:** ${about(st.medianMs)} för en återkommen Duo`);
  items.push(`**Bevakningslistan:** [följ iPhone Duo i ${w}](${alert}) i ${k <= 3 ? "butikerna" : `de ${Math.min(k, 5)} närmaste butikerna`} du realistiskt når`);
  items.push("**En avisering** = en butik × en exakt konfiguration");
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: "**Läget kan vända när som helst:** en avisering bevakar åt dig, så du slipper ladda om apple.com." });
  blocks.push({ t: "ul", items });
  return blocks;
}

/** "256GB Night Sky" (scarcest's English label) → "256GB natthimmel". */
const cfg = (label: string) => { const [st, ...rest] = label.split(" "); return `${st} ${color(rest.join(" "))}`; };

function placeSections(i: IntlPlaceInput): KeywordSection[] {
  const k = i.stores.length;
  const w = i.name;
  const alert = alertHref({ model: "duo", state: i.regionSlug, city: i.kind === "city" ? i.citySlug : undefined, country: i.cc });
  const scarce = scarcest(i, "18-pro-max");
  const pm = catalogFor("18-pro-max", i.cc).length;
  return [
    { id: "iphone-duo", h2: `Var står iPhone Duo på hyllan i ${w}?`, lead: duoLead(i), blocks: duoPoints(i, w, alert) },
    {
      id: "iphone-18-pro-max",
      h2: `iPhone 18 Pro Max i ${w}, butik för butik`,
      lead: `iPhone 18 Pro Max står på hyllan i **${i.stockNow["18-pro-max"]} av ${k} butiker**; **${pc(pairsPct(i, "18-pro-max"))}** av de ${n(k * pm)} paren av butik och konfiguration är listade.`,
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**Glesast på hyllorna:** ${words(scarce.map((x) => `${cfg(x.label)} (${x.stores} av ${k} butiker)`))}`] : []),
        `**iPhone 18 Pro:** på hyllan i ${i.stockNow["18-pro"]} av ${k} butiker, ${pc(pairsPct(i, "18-pro"))} av paren listade`,
        `**I registret ${sinceWhen()}:** ${i.max.month ? pl(i.max.month, "återkomst av 18 Pro Max", "återkomster av 18 Pro Max") : "ingen återkomst av 18 Pro Max än"}`,
        ...(i.max.medianMs != null ? [`**Median på hyllan:** ${about(i.max.medianMs)} för en återkommen Pro Max`] : []),
      ] }],
    },
    priceSection(i.cc, w, i.cc === "ca" ? i.region : undefined),
  ];
}

/* ------------------------------------------------------------------ country: store index and home */

function storesIndexTitle(cc: CountryCode): string {
  const k = storesOf(cc).length;
  const w = land(cc);
  const towns = [...new Set(storesOf(cc).map((s) => (STOCKHOLM.has(s.storeNumber) ? "Stockholm" : s.city)))].sort((a, b) => (a === "Stockholm" ? -1 : b === "Stockholm" ? 1 : a.localeCompare(b, "sv")));
  return fit([
    ...(cc === "se" ? [`Apple Store Sverige: ${towns.join(" & ")} – iPhone Duo i lager live`] : []),
    `Apple Store ${w}: iPhone Duo i lager i ${k === 2 ? "båda butikerna" : `alla ${k} butiker`}`,
    `Apple Store ${w}: iPhone Duo i lager, live`,
    `Apple Store ${w}: iPhone i lager`,
  ], 70);
}

function homeTitle(cc: CountryCode): string {
  const k = storesOf(cc).length;
  const w = land(cc);
  return fit([
    `iPhone Duo i lager i ${w}? Live från ${k === 1 ? "Apple Store" : `alla ${k} Apple Store`}`,
    `iPhone Duo i lager i ${w}? Live från Apple Store`,
    `iPhone i lager i ${w}: live från Apple Store`,
  ]);
}

function homeH1(cc: CountryCode): string {
  const k = storesOf(cc).length;
  return k === 1 ? `Hyllregister för iPhone · Apple Store, ${land(cc)}` : `Hyllregister för iPhone · ${k} Apple Store-butiker, ${land(cc)}`;
}

function allStoresPhrase(cc: CountryCode): string {
  const k = storesOf(cc).length;
  return k === 1 ? `landets enda Apple Store-butik (${land(cc)})` : `${k} Apple Store-butiker över hela ${land(cc)}`;
}

function spreadPhrase(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const regions = statesWithStores(cc);
  const cities = citiesWithStores(cc);
  const k = storesOf(cc).length;
  if (k === 1) return `belägen i ${cities[0].name}`;
  if (cities.length === 1) return `samtliga i ${cities[0].name}`;
  if (cities.length <= 4) return `fördelade på ${words(cities.map((x) => x.name).sort((a, b) => a.localeCompare(b, "sv")))}`;
  if (!c.regionNoun || regions.length === 1) return `utspridda över ${pl(cities.length, "stad", "städer")}`;
  return `utspridda över ${pl(cities.length, "stad", "städer")} i ${regions.length} ${noun(c, regions.length !== 1)}`;
}

function modelPageTitles(cc: CountryCode, model: ModelKey): { title: string; h2: string[] } {
  const m = modelByKey(model)!;
  const k = storesOf(cc).length;
  const w = land(cc);
  const all = k === 1 ? "Apple Store" : k === 2 ? "båda Apple Store-butikerna" : `alla ${k} Apple Store-butiker`;
  return {
    title: fit([`${m.name} i lager i ${w}: live i ${all}`, `${m.name} i lager i ${w}: live`, `${m.name} i lager i ${w}`], 70),
    h2: [`${m.name} nära dig: vilka butiker i ${w} som listar den nu`, priceSection(cc, w, undefined, model).h2],
  };
}

function modelIntro(cc: CountryCode, model: ModelKey, inStock: number): string {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const k = storesOf(cc).length;
  const r = priceRange(cc, model);
  const priceText = cc === "ca" ? `**${kr(cc, r.low)}** utan skatt` : `**${kr(cc, r.low)}**, ${taxNote(c)}`;
  const now = inStock === 0
    ? (k === 1 ? `${m.name} står **inte** på hyllan i landets enda Apple Store just nu` : `${m.name} står **inte** på hyllan i någon av de ${k} butikerna i ${land(cc)} just nu`)
    : `${m.name} står på hyllan i **${inStock} av ${k}** butiker i ${land(cc)} just nu`;
  return `${now}; listpriser från ${priceText}.`;
}

function modelDescription(cc: CountryCode, model: ModelKey, inStock: number): string {
  const m = modelByKey(model)!;
  const k = storesOf(cc).length;
  const r = priceRange(cc, model);
  return fit([
    `Finns ${m.name} i lager i ${land(cc)}? ${inStock} av ${k} Apple Store-butiker har den att hämta nu. Live per butik och konfiguration, från ${kr(cc, r.low)}${cc === "ca" ? " utan skatt" : ""}, med påfyllningstider.`,
    `${m.name} i ${land(cc)}: ${inStock} av ${k} Apple Store-butiker har den nu. Lager live per butik och konfiguration, påfyllningstider och bevakningar.`,
  ], 155);
}

function modelRows(cc: CountryCode, storesNow: Record<ModelKey, number>, restocks: Record<ModelKey, number>): string[][] {
  const prefix = cc === "us" ? "" : `/${cc}`;
  return MODELS.map((m) => [`[${m.name}](${prefix}/stock/${m.slug})`, n(catalogFor(m.key, cc).length), n(storesNow[m.key] ?? 0), n(restocks[m.key] ?? 0)]);
}

/* ------------------------------------------------------------------ country home */

function homeDescription(cc: CountryCode): string {
  const k = storesOf(cc).length;
  return fit([
    `Finns iPhone Duo, 18 Pro eller 18 Pro Max att hämta i ${allStoresPhrase(cc)}? Live var 15:e sekund, ${k === 1 ? "priser" : "påfyllningstider, priser"} och notis när din butik fyller på.`,
    `iPhone Duo, 18 Pro och 18 Pro Max att hämta i ${allStoresPhrase(cc)}, live var 15:e sekund. Notis när din butik fyller på.`,
  ], 155);
}

function homeIntro(cc: CountryCode): string {
  const k = storesOf(cc).length;
  return `${land(cc)} · ${k === 1 ? "1 Apple Store" : `${k} Apple Store-butiker`}. På hyllan just nu: iPhone Duo **{{duo.storesNow}}/${k}**, iPhone 18 Pro **{{pro.storesNow}}**, iPhone 18 Pro Max **{{pm.storesNow}}**.`;
}

function homeSections(i: HomeCopyInput): KeywordSection[] {
  const cc = i.cc;
  const c = COUNTRIES[cc];
  const k = storesOf(cc).length;
  const stores = storesOf(cc);
  const w = land(cc);
  const by = cc === "se" ? "stad" : c.regionNoun ? noun(c) : "stad";
  return [
    {
      id: "iphone-stock",
      h2: `Hyllan för iPhone i ${w}: Duo, 18 Pro och Pro Max butik för butik`,
      lead: `ShelfSpring läser av hämtningsläget på apple.com för varje konfiguration i ${allStoresPhrase(cc)} – butik för butik${k > 1 ? `, ${by} för ${by}` : ""} och konfiguration för konfiguration.`,
      blocks: [
        { t: "table", head: ["Modell", "Konfigurationer i registret", "Butiker med den på hyllan", "Loggade återkomster"], rows: modelRows(cc, i.storesNow, i.restocks), caption: `Registrets omfång i ${w} · {{asOf}}` },
        { t: "ul", items: [
          `**Omfång:** ${spreadPhrase(cc)} · priserna och artikelnumren kommer direkt från Apple i ${w}`,
          "**Varje butik var 15:e sekund**, butiker på din bevakningslista var 5:e",
          "**Två observationer krävs:** ett felaktigt svar från apple.com blir aldrig en falsk återkomst eller en falskt tömd hylla",
          `**Varje bekräftad ändring** förs in i [återkomstloggen](${i.restocksPath}), som ritar diagrammen på ${i.index?.indexable ? `[butikssidorna](${i.index.path})` : "butikssidan"}`,
        ] },
        { t: "img", id: "phone-notification" },
      ],
    },
    priceSection(cc, w),
    {
      id: "alerts",
      h2: `Aviseringar för Apple Store i ${w}: en notis när iPhone kommer tillbaka`,
      lead: `Att läsa registret kostar inget; betalningen gäller att slippa sitta och titta. Välj ${k === 1 ? "butiken" : "de butiker"} du kan nå och den exakta telefonen, så kommer en notis när ${k === 1 ? "butiken" : "någon av dem"} listar den för hämtning.`,
      blocks: [
        { t: "ol", items: [
          "Tryck på **Lägg upp en avisering** och välj iPhone, kapacitet och färg.",
          k === 1 ? `Markera butiken: ${apple(stores[0])} i ${stores[0].city}.` : "Markera butikerna du når; de närmaste står först, med uppskattat vägavstånd i kilometer och körtid.",
          "På iPhone: spara ShelfSpring på hemskärmen och tillåt notiser ([guide](/install)).",
          "När notisen kommer: öppna apple.com via den och välj Hämta i butik för just den butiken i kassan.",
        ] },
        { t: "table", head: ["Plan", "Månadspris (USD)", "Aviseringar"], rows: [["Plus", "$5 / månad", "10"], ["Pro", "$10 / månad", "20"], ["Max", "$20 / månad", "50"]], caption: "En avisering = en butik × en exakt konfiguration · läsningen är gratis ([planer](/pricing))" },
        { t: "note", text: "**Fältanteckning:** Duo förtjänar en avisering i varje butik du når; för 18 Pro och Pro Max, läs hyllstatusen först." },
        { t: "img", id: "apple-store-pickup-counter" },
      ],
    },
  ];
}

function homeFaq(cc: CountryCode, rt: RestockTimesBrief): Faq[] {
  const k = storesOf(cc).length;
  const p = cc === "us" ? "" : `/${cc}`;
  const w = land(cc);
  const when = rt.n === 0
    ? `Ingen bekräftad än sedan registret öppnades den 2 november. [Timmar för återkomster av iPhone Duo i ${w}](${rt.path}) räknar varje återkomst per lokal timme och dag när de kommer.`
    : rt.peakHour != null
      ? `De samlas runt **${klock(rt.peakHour)} lokal tid**: ${pl(rt.n, "bekräftad återkomst", "bekräftade återkomster")} i ${rt.stores} av ${rt.storesTotal} butiker sedan 2 november. [Timme för timme och dag för dag](${rt.path}).`
      : `${pl(rt.n, "bekräftad återkomst", "bekräftade återkomster")} i ${rt.stores} av ${rt.storesTotal} butiker sedan 2 november, på för få dagar för att peka ut en vanlig tid. [Timme för timme och dag för dag](${rt.path}).`;
  return [
    { q: `Var i ${w} står iPhone Duo på hyllan nu?`, a: `I {{duo.storesNow}} av ${k} butiker vid senaste observationen ({{asOf}}). [iPhone Duo-hyllan i ${w}](${p}/stock/iphone-duo) visar varje butik och konfiguration.` },
    { q: `Vilka timmar kommer iPhone Duo tillbaka i ${w}?`, a: when },
    { q: "Hur kommer aviseringarna fram?", a: `Butikerna på din bevakningslista läses av var 5:e sekund, alla butiker i ${w} var 15:e. Ett första ”tillgänglig” kontrolleras igen innan något skickas, så att ett tillfälligt fel hos Apple inte blir en notis; leveranstiden till telefonen varierar.` },
    { q: "Vad kostar det?", a: "Hyllstatus, kartan och återkomstloggen är gratis att läsa. Aviseringar kostar Plus $5/månad för 10, Pro $10 för 20 och Max $20 för 50, debiteras i amerikanska dollar; förnyelsen kan stoppas när du vill ([planer](/pricing))." },
    taxFaq(cc, w),
    { q: "Kan ShelfSpring hålla telefonen åt mig?", a: `Nej. Registret visar när en butik listar den; köpet görs på apple.com med Hämta i butik, och det är Apple som håller telefonen åt dig ([Apples hjälp om hämtning](${pickupHelp(cc).url})).` },
  ];
}

const home: Dict["place"]["home"] = {
  appName: (cc: CountryCode) => `ShelfSpring iPhone-lagerkoll ${land(cc)}`,
  offer: "Lagerstatus live, karta och påfyllningslogg är gratis; bevakningar från $5/månad",
  itemList: (cc: CountryCode) => `Apple Store-butiker i ${land(cc)}`,
  restockTimesChip: "Timmar för återkomster",
  storesByRegion: (cc: CountryCode) => `Butikerna ordnade per ${noun(COUNTRIES[cc])}`,
  browse: (cc: CountryCode) => `Mer ur registret för ${land(cc)}`,
  selloutH2: (cc: CountryCode) => `Hur länge ligger återkomna iPhone på hyllan i ${land(cc)}?`,
  selloutLabel: (cc: CountryCode) => `i butikerna i ${land(cc)}`,
  last24Label: (cc: CountryCode) => `i ${land(cc)}`,
  newsroom: "Apple Newsroom: iPhone Duo kommer till Apple Store-butiker världen över (23 okt. 2026, på engelska)",
};

/**
 * Store page <title> and H1: the store first (what Swedes type: "apple mall of scandinavia", "apple täby centrum",
 * "apple emporia"), then the promise. The two Stockholm stores carry "Stockholm" ("apple store stockholm"), Täby leads
 * with "Apple Store Täby" ("apple store täby"); elsewhere the town follows in parentheses when it is the only store there.
 */
function storeTitle(s: Store, region?: string): string {
  const stockholm = STOCKHOLM.has(s.storeNumber);
  const name = s.storeNumber === "R505" ? "Apple Store Täby Centrum" : apple(s);
  const shown = stockholm ? ", Stockholm" : region && !name.toLowerCase().includes(region.toLowerCase()) ? ` (${region})` : "";
  return fit([
    `${name}${shown}: iPhone i lager idag, hämtning & öppettider`,
    `${name}${shown}: iPhone i lager idag & öppettider`,
    `${name}${shown}: iPhone i lager idag`,
    `${name}: iPhone i lager idag & öppettider`,
    `${name}: iPhone i lager idag`,
    `${name}: iPhone i lager`,
  ]);
}

const basePlace: Dict["place"] = {
  sinceWhen,
  placeLabel: (_cc: CountryCode, name: string) => name,
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
  home,
  storeTitle,
  sources,
};

export const place: Dict["place"] = withShelfPlace("sv", basePlace);
