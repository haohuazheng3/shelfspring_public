import { withShelfPlace } from "@/lib/seo/localizedCopy";
/**
 * Italian strings: place — the copy builders of the country pages (Italian version of lib/seo/countryCopy.ts):
 * titles, Answer-First intros, keyword sections, price/IVA sections and FAQs, built from live numbers.
 * Titles lead with what Italians type (Apple Store + city or country, the store's own name, "iPhone Duo prezzo").
 */
import { MODELS, catalogFor, citiesWithStores, statesWithStores, storesOf, modelByKey, type ModelKey, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import { INTL_TRACKING_SINCE, priceOf, priceRange, scarcest, pairsPct, duoStoresNow, type IntlPlaceInput, type HomeCopyInput, type RestockTimesBrief } from "@/lib/seo/countryCopy";
import { CA_PROVINCE_TAX, CA_TAX_SOURCE, TAX_SOURCES, beforeTax, includedRate, pickupHelp, storeListSource, withProvinceTax } from "@/content/country-tax";
import { alertHref, fmtDuration, type FaqItem } from "@/lib/seo/enrich";
import type { Block, Faq, Source } from "@/lib/content/types";
import type { KeywordSection } from "@/components/content/KeywordSections";
import { fitTitleW, list, pct, stamp } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, colorLabel, regionLabel } from "@/lib/i18n/places";
import type { Dict } from "../en";
import { IT, aLuogo, aggettivo, cap, dei, eur, il, inPaese, inTutto, leOre, n as N, paese, pl, regione, taxIt, taxNoteIt } from "./util";

/* ------------------------------------------------------------------ small pieces */

/** "dal 2 novembre (inizio del monitoraggio)" while the 30-day window reaches back to the start, else "negli ultimi 30 giorni". */
function sinceWhen(now = Date.now()): string {
  return now - Date.parse(`${INTL_TRACKING_SINCE}T00:00:00Z`) < 30 * 86400_000 ? "dal 2 novembre (inizio del monitoraggio)" : "negli ultimi 30 giorni";
}

/** Place names that are also US Apple Store cities or states get the country ("Manchester, Regno Unito"). */
const US_NAMES = new Set([...citiesWithStores("us").map((c) => c.name.toLowerCase()), ...statesWithStores("us").map((s) => s.name.toLowerCase())]);
function placeLabel(cc: CountryCode, name: string): string {
  return US_NAMES.has(name.toLowerCase()) ? `${name}, ${paese(cc)}` : name;
}

/** The page's place in Italian: a city or a region (province). */
const localName = (i: IntlPlaceInput) => (i.kind === "city" ? cityLabel(i.cc, i.name, IT) : regionLabel(i.cc, i.name, IT));
/** Italy's region pages are provinces with several towns: "Roma e provincia" (the store index passes the whole country, no slug). */
const withProvince = (i: IntlPlaceInput, w: string) => (i.kind === "state" && i.cc === "it" && i.regionSlug ? `${w} e provincia` : w);

const apple = (s: Store) => appleStoreLabel(s, IT);
/** "l'IVA", "l'imposta sui consumi", "la GST": every tax name here is feminine. */
const laTax = (t: string) => (/^[aeiouAEIOU]/.test(t) ? `l'${t}` : `la ${t}`);
const ha = (k: number) => (k === 1 ? "ha" : "hanno");
/** "256GB Night Sky" (English label) → "256GB Cielo notturno". */
const cfgIt = (label: string) => label.replace(/^(\S+) (.+)$/, (_m, st: string, col: string) => `${st} ${colorLabel(col, IT)}`);
const CURRENCY: Record<string, string> = { EUR: "euro", USD: "dollari USA", GBP: "sterline", CHF: "franchi svizzeri", JPY: "yen", CAD: "dollari canadesi", AUD: "dollari australiani", SEK: "corone svedesi", KRW: "won", HKD: "dollari di Hong Kong", SGD: "dollari di Singapore", AED: "dirham", TWD: "dollari taiwanesi" };

/* ------------------------------------------------------------------ tax */

function taxSentence(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    if (t) return `Su apple.com il Duo 256GB è indicato a ${eur(c, duo)} senza tasse; aggiungendo la ${CA_PROVINCE_TAX[region!].label} del ${t.rate}% (${region}) si sale a circa ${eur(c, t.total)}.`;
    return `Su apple.com il Duo 256GB è indicato a ${eur(c, duo)} senza tasse; la provincia del negozio aggiunge fra il 5% e il 15%.`;
  }
  const r = includedRate(c);
  if (r == null) return `A Hong Kong non esiste un'imposta sulle vendite: i ${eur(c, duo)} chiesti per il Duo 256GB sono la cifra esatta da pagare al ritiro.`;
  return `${cap(inPaese(cc))} il listino di apple.com per il Duo 256GB è ${eur(c, duo)}, con ${taxIt(c)} al ${pct(IT, r)} già compresa: al banco del ritiro la cifra resta quella.`;
}

const PRICE_ROWS: [ModelKey, string][] = [["duo", "256GB"], ["duo", "1TB"], ["18-pro-max", "256GB"], ["18-pro-max", "1TB"], ["18-pro", "256GB"]];

/** Italy's tax source in Italian (Your Europe has every EU language); elsewhere the English one. */
function taxSource(cc: Exclude<CountryCode, "us">): Source {
  const src = TAX_SOURCES[cc];
  if (src.url.includes("europa.eu/youreurope")) return { label: "La tua Europa (Unione europea): aliquote IVA applicate nei paesi dell'UE", url: src.url.replace(/index_en\.htm$/, "index_it.htm") };
  return src;
}
function pickupHelpIt(cc: CountryCode): Source {
  const s = pickupHelp(cc);
  return cc === "it" ? { label: "Apple, «Spedizione e ritiro»: i documenti da presentare al banco", url: s.url } : s;
}
function storeListIt(cc: CountryCode): Source {
  const s = storeListSource(cc);
  return cc === "it" ? { label: "Apple, elenco dei negozi in Italia", url: s.url } : s;
}

function priceSection(cc: CountryCode, placeName: string, region?: string, model: ModelKey = "duo"): KeywordSection {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const base = priceOf(cc, model) ?? 0;
  const src = taxSource(cc as Exclude<CountryCode, "us">);
  const rows: [string, number][] = PRICE_ROWS.flatMap(([k, st]) => { const p = priceOf(cc, k, st); return p == null ? [] : [[`${modelByKey(k)!.name} ${st}`, p] as [string, number]]; });
  if (cc === "ca") {
    const t = region ? CA_PROVINCE_TAX[region] : undefined;
    if (t) {
      const table: Block = {
        t: "table",
        head: ["iPhone", "Listino apple.com", `Con ${t.label} (${pct(IT, t.total)})`],
        rows: rows.map(([label, p]) => [label, eur(c, p), eur(c, withProvinceTax(p, region!)!.total)]),
        caption: `${region}: listino Apple Canada più ${t.label} (${pct(IT, t.total)})`,
        source: `[${src.label}](${src.url}); listini da apple.com/ca`,
      };
      const parts = t.hst ? `l'HST (${t.hst}%)` : t.pst ? `GST (${t.gst}%) più ${t.label.split(" + ")[1]} (${t.pst}%)` : `la sola GST (${t.gst}%), senza tassa provinciale`;
      return {
        id: "price-with-tax",
        h2: `${m.name} ${aLuogo(placeName)}: quanto si paga tasse comprese`,
        lead: `Listino dell'${m.name} da 256GB: **${eur(c, base)} senza tasse**. Con ${parts} (${region}), in un negozio ${aLuogo(placeName)} si arriva intorno a **${eur(c, withProvinceTax(base, region!)!.total)}**.`,
        blocks: [{ t: "note", text: "**Conta il luogo del ritiro:** si applica la provincia del negozio, non quella in cui abiti." }, table],
      };
    }
    const provinces = Object.keys(CA_PROVINCE_TAX).filter((p) => storesOf("ca").some((s) => s.state === p));
    const cheapest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total < CA_PROVINCE_TAX[a].total ? b : a));
    const dearest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total > CA_PROVINCE_TAX[a].total ? b : a));
    return {
      id: "price-with-tax",
      h2: `${m.name} in Canada: le tasse cambiano da provincia a provincia`,
      lead: `Apple indica **${eur(c, base)}** per un ${m.name} da 256GB, tasse escluse; è la provincia del negozio ad aggiungerle, da **${eur(c, withProvinceTax(base, cheapest)!.total)}** in ${cheapest} (${pct(IT, CA_PROVINCE_TAX[cheapest].total)}) a **${eur(c, withProvinceTax(base, dearest)!.total)}** in ${dearest} (${pct(IT, CA_PROVINCE_TAX[dearest].total)}).`,
      blocks: [{
        t: "table",
        head: ["Provincia", "Tassa", "Aliquota", `${m.short} 256GB tasse comprese`],
        rows: provinces.map((p) => [p, CA_PROVINCE_TAX[p].label, pct(IT, CA_PROVINCE_TAX[p].total), eur(c, withProvinceTax(base, p)!.total)]),
        caption: "Province con almeno un Apple Store: tasse su un ritiro in negozio",
        source: `[${CA_TAX_SOURCE.label}](${CA_TAX_SOURCE.url}); listini da apple.com/ca`,
      }],
    };
  }
  const r = includedRate(c);
  const tn = taxIt(c);
  return {
    id: "price",
    h2: `${m.name}, il prezzo ${inPaese(cc)}: ${eur(c, base)}, ${taxNoteIt(c)}`,
    lead: r == null
      ? `Hong Kong **non applica né imposta sulle vendite né IVA**: i **${eur(c, base)}** chiesti su apple.com per l'${m.name} da 256GB sono esattamente la cifra del ritiro ${aLuogo(placeName)}.`
      : `Il listino dell'${m.name} da 256GB ${inPaese(cc)} è **${eur(c, base)}** con **${tn} al ${pct(IT, r)} già compresa** (${eur(c, beforeTax(c, base))} senza ${tn}); ritirandolo ${aLuogo(placeName)} non c'è alcun supplemento.`,
    blocks: [{
      t: "table",
      head: r == null ? ["iPhone", "Listino apple.com"] : ["iPhone", "Listino apple.com", `Al netto di ${tn} (${pct(IT, r)})`],
      rows: rows.map(([label, p]) => (r == null ? [label, eur(c, p)] : [label, eur(c, p), eur(c, beforeTax(c, p))])),
      caption: `Listino ufficiale, Apple Store online ${aggettivo(cc)}${r == null ? "" : ` (${tn} compresa)`}`,
      source: `[${src.label}](${src.url}); listini da apple.com/${c.buyPath ?? c.shopPath}`,
    }],
  };
}

function taxFaq(cc: CountryCode, placeName: string, region?: string): FaqItem {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo") ?? 0;
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    return t
      ? { q: `${cap(aLuogo(placeName))}, quanto viene un iPhone Duo tasse comprese?`, a: `Intorno a ${eur(c, t.total)} per il 256GB: ai ${eur(c, duo)} di Apple si somma la ${CA_PROVINCE_TAX[region!].label} del ${pct(IT, t.rate)} (${region}), che si paga nel luogo del ritiro.` }
      : { q: "In Canada i prezzi Apple comprendono le tasse?", a: `No. Il listino dell'iPhone Duo da 256GB è ${eur(c, duo)} senza tasse; GST, HST o tassa provinciale si aggiungono in base alla provincia del negozio, dal 5% dell'Alberta al 14,975% del Québec.` };
  }
  const r = includedRate(c);
  return r == null
    ? { q: "Un iPhone comprato a Hong Kong paga un'imposta sulle vendite?", a: `No: a Hong Kong non esistono né imposta sulle vendite né IVA, perciò al ritiro il Duo 256GB costa ${eur(c, duo)}, la stessa cifra di apple.com.` }
    : { q: `${cap(inPaese(cc))}, il listino di apple.com comprende già ${laTax(taxIt(c))}?`, a: `Sì. Il prezzo di ${eur(c, duo)} per il Duo 256GB comprende già ${laTax(taxIt(c))} al ${pct(IT, r)}; al banco del ritiro non cambia niente.` };
}

/* ------------------------------------------------------------------ region / city pages */

function placeTitle(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const w = placeLabel(i.cc, localName(i));
  const where = withProvince(i, w);
  return fitTitleW([
    `Apple Store ${where}: disponibilità iPhone Duo nei ${N(n)} negozi`,
    `Apple Store ${where}: disponibilità iPhone Duo in tempo reale`,
    `Apple Store ${where}: disponibilità iPhone oggi`,
    `Apple Store ${where}: disponibilità iPhone`,
    `Apple Store ${w}: disponibilità iPhone`,
  ]);
}

function priceBit(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") { const t = region ? withProvinceTax(duo, region) : null; return t ? `, circa ${eur(c, t.total)} con le tasse (${region})` : `, ${eur(c, duo)} tasse escluse`; }
  return `, ${eur(c, duo)} ${taxNoteIt(c)}`;
}

function placeDescription(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const where = aLuogo(withProvince(i, placeLabel(i.cc, localName(i))));
  const duo = i.stockNow.duo, pm = i.stockNow["18-pro-max"];
  return fitTitleW([
    `${N(n)} Apple Store ${where}: iPhone Duo a scaffale in ${N(duo)}, 18 Pro Max in ${N(pm)}. Disponibilità per negozio, orari dei rientri${priceBit(i.cc, i.region)}.`,
    `${N(n)} Apple Store ${where}: iPhone Duo a scaffale in ${N(duo)}, 18 Pro Max in ${N(pm)}. Disponibilità per negozio in tempo reale e rientri.`,
  ], 155);
}

function placeIntro(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const where = aLuogo(withProvince(i, localName(i)));
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? ` (${N(i.cities)} città)` : "";
  return `**${N(n)} Apple Store** ${where}${cities}. A scaffale per il ritiro adesso: iPhone Duo **${N(i.stockNow.duo)}**, 18 Pro Max **${N(i.stockNow["18-pro-max"])}**, 18 Pro **${N(i.stockNow["18-pro"])}**.`;
}

function whenIn(cc: CountryCode, iso: string | Date): string {
  return stamp(IT, iso, COUNTRIES[cc].timeZone, true);
}

function duoLead(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  if (have.length > 0) return `**${have.length === 1 ? "1 negozio" : `${N(have.length)} negozi`} su ${N(n)}** ${ha(have.length)} l'iPhone Duo adesso: ${list(IT, have.map(apple), 4, (k) => `altri ${N(k)}`)}.`;
  if (st.month > 0) return `**Nessuno ${dei(n)} negozi** ha l'iPhone Duo adesso, ma è tornato disponibile **${pl(st.month, "volta", "volte")}** ${sinceWhen()}.`;
  return `**Nessuno ${dei(n)} negozi** ha l'iPhone Duo adesso, e nessuno ha registrato un rientro ${sinceWhen()}.`;
}

function duoPoints(i: IntlPlaceInput, w: string, alert: string): Block[] {
  const n = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (have.length > 0 && st.month > 0) items.push(`**Registrati ${sinceWhen()}:** ${pl(st.month, "rientro di iPhone Duo", "rientri di iPhone Duo")} nei negozi ${aLuogo(w)}`);
  if (st.lastRestock && last) items.push(`**Ultimo rientro:** ${whenIn(i.cc, st.lastRestock.at)} da ${apple(last)}`);
  if (st.medianMs != null) items.push(`**Durata tipica:** un iPhone Duo rientrato è rimasto a scaffale circa ${fmtDuration(st.medianMs, IT)} (mediana)`);
  const which = n === 1 ? "nel negozio" : n <= 3 ? `nei ${n === 2 ? "due" : "tre"} negozi` : `nei ${Math.min(n, 5)} negozi più vicini`;
  items.push(`**La via più rapida:** [imposta un avviso per l'iPhone Duo ${aLuogo(w)}](${alert}) ${which} che puoi raggiungere`);
  items.push("**Una notifica** = un negozio × una configurazione esatta");
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: "**Può cambiare da un minuto all'altro:** il modo più rapido per averne uno è un avviso, non ricaricare apple.com." });
  blocks.push({ t: "ul", items });
  return blocks;
}

function placeSections(i: IntlPlaceInput): KeywordSection[] {
  const n = i.stores.length;
  const w = withProvince(i, localName(i));
  const alert = alertHref({ model: "duo", state: i.regionSlug, city: i.kind === "city" ? i.citySlug : undefined, country: i.cc });
  const scarce = scarcest(i, "18-pro-max");
  const pmN = catalogFor("18-pro-max", i.cc).length;
  const pm = i.stockNow["18-pro-max"];
  return [
    {
      id: "iphone-duo",
      h2: `iPhone Duo ${aLuogo(w)}: quali negozi ce l'hanno adesso`,
      lead: duoLead(i),
      blocks: duoPoints(i, w, alert),
    },
    {
      id: "iphone-18-pro-max",
      h2: `iPhone 18 Pro Max ${aLuogo(w)}: disponibilità negozio per negozio`,
      lead: `**${pm === 1 ? "1 negozio" : `${N(pm)} negozi`} su ${N(n)}** ${ha(pm)} l'iPhone 18 Pro Max, e **${il(pct(IT, pairsPct(i, "18-pro-max")))}** delle ${N(n * pmN)} combinazioni negozio × configurazione è disponibile.`,
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**I più rari adesso:** ${list(IT, scarce.map((x) => `${cfgIt(x.label)} (in ${N(x.stores)} negozi su ${N(n)})`))}`] : []),
        `**iPhone 18 Pro:** in ${N(i.stockNow["18-pro"])} negozi su ${N(n)}, ${pct(IT, pairsPct(i, "18-pro"))} delle combinazioni disponibili`,
        `**Registrati ${sinceWhen()}:** ${i.max.month ? pl(i.max.month, "rientro di 18 Pro Max", "rientri di 18 Pro Max") : "ancora nessun rientro di 18 Pro Max"}`,
        ...(i.max.medianMs != null ? [`**Durata tipica:** un Pro Max rientrato è rimasto a scaffale circa ${fmtDuration(i.max.medianMs, IT)} (mediana)`] : []),
      ] }],
    },
    priceSection(i.cc, w, i.cc === "ca" ? i.region : undefined),
  ];
}

/* ------------------------------------------------------------------ country: store index and home */

function storesIndexTitle(cc: CountryCode): string {
  const n = storesOf(cc).length;
  const where = inPaese(cc);
  const all = n === 1 ? "" : n === 2 ? " in entrambi i negozi" : ` in tutti i ${N(n)} negozi`;
  return fitTitleW([`Apple Store ${where}: disponibilità iPhone Duo${all}`, `Apple Store ${where}: disponibilità iPhone Duo in tempo reale`, `Apple Store ${where}: disponibilità iPhone`], 70);
}

function homeTitle(cc: CountryCode): string {
  const n = storesOf(cc).length;
  const p = paese(cc);
  return fitTitleW([
    ...(n > 1 ? [`Apple Store ${p}: disponibilità iPhone Duo nei ${N(n)} negozi`] : []),
    `Apple Store ${p}: disponibilità iPhone Duo ogni 15 s`,
    `Apple Store ${p}: disponibilità iPhone`,
  ]);
}

function homeH1(cc: CountryCode): string {
  const n = storesOf(cc).length;
  return n === 1 ? `Verifica disponibilità iPhone nell'Apple Store ${inPaese(cc)}` : `Verifica disponibilità iPhone in tutti i ${N(n)} Apple Store ${inPaese(cc)}`;
}

function allStoresPhrase(cc: CountryCode): string {
  const n = storesOf(cc).length;
  return n === 1 ? `il solo Apple Store ${inPaese(cc)}` : `${N(n)} Apple Store ${inTutto(cc)}`;
}

function spreadPhrase(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const regions = statesWithStores(cc);
  const cities = citiesWithStores(cc);
  const n = storesOf(cc).length;
  const city0 = cityLabel(cc, cities[0].name, IT);
  if (n === 1) return aLuogo(city0);
  if (cities.length === 1) return `tutti ${aLuogo(city0)}`;
  if (!c.regionNoun || regions.length === 1) return `sparsi in ${N(cities.length)} città`;
  return `sparsi in ${N(cities.length)} città e ${N(regions.length)} ${regione(c, regions.length !== 1)}`;
}

function modelPageTitles(cc: CountryCode, model: ModelKey): { title: string; h2: string[] } {
  const m = modelByKey(model)!;
  const n = storesOf(cc).length;
  const where = inPaese(cc);
  const all = n === 1 ? "nell'Apple Store" : `nei ${N(n)} Apple Store`;
  return {
    title: fitTitleW([`${m.name}: disponibilità e prezzo ${where}, ${all}`, `${m.name}: disponibilità e prezzo ${where}`, `${m.name} disponibile ${where}`], 70),
    h2: [`${m.name} vicino a me: gli Apple Store ${where} che ce l'hanno adesso`, priceSection(cc, paese(cc), undefined, model).h2],
  };
}

function modelIntro(cc: CountryCode, model: ModelKey, inStock: number): string {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const n = storesOf(cc).length;
  const r = priceRange(cc, model);
  const where = inPaese(cc);
  const price = cc === "ca" ? `**${eur(c, r.low)}** tasse escluse` : `**${eur(c, r.low)}**, ${taxNoteIt(c)}`;
  const now = inStock === 0
    ? (n === 1 ? `L'Apple Store ${where} **non ha** l'${m.name} disponibile per il ritiro adesso` : `**Nessuno** ${dei(n)} Apple Store ${where} ha l'${m.name} disponibile per il ritiro adesso`)
    : `**${N(inStock)} su ${N(n)}** Apple Store ${where} ${ha(inStock)} l'${m.name} disponibile per il ritiro adesso`;
  return `${now}; listino da ${price}.`;
}

function modelDescription(cc: CountryCode, model: ModelKey, inStock: number): string {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const n = storesOf(cc).length;
  const r = priceRange(cc, model);
  const where = inPaese(cc);
  return fitTitleW([
    `L'${m.name} è disponibile ${where}? Ce l'${inStock === 1 ? "ha" : "hanno"} ${N(inStock)} Apple Store su ${N(n)} per il ritiro adesso. Per negozio e configurazione, da ${eur(c, r.low)}${cc === "ca" ? " tasse escluse" : ""}, con i rientri.`,
    `${m.name} ${where}: disponibile adesso in ${N(inStock)} Apple Store su ${N(n)}. Ritiro per negozio e configurazione, rientri e avvisi.`,
  ], 155);
}

function modelRows(cc: CountryCode, storesNow: Record<ModelKey, number>, restocks: Record<ModelKey, number>): string[][] {
  const prefix = cc === "us" ? "" : `/${cc}`;
  return MODELS.map((m) => [`[${m.name}](${prefix}/stock/${m.slug})`, N(catalogFor(m.key, cc).length), N(storesNow[m.key] ?? 0), N(restocks[m.key] ?? 0)]);
}

/* ------------------------------------------------------------------ country home */

function homeDescription(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const n = storesOf(cc).length;
  const cur = CURRENCY[c.currency] ?? c.currency;
  return fitTitleW([
    `Disponibilità di iPhone Duo, 18 Pro e 18 Pro Max per il ritiro in ${allStoresPhrase(cc)}, aggiornata ogni 15 secondi. ${n === 1 ? "Prezzi" : "Rifornimenti, prezzi"} in ${cur} e notifiche push.`,
    `Disponibilità di iPhone Duo, 18 Pro e Pro Max per il ritiro ${n === 1 ? `nell'Apple Store ${inPaese(cc)}` : `nei ${N(n)} Apple Store ${inPaese(cc)}`}, ogni 15 secondi. Rifornimenti, prezzi in ${cur} e notifiche.`,
  ], 155);
}

function homeIntro(cc: CountryCode): string {
  const n = storesOf(cc).length;
  return `A scaffale per il ritiro ${inPaese(cc)}, su ${N(n)} Apple Store: iPhone Duo **{{duo.storesNow}}**, 18 Pro **{{pro.storesNow}}**, 18 Pro Max **{{pm.storesNow}}**.`;
}

function homeSections(i: HomeCopyInput): KeywordSection[] {
  const cc = i.cc;
  const c = COUNTRIES[cc];
  const n = storesOf(cc).length;
  const stores = storesOf(cc);
  const where = inPaese(cc);
  const r = c.regionNoun ? regione(c) : "città";
  return [
    {
      id: "iphone-stock",
      h2: `Scaffali iPhone ${where}: Duo, 18 Pro e Pro Max negozio per negozio`,
      lead: `ShelfSpring annota su apple.com le voci con ritiro di ogni configurazione: ${allStoresPhrase(cc)}, negozio per negozio${n > 1 ? `, ${r} per ${r}` : ""}.`,
      blocks: [
        { t: "table", head: ["Modello", "Configurazioni seguite", "Negozi che lo espongono", "Rientri nel registro"], rows: modelRows(cc, i.storesNow, i.restocks), caption: `Che cosa copre il registro ${where} · istantanea: {{asOf}}` },
        { t: "ul", items: [
          `**Copertura:** negozi ${spreadPhrase(cc)} · listini e codici prodotto dell'Apple Store online ${aggettivo(cc)}`,
          "**Scorte aggiornate di frequente** in ogni negozio",
          "**Due osservazioni prima di contare:** una risposta anomala di apple.com non diventa mai un falso rientro né un falso esaurimento",
          `**Ogni cambiamento confermato** entra nel [registro dei rientri](${i.restocksPath}), da cui nascono i grafici ${i.index?.indexable ? `delle [schede dei negozi](${i.index.path})` : "della scheda del negozio"}`,
        ] },
        { t: "img", id: "phone-notification" },
      ],
    },
    priceSection(cc, paese(cc)),
    {
      id: "alerts",
      h2: `Lista d'osservazione per gli Apple Store ${where}`,
      lead: `Sfogliare è gratis; l'abbonamento serve a non doverlo fare tu. Scegli ${n === 1 ? "l'Apple Store" : "gli Apple Store"} alla tua portata e l'iPhone esatto: la notifica parte quando ${n === 1 ? "il negozio" : "uno di quei negozi"} lo rimette in elenco per il ritiro.`,
      blocks: [
        { t: "ol", items: [
          "Apri la **lista d'osservazione** e scegli iPhone, capacità e finitura.",
          n === 1 ? `Spunta il negozio: ${apple(stores[0])}, ${cityLabel(cc, stores[0].city, IT)}.` : "Spunta i negozi alla tua portata: in cima ci sono i più vicini, con chilometri di strada e tempo in auto.",
          "Su iPhone salva ShelfSpring sulla schermata Home e concedi le notifiche ([guida](/install)).",
          "All'arrivo della notifica aprila, passa su apple.com e concludi l'ordine con ritiro in quel negozio.",
        ] },
        { t: "table", head: ["Piano", "Costo (USD)", "Notifiche"], rows: [["Plus", "$5 al mese", "10"], ["Pro", "$10 al mese", "20"], ["Max", "$20 al mese", "50"]], caption: "Una notifica = un negozio × una configurazione esatta · sfogliare le scorte non costa nulla ([piani](/pricing))" },
        { t: "note", text: "**La nostra posizione:** per l'iPhone Duo conviene seguire ogni negozio raggiungibile; per 18 Pro e Pro Max guarda prima lo scaffale dal vivo." },
        { t: "img", id: "apple-store-pickup-counter" },
      ],
    },
  ];
}

function homeFaq(cc: CountryCode, rt: RestockTimesBrief): Faq[] {
  const n = storesOf(cc).length;
  const p = cc === "us" ? "" : `/${cc}`;
  const where = inPaese(cc);
  const when = rt.n === 0
    ? `Il registro, aperto il 2 novembre, non ne contiene ancora. [Il registro dei rientri dell'iPhone Duo ${where}](${rt.path}) li ordina per ora e giorno locali man mano che arrivano.`
    : rt.peakHour != null
      ? `Per lo più attorno a **${leOre(rt.peakHour)}, ora locale**: ${pl(rt.n, "rientro confermato", "rientri confermati")} in ${N(rt.stores)} negozi su ${N(rt.storesTotal)} dal 2 novembre. [Ora per ora e giorno per giorno](${rt.path}).`
      : `${pl(rt.n, "rientro confermato", "rientri confermati")} in ${N(rt.stores)} negozi su ${N(rt.storesTotal)} dal 2 novembre, in troppo pochi giorni per indicare un orario tipico. [Ora per ora e giorno per giorno](${rt.path}).`;
  return [
    { q: `${cap(where)}, quali Apple Store espongono l'iPhone Duo adesso?`, a: `{{duo.storesNow}} su ${N(n)} all'ultima osservazione ({{asOf}}). [Gli scaffali dell'iPhone Duo ${where}](${p}/stock/iphone-duo) mostrano ogni negozio e configurazione.` },
    { q: `${cap(where)}, a che ora rientra l'iPhone Duo?`, a: when },
    { q: "Quando parte una notifica?", a: "Dopo che una disponibilità corrispondente è stata rilevata e confermata da una seconda osservazione. Controlli alla fonte, sincronizzazione e recapito possono aggiungere ritardo." },
    { q: "Quanto costa?", a: "Disponibilità in tempo reale, mappa e registro dei rientri sono gratis. Gli avvisi costano $5 al mese per 10 (Plus), $10 per 20 (Pro) e $20 per 50 (Max), addebitati in dollari USA; disdici quando vuoi ([prezzi](/pricing))." },
    taxFaq(cc, paese(cc)),
    { q: "Potete prenotare il telefono per me?", a: `No. Ti avvisiamo nell'istante in cui un negozio lo rende disponibile; lo acquisti su apple.com scegliendo il Ritiro in negozio e Apple lo tiene da parte per te ([aiuto Apple sul ritiro](${pickupHelpIt(cc).url})).` },
  ];
}

const homeLabels: Dict["place"]["home"] = {
  appName: (cc: CountryCode) => `ShelfSpring · scaffali iPhone ${paese(cc)}`,
  offer: "Disponibilità in tempo reale, mappa e registro dei rifornimenti gratis; avvisi da $5 al mese",
  itemList: (cc: CountryCode) => `Apple Store ${inPaese(cc)}`,
  restockTimesChip: "Orari dei rientri",
  storesByRegion: (cc: CountryCode) => `Negozi, ${regione(COUNTRIES[cc])} per ${regione(COUNTRIES[cc])}`,
  browse: (cc: CountryCode) => `Sfoglia gli scaffali ${inPaese(cc)}`,
  selloutH2: (cc: CountryCode) => `${cap(inPaese(cc))}, quanto restano a scaffale gli iPhone rientrati?`,
  selloutLabel: (cc: CountryCode) => inTutto(cc),
  last24Label: (cc: CountryCode) => inPaese(cc),
  newsroom: "Apple Newsroom (in inglese): iPhone Duo arriva negli Apple Store di tutto il mondo (23 ottobre 2026)",
};

/** The store's own name, then the promise; `region` (Italian) when it is the city's or province's only store. */
function storeTitle(s: Store, region?: string): string {
  const name = appleStoreLabel(s, IT);
  const shown = region && !s.name.toLowerCase().includes(region.toLowerCase()) && !name.toLowerCase().includes(region.toLowerCase()) ? region : null;
  const r = shown ? ` (${shown})` : "";
  return fitTitleW([
    `${name}${r}: disponibilità iPhone oggi, ritiro e orari`,
    `${name}${r}: disponibilità iPhone oggi e orari`,
    `${name}${r}: disponibilità iPhone e orari`,
    `${name}: disponibilità iPhone oggi, ritiro e orari`,
    `${name}: disponibilità iPhone e orari`,
    `${name}: disponibilità iPhone`,
    `${name} – disponibilità`,
  ]);
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
  sources: (code: Exclude<CountryCode, "us">) => ({ pickupHelp: pickupHelpIt(code), storeList: storeListIt(code), tax: taxSource(code) }),
};

export const place: Dict["place"] = withShelfPlace("it", basePlace);
