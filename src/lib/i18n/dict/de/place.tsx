import { withShelfPlace } from "@/lib/seo/localizedCopy";
/**
 * German strings: place — the copy builders of the country pages (Germany, Austria, Switzerland in German; any
 * other country a German reader opens reads the same builders). Same arguments and shapes as
 * lib/seo/countryCopy.ts. Voice: the observation ledger („Beobachtungsbuch“) — a restock is a „Rückkehr“, a listed
 * variant is „im Regal“. Every sentence comes from the live shelf, the return log, apple.com list prices and the
 * country's tax rule. <title> and meta description builders keep their search wording.
 */
import type { Dict } from "../en";
import * as cc from "@/lib/seo/countryCopy";
import type { HomeCopyInput, IntlPlaceInput, RestockTimesBrief } from "@/lib/seo/countryCopy";
import { MODELS, catalogFor, citiesWithStores, statesWithStores, storesOf, modelByKey, type ModelKey, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import { CA_PROVINCE_TAX, CA_TAX_SOURCE, TAX_SOURCES, beforeTax, pickupHelp, storeListSource, withProvinceTax } from "@/content/country-tax";
import { alertHref, fmtDuration, type FaqItem } from "@/lib/seo/enrich";
import type { Block, Faq, Source } from "@/lib/content/types";
import type { KeywordSection } from "@/components/content/KeywordSections";
import { list, stamp } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, regionLabel } from "@/lib/i18n/places";
import { content } from "./content";
import { LANG, dativ, fitDe, ganzIn, inLand, inOrt, land, modelDe, money, n, pct, plural, regionWord, satz, steuer, taxNote, uhr } from "./util";

const C = (code: CountryCode) => COUNTRIES[code];
const apple = (s: Store) => appleStoreLabel(s, LANG);
const words = (items: string[], max = 6) => list(LANG, items, max, (k) => `${n(k)} weitere`);
const hat = (k: number) => (k === 1 ? "hat" : "haben");
/** "keinem der 16 Stores", "keinem der beiden Stores" (dative, after "in"). */
const keinemDer = (k: number) => `keinem der ${k === 2 ? "beiden" : n(k)} Stores`;
/** A place of an IntlPlaceInput in German ("Bavaria" → "Bayern", "Munich" → "München"). */
/** Swiss region pages are cantons ("Kanton Zürich" holds Wallisellen too), so they say so. */
const nameOf = (i: IntlPlaceInput) => (i.kind === "state" ? `${i.cc === "ch" ? "Kanton " : ""}${regionLabel(i.cc, i.name, LANG)}` : cityLabel(i.cc, i.name, LANG));

function sinceWhen(now = Date.now()): string {
  return now - Date.parse(`${cc.INTL_TRACKING_SINCE}T00:00:00Z`) < 30 * 86400_000 ? "ab Aufzeichnungsbeginn am 2. November" : "im laufenden 30-Tage-Fenster";
}

function placeLabel(code: CountryCode, name: string): string {
  return cc.placeLabel(code, name) === name ? name : `${name}, ${land(code)}`;
}

function whenIn(code: CountryCode, iso: string | Date): string {
  return stamp(LANG, iso, C(code).timeZone, true);
}

/* ------------------------------------------------------------------ tax */

function taxSentence(code: CountryCode, region?: string): string {
  const c = C(code);
  const duo = cc.priceOf(code, "duo");
  if (duo == null) return "";
  if (code === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    if (t) return `Steuernotiz: iPhone Duo 256GB mit ${money(c, duo)} netto gelistet; ${region} schlägt an der Theke ${pct(t.rate)} ${CA_PROVINCE_TAX[region!].label} auf, macht rund ${money(c, t.total)}.`;
    return `Steuernotiz: iPhone Duo 256GB mit ${money(c, duo)} netto gelistet; die Provinz des Abhol-Stores legt zwischen 5 % und 15 % obendrauf.`;
  }
  const t = steuer(c);
  if (t.rate == null) return `Steuernotiz: Hongkong kennt keine Umsatzsteuer – das iPhone Duo 256GB bleibt an der Abholtheke bei seinen ${money(c, duo)} Listenpreis.`;
  return `Steuernotiz: Listenpreis ${inLand(code)} für das iPhone Duo 256GB ${money(c, duo)}; die ${pct(t.rate)} ${t.name} sind schon eingerechnet, an der Abholtheke bleibt die Summe gleich.`;
}

const PRICE_ROWS: [ModelKey, string][] = [["duo", "256GB"], ["duo", "1TB"], ["18-pro-max", "256GB"], ["18-pro-max", "1TB"], ["18-pro", "256GB"]];

/** The tax authority in German where it publishes in German (EU: Your Europe; Switzerland: ESTV). */
const EU_DE: Source = { label: "MwSt-Vorschriften und -Sätze in den Mitgliedstaaten · EU-Portal „Ihr Europa“", url: "https://europa.eu/youreurope/business/taxation/vat/vat-rules-rates/index_de.htm" };
const CH_DE: Source = { label: "Schweizer Mehrwertsteuersätze · veröffentlicht von der Eidgenössischen Steuerverwaltung (ESTV)", url: "https://www.estv.admin.ch/estv/de/home/mehrwertsteuer/mwst-steuersaetze.html" };
function taxSource(code: Exclude<CountryCode, "us">): Source {
  if (code === "ch") return CH_DE;
  if (TAX_SOURCES[code].url === TAX_SOURCES.de.url) return EU_DE;
  return TAX_SOURCES[code];
}

function priceSection(code: CountryCode, placeName: string, region?: string, model: ModelKey = "duo"): KeywordSection {
  const c = C(code);
  const m = modelByKey(model)!;
  const base = cc.priceOf(code, model) ?? 0;
  const src = taxSource(code as Exclude<CountryCode, "us">);
  const shop = `apple.com/${c.buyPath ?? c.shopPath}`;
  const rows: [string, number][] = PRICE_ROWS.flatMap(([k, st]) => { const p = cc.priceOf(code, k, st); return p == null ? [] : [[`${modelByKey(k)!.name} ${st}`, p] as [string, number]]; });
  if (code === "ca") {
    const t = region ? CA_PROVINCE_TAX[region] : undefined;
    if (t) {
      const table: Block = {
        t: "table",
        head: ["Variante", "Listenpreis (apple.com, netto)", `Nach ${pct(t.total)} ${t.label}`],
        rows: rows.map(([label, p]) => [label, money(c, p), money(c, withProvinceTax(p, region!)!.total)]),
        caption: `Abholung in ${region}: kanadischer Listenpreis, ${t.label} (${pct(t.total)}) aufgeschlagen`,
        source: `[${CA_TAX_SOURCE.label}](${CA_TAX_SOURCE.url}) · Preisstand apple.com/ca`,
      };
      return {
        id: "price-with-tax",
        h2: `Was das ${m.name} ${inOrt(placeName)} nach Steuern kostet`,
        lead: `Listenpreis des ${m.name} 256GB: **${money(c, base)} netto**. ${region} rechnet ${pct(t.total)} Steuer hinzu, ein Store ${inOrt(placeName)} verlangt also rund **${money(c, withProvinceTax(base, region!)!.total)}**.`,
        blocks: [{ t: "note", text: "**Den Satz legt der Abhol-Store fest:** Es zählt seine Provinz, egal welche Rechnungsadresse du angibst." }, table],
      };
    }
    const provinces = Object.keys(CA_PROVINCE_TAX).filter((p) => storesOf("ca").some((s) => s.state === p));
    const cheapest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total < CA_PROVINCE_TAX[a].total ? b : a));
    const dearest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total > CA_PROVINCE_TAX[a].total ? b : a));
    return {
      id: "price-with-tax",
      h2: `${m.name} nach Steuern, Provinz für Provinz`,
      lead: `**${money(c, base)}** ist der Nettolistenpreis des ${m.name} 256GB. Abgeholt in ${cheapest} (${pct(CA_PROVINCE_TAX[cheapest].total)}) werden daraus **${money(c, withProvinceTax(base, cheapest)!.total)}**, in ${dearest} (${pct(CA_PROVINCE_TAX[dearest].total)}) sogar **${money(c, withProvinceTax(base, dearest)!.total)}**.`,
      blocks: [{
        t: "table",
        head: ["Provinz", "Abgabe", "Satz", `${m.short} 256GB nach Steuern`],
        rows: provinces.map((p) => [p, CA_PROVINCE_TAX[p].label, pct(CA_PROVINCE_TAX[p].total), money(c, withProvinceTax(base, p)!.total)]),
        caption: "Steuer an der Abholtheke, für jede Provinz mit Apple Store",
        source: `[${CA_TAX_SOURCE.label}](${CA_TAX_SOURCE.url}) · Preisstand apple.com/ca`,
      }],
    };
  }
  const t = steuer(c);
  const r = t.rate;
  return {
    id: "price",
    h2: `${m.name} ${inLand(code)}: Listenpreis ${money(c, base)}, ${taxNote(c)}`,
    lead: r == null
      ? `Hongkong erhebt **weder Umsatz- noch Mehrwertsteuer**: Die **${money(c, base)}**, die apple.com für das ${m.name} 256GB listet, sind bei der Abholung ${inOrt(placeName)} die ganze Rechnung.`
      : `Für **${money(c, base)}** gibt es das ${m.name} 256GB ${inLand(code)}; in diesem Betrag stecken bereits **${pct(r)} ${t.name}** (ohne sie ${money(c, beforeTax(c, base))}). Wer ${inOrt(placeName)} abholt, zahlt keine weitere Steuer.`,
    blocks: [{
      t: "table",
      head: r == null ? ["Variante", "Listenpreis (apple.com)"] : ["Variante", "Listenpreis (apple.com)", `Abzüglich ${pct(r)} ${t.name}`],
      rows: rows.map(([label, p]) => (r == null ? [label, money(c, p)] : [label, money(c, p), money(c, beforeTax(c, p))])),
      caption: `Listenpreise ${inLand(code)}${r == null ? "" : ` (${t.name} eingerechnet)`}`,
      source: `[${src.label}](${src.url}) · Preisstand ${shop}`,
    }],
  };
}

function taxFaq(code: CountryCode, placeName: string, region?: string): FaqItem {
  const c = C(code);
  const duo = cc.priceOf(code, "duo") ?? 0;
  if (code === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    return t
      ? { q: `Welchen Endpreis hat ein iPhone Duo 256GB ${inOrt(placeName)}?`, a: `Rund ${money(c, t.total)}. Apple listet es mit ${money(c, duo)} netto, und der Store, in dem du abholst, schlägt die ${pct(t.rate)} ${CA_PROVINCE_TAX[region!].label} von ${region} auf.` }
      : { q: "Steckt die Steuer schon in Apples kanadischem Listenpreis?", a: `Nein: ${money(c, duo)} für ein iPhone Duo 256GB sind der Nettobetrag. GST, HST oder die eigene Provinzsteuer erhebt dann die Provinz des Abhol-Stores – Alberta mit 5 % am niedrigsten, Quebec mit 14,975 % am höchsten.` };
  }
  const t = steuer(c);
  return t.rate == null
    ? { q: "Verlangt Hongkong bei der Abholung Steuer auf ein iPhone?", a: `Nein, Hongkong kennt weder Mehrwert- noch Umsatzsteuer. Ein iPhone Duo 256GB kostet an der Abholtheke deshalb seine ${money(c, duo)} Listenpreis.` }
    : { q: `Sind die ${pct(t.rate)} ${t.name} schon Teil dessen, was apple.com ${inLand(code)} berechnet?`, a: `Ja. Die ${money(c, duo)}, die für ein iPhone Duo 256GB gelistet sind, tragen die ${pct(t.rate)} ${t.name} bereits in sich; an der Theke wird bei der Abholung keine Steuer nachgefordert.` };
}

/* ------------------------------------------------------------------ region / city pages */

function placeTitle(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = placeLabel(i.cc, nameOf(i));
  return fitDe([
    `Apple Stores ${inOrt(w)}: iPhone-Duo-Verfügbarkeit in ${k === 2 ? "beiden" : `allen ${n(k)}`} live`,
    `Apple Stores ${inOrt(w)}: iPhone-Duo-Verfügbarkeit live`,
    `Apple Stores ${inOrt(w)}: iPhone-Verfügbarkeit`,
    `Apple Store ${w}: iPhone-Verfügbarkeit`,
  ], 60, i.cc);
}

function priceBit(code: CountryCode, region?: string): string {
  const c = C(code);
  const duo = cc.priceOf(code, "duo");
  if (duo == null) return "";
  if (code === "ca") { const t = region ? withProvinceTax(duo, region) : null; return t ? `, etwa ${money(c, t.total)} mit Steuer in ${region}` : `, ${money(c, duo)} vor Steuern`; }
  return `, ${money(c, duo)} ${taxNote(c)}`;
}

function placeDescription(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = placeLabel(i.cc, nameOf(i));
  const duo = i.stockNow.duo, pm = i.stockNow["18-pro-max"];
  return fitDe([
    satz(`${n(k)} Apple Stores ${inOrt(w)}: ${duo} ${hat(duo)} das iPhone Duo jetzt zur Abholung, ${pm} das 18 Pro Max. Live je Store, Restock-Zeiten${priceBit(i.cc, i.region)}`),
    `${n(k)} Apple Stores ${inOrt(w)}: ${duo} mit iPhone Duo zur Abholung, ${pm} mit 18 Pro Max. Live je Store, Restock-Zeiten.`,
  ], 155, i.cc);
}

function placeIntro(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? ` (${plural(i.cities, "Stadt", "Städte")})` : "";
  return `${nameOf(i)}${cities} steht mit **${plural(k, "Apple Store", "Apple Stores")}** im Beobachtungsbuch. Beim letzten Blick lag das Duo in **${i.stockNow.duo}** davon im Regal, das 18 Pro Max in **${i.stockNow["18-pro-max"]}**, das 18 Pro in **${i.stockNow["18-pro"]}**.`;
}

function duoLead(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const have = cc.duoStoresNow(i);
  const st = i.duo;
  if (have.length > 0) return `Im Regal beim letzten Blick: ${words(have.map(apple), 4)} (**${have.length}/${n(k)} Stores**).`;
  if (st.month > 0) return `Derzeit liegt in **${keinemDer(k)}** ein iPhone Duo im Regal; das Buch verzeichnet ${sinceWhen()} trotzdem **${plural(st.month, "bestätigte Rückkehr", "bestätigte Rückkehren")}**.`;
  return `Derzeit liegt in **${keinemDer(k)}** ein iPhone Duo im Regal, und ${sinceWhen()} steht hier keine bestätigte Rückkehr im Buch.`;
}

function duoPoints(i: IntlPlaceInput, w: string, alert: string): Block[] {
  const k = i.stores.length;
  const have = cc.duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (have.length > 0 && st.month > 0) items.push(`**Rückkehren ${sinceWhen()}:** ${plural(st.month, "Duo-Rückkehr", "Duo-Rückkehren")} quer durch diese Stores`);
  if (st.lastRestock && last) items.push(`**Jüngste Rückkehr:** ${apple(last)}, ${whenIn(i.cc, st.lastRestock.at)}`);
  if (st.medianMs != null) items.push(`**Zeit im Regal (Median):** rund ${fmtDuration(st.medianMs, LANG)} von der Rückkehr bis „weg“`);
  const which = k === 1 ? "im Store hier" : k <= 3 ? `in den ${k === 2 ? "beiden" : "drei"} Stores, die du erreichst` : `in den ${Math.min(k, 5)} nächstgelegenen Stores, die du erreichst`;
  items.push(`**Merkliste:** [iPhone Duo ${inOrt(w)} beobachten](${alert}) – ${which}`);
  items.push("**Umfang eines Eintrags:** genau ein Store und genau eine Variante; die Benachrichtigung folgt der erkannten Listung nach der Synchronisierung, ihr Timing schwankt");
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: "**Der Regalstand wechselt ohne Ankündigung:** Ein Eintrag auf der Merkliste meldet sich eher, als ständiges Neuladen von apple.com es könnte." });
  blocks.push({ t: "ul", items });
  return blocks;
}

function placeSections(i: IntlPlaceInput): KeywordSection[] {
  const k = i.stores.length;
  const w = nameOf(i);
  const alert = alertHref({ model: "duo", state: i.regionSlug, city: i.kind === "city" ? i.citySlug : undefined, country: i.cc });
  const scarce = cc.scarcest(i, "18-pro-max");
  const pm = catalogFor("18-pro-max", i.cc).length;
  const pmNow = i.stockNow["18-pro-max"];
  return [
    {
      id: "iphone-duo",
      h2: `${w}: Wo das iPhone Duo im Regal liegt`,
      lead: duoLead(i),
      blocks: duoPoints(i, w, alert),
    },
    {
      id: "iphone-18-pro-max",
      h2: `${w}: das 18 Pro Max, Store für Store`,
      lead: `Das Pro Max liegt in **${pmNow}/${n(k)} Stores** im Regal; über alle ${n(k * pm)} Paare aus Store und Variante gerechnet sind **${pct(cc.pairsPct(i, "18-pro-max"))}** gelistet.`,
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**Dünnste Auswahl gerade:** ${words(scarce.map((x) => `${modelDe(x.label)}, ${x.stores}/${n(k)} Stores`))}`] : []),
        `**Daneben das 18 Pro:** ${i.stockNow["18-pro"]}/${n(k)} Stores, ${pct(cc.pairsPct(i, "18-pro"))} der Paare gelistet`,
        `**Pro-Max-Rückkehren ${sinceWhen()}:** ${i.max.month ? plural(i.max.month, "bestätigte Rückkehr", "bestätigte Rückkehren") : "keine verzeichnet"}`,
        ...(i.max.medianMs != null ? [`**Zeit im Regal (Median):** rund ${fmtDuration(i.max.medianMs, LANG)} für ein zurückgekehrtes Pro Max`] : []),
      ] }],
    },
    priceSection(i.cc, w, i.cc === "ca" ? i.region : undefined),
  ];
}

/* ------------------------------------------------------------------ country: store index and home */

function storesIndexTitle(code: CountryCode): string {
  const k = storesOf(code).length;
  if (k === 1) return fitDe([`Apple Store ${inLand(code)}: iPhone-Verfügbarkeit live`, `Apple Store ${land(code)}: iPhone-Verfügbarkeit`], 70, code);
  return fitDe([
    `Apple Stores ${inLand(code)}: iPhone-Duo-Verfügbarkeit live in ${k === 2 ? "beiden" : `allen ${n(k)}`}`,
    `Apple Stores ${inLand(code)}: iPhone-Duo-Verfügbarkeit live`,
    `Apple Stores ${inLand(code)}: iPhone-Verfügbarkeit live`,
  ], 70, code);
}

function homeTitle(code: CountryCode): string {
  const k = storesOf(code).length;
  if (k === 1) return fitDe([`iPhone Duo verfügbar? Der Apple Store ${inLand(code)} live`, `iPhone-Verfügbarkeit ${inLand(code)}: Apple Store live`], 60, code);
  return fitDe([
    `iPhone Duo verfügbar? Alle ${n(k)} Apple Stores ${inLand(code)} live`,
    `iPhone Duo verfügbar? ${n(k)} Apple Stores ${inLand(code)} live`,
    `iPhone-Verfügbarkeit: ${n(k)} Apple Stores ${inLand(code)}`,
  ], 60, code);
}

function homeH1(code: CountryCode): string {
  const k = storesOf(code).length;
  return k === 1 ? `Abhol-Beobachtungsbuch für den Apple Store ${inLand(code)}` : `Abhol-Beobachtungsbuch für ${n(k)} Apple Stores ${inLand(code)}`;
}

function allStoresPhrase(code: CountryCode): string {
  const k = storesOf(code).length;
  return k === 1 ? `der einzige Apple Store ${inLand(code)}` : `${n(k)} Apple Stores ${ganzIn(code)}`;
}

function spreadPhrase(code: CountryCode): string {
  const c = C(code);
  const regions = statesWithStores(code);
  const cities = citiesWithStores(code);
  const k = storesOf(code).length;
  const city = (x: string) => cityLabel(code, x, LANG);
  if (k === 1) return `Standort ${city(cities[0].name)}`;
  if (cities.length === 1) return `sämtlich in ${city(cities[0].name)}`;
  const overCities = `verteilt auf ${n(cities.length)} Städte`;
  if (!c.regionNoun || regions.length === 1) return overCities;
  return `${overCities} in ${n(regions.length)} ${dativ(regionWord(c, true))}`;
}

function modelPageTitles(code: CountryCode, model: ModelKey): { title: string; h2: string[] } {
  const m = modelByKey(model)!;
  const k = storesOf(code).length;
  const all = k === 1 ? "im Apple Store" : k === 2 ? "in beiden Apple Stores" : `in allen ${n(k)} Apple Stores`;
  return {
    title: fitDe([`${m.name} verfügbar? Live ${all} ${inLand(code)}`, `${m.name}: Verfügbarkeit ${inLand(code)} live`, `${m.name} Verfügbarkeit ${land(code)}`], 70, code),
    h2: [`${m.name} ${inLand(code)}: In welchen Regalen es gerade liegt`, priceSection(code, land(code), undefined, model).h2],
  };
}

function modelIntro(code: CountryCode, model: ModelKey, inStock: number): string {
  const c = C(code);
  const m = modelByKey(model)!;
  const k = storesOf(code).length;
  const r = cc.priceRange(code, model);
  const price = code === "ca" ? `**${money(c, r.low)}** netto` : `**${money(c, r.low)}**, ${taxNote(c)}`;
  const now = inStock === 0
    ? `Das ${m.name} liegt ${k === 1 ? "im einzigen Apple Store" : `in allen ${n(k)} Apple Stores`} ${inLand(code)} gerade **nicht** im Regal`
    : `Das ${m.name} liegt in **${inStock}/${n(k)}** Apple Stores ${inLand(code)} im Regal`;
  return satz(`${now} – Stand der angezeigten Beobachtungszeit; Listenpreise ab ${price}`);
}

function modelDescription(code: CountryCode, model: ModelKey, inStock: number): string {
  const c = C(code);
  const m = modelByKey(model)!;
  const k = storesOf(code).length;
  const r = cc.priceRange(code, model);
  const from = `ab ${money(c, r.low)}${code === "ca" ? " vor Steuern" : ""}`;
  if (k === 1) {
    const now = inStock > 0 ? "hat es jetzt zur Abholung" : "hat es gerade nicht zur Abholung";
    return fitDe([
      `Ist das ${m.name} ${inLand(code)} verfügbar? Der Apple Store ${inLand(code)} ${now}. Live je Konfiguration, ${from}, mit Restock-Zeiten und Alarm.`,
      `${m.name} ${inLand(code)}: Der Apple Store ${now}. Live je Konfiguration, Restock-Zeiten und Alarm.`,
    ], 155, code);
  }
  return fitDe([
    `Ist das ${m.name} ${inLand(code)} verfügbar? ${inStock} von ${n(k)} Apple Stores ${hat(inStock)} es jetzt zur Abholung. Live je Store und Konfiguration, ${from}, mit Restock-Zeiten.`,
    `${m.name} ${inLand(code)}: ${inStock} von ${n(k)} Apple Stores ${hat(inStock)} es jetzt. Live-Verfügbarkeit je Store und Konfiguration, Restock-Zeiten, Alarme.`,
  ], 155, code);
}

function modelRows(code: CountryCode, storesNow: Record<ModelKey, number>, restocks: Record<ModelKey, number>): string[][] {
  const prefix = code === "us" ? "" : `/${code}`;
  return MODELS.map((m) => [`[${m.name}](${prefix}/stock/${m.slug})`, n(catalogFor(m.key, code).length), n(storesNow[m.key] ?? 0), n(restocks[m.key] ?? 0)]);
}

/* ------------------------------------------------------------------ country home */

function homeDescription(code: CountryCode): string {
  const c = C(code);
  const k = storesOf(code).length;
  const where = k === 1 ? `im Apple Store ${inLand(code)}` : `in allen ${n(k)} Apple Stores ${inLand(code)}`;
  const times = k === 1 ? "" : "Restock-Zeiten, ";
  return fitDe([
    `iPhone Duo, 18 Pro, Pro Max: Verfügbarkeit ${where}, live alle 15 Sekunden. ${times}Preise in ${c.currency}, Push bei Nachschub.`,
    `iPhone Duo, 18 Pro, Pro Max: Verfügbarkeit ${where}, live alle 15 Sekunden. ${times}Preise, Push bei Nachschub.`,
    `iPhone-Verfügbarkeit ${where}, live alle 15 Sekunden, mit Restock-Zeiten und Push bei Nachschub.`,
  ], 155, code);
}

function homeIntro(code: CountryCode): string {
  const k = storesOf(code).length;
  return `Letzter Regalstand ${inLand(code)}: iPhone Duo in **{{duo.storesNow}}/${n(k)}** Apple ${k === 1 ? "Store" : "Stores"}, 18 Pro in **{{pro.storesNow}}**, 18 Pro Max in **{{pm.storesNow}}**.`;
}

function homeSections(i: HomeCopyInput): KeywordSection[] {
  const code = i.cc;
  const c = C(code);
  const k = storesOf(code).length;
  const stores = storesOf(code);
  return [
    {
      id: "iphone-stock",
      h2: `Das Regal ${inLand(code)}: Duo, 18 Pro und Pro Max nach Store`,
      lead: `ShelfSpring notiert die Abhol-Listungen von apple.com für jede Variante ${k === 1 ? `im Apple Store ${inLand(code)}` : `in ${allStoresPhrase(code)}`} aus einem synchronisierten Bestandsfeed – lesbar nach Variante, nach Store${k > 1 ? ` und nach ${c.regionNoun ? regionWord(c) : "Stadt"}` : ""}.`,
      blocks: [
        { t: "table", head: ["iPhone", "Beobachtete Varianten", "Stores mit ihm im Regal", "Rückkehren im Buch"], rows: modelRows(code, i.storesNow, i.restocks), caption: `Beobachtungsumfang ${inLand(code)} · Momentaufnahme {{asOf}}` },
        { t: "ul", items: [
          `**Umfang:** ${spreadPhrase(code)}; Teilenummern und Listenpreise stammen aus Apples Store für ${land(code)}`,
          "**Ein Blick alle 15 Sekunden** auf jeden Store",
          "**Gezählt wird erst bei zwei übereinstimmenden Beobachtungen:** Ein Ausreißer von apple.com erzeugt weder eine Schein-Rückkehr noch ein falsches „weg“",
          `**Jeder bestätigte Wechsel** steht danach im [Rückkehr-Logbuch](${i.restocksPath}), der Quelle der Stunden-Diagramme auf ${i.index?.indexable ? `[jeder Store-Seite](${i.index.path})` : "der Store-Seite"}`,
        ] },
        { t: "img", id: "phone-notification" },
      ],
    },
    priceSection(code, land(code)),
    {
      id: "alerts",
      h2: `Eine Merkliste für Abholungen im Apple Store ${inLand(code)}`,
      lead: `Mitlesen kostet nichts; die Merkliste nimmt dir das ständige Nachsehen ab. Du legst ${k === 1 ? "den Apple Store" : "die Apple Stores, die du erreichst,"} und das genaue iPhone fest – listet ${k === 1 ? "der Store" : "einer davon"} es zur Abholung, geht eine Benachrichtigung an dein Handy.`,
      blocks: [
        { t: "ol", items: [
          "Merkliste öffnen, dann Modell, Kapazität und Finish festlegen.",
          k === 1 ? `Store auswählen: ${apple(stores[0])} in ${cityLabel(code, stores[0].city, LANG)}.` : "Erreichbare Stores auswählen; die Liste beginnt mit den nächstgelegenen und zeigt Straßenkilometer und geschätzte Fahrzeit.",
          "Auf dem iPhone ShelfSpring aus Safari auf den Home-Bildschirm legen und Mitteilungen einschalten ([Einrichtung](/install)).",
          "Aus der Benachrichtigung zu apple.com wechseln, prüfen, ob der Store die Variante noch listet, und dort Abholung im Store wählen.",
        ] },
        { t: "table", head: ["Merkliste", "Monatlich (USD)", "Einträge (Store × Variante)"], rows: [["Plus", "$5", "10"], ["Pro", "$10", "20"], ["Max", "$20", "50"]], caption: "Jeder Eintrag beobachtet einen Store und eine exakte Variante; im Buch lesen kostet nichts ([Tarife](/pricing))" },
        { t: "note", text: "**Aus dem Notizbuch:** Fürs Duo lohnt ein Eintrag für jeden erreichbaren Store; beim 18 Pro und Pro Max zuerst den aktuellen Regalstand lesen." },
        { t: "img", id: "apple-store-pickup-counter" },
      ],
    },
  ];
}

function homeFaq(code: CountryCode, rt: RestockTimesBrief): Faq[] {
  const k = storesOf(code).length;
  const p = code === "us" ? "" : `/${code}`;
  const when = rt.n === 0
    ? `Die Aufzeichnung ab 2. November enthält noch keine bestätigte Rückkehr; [die Duo-Rückkehrzeiten ${inLand(code)}](${rt.path}) ordnen jede neue nach Store-Uhr und Wochentag ein.`
    : rt.peakHour != null
      ? `Sie häufen sich gegen **${uhr(rt.peakHour)} Store-Zeit** – gemessen an ${n(rt.n)} bestätigten Rückkehren in ${rt.stores}/${rt.storesTotal} Stores seit dem 2. November ([alle Stunden und Wochentage](${rt.path})).`
      : `Seit dem 2. November stehen ${n(rt.n)} bestätigte Rückkehren in ${rt.stores}/${rt.storesTotal} Stores im Buch, verteilt auf zu wenige Tage für eine übliche Stunde ([alle Stunden und Wochentage](${rt.path})).`;
  return [
    k === 1
      ? { q: `Liegt im Apple Store ${inLand(code)} gerade ein iPhone Duo?`, a: `Momentaufnahme {{asOf}}: **{{duo.storesNow}}/1**. Jede Variante mit eigenem Zeitstempel steht auf der [Duo-Übersicht ${inLand(code)}](${p}/stock/iphone-duo).` }
      : { q: `Wo ${inLand(code)} liegt das iPhone Duo gerade im Regal?`, a: `In {{duo.storesNow}}/${n(k)} Stores beim letzten Blick ({{asOf}}); die [Duo-Übersicht ${inLand(code)}](${p}/stock/iphone-duo) führt jeden Store und jede Variante mit eigenem Zeitstempel.` },
    { q: `Zu welcher Stunde kehrt das iPhone Duo ${inLand(code)} zurück?`, a: when },
    { q: "Wann erreicht mich eine Benachrichtigung?", a: `Nachdem eine Rückkehr im synchronisierten Feed ${inLand(code)} auftaucht. Abfrage, Synchronisierung, Netz und Geräteeinstellungen bringen jeweils etwas Verzögerung, und alle Tarife lesen denselben Feed – prüf die Listung bei Apple, bevor du losfährst.` },
    { q: "Was ist gratis, was kostet?", a: "Buch, Atlas und Rückkehr-Logbuch zu lesen ist gratis. Merklisten gibt es als Plus ($5 im Monat, 10 Einträge), Pro ($10, 20) und Max ($20, 50), abgerechnet in US-Dollar und im Konto kündbar ([Tarife](/pricing))." },
    taxFaq(code, land(code)),
    { q: "Legt ShelfSpring mir ein Gerät zurück?", a: `Das geht nicht: Eine Benachrichtigung zeigt auf eine erkannte Listung, sichern kann das Gerät nur eine auf apple.com abgeschlossene und bestätigte Bestellung ([Apples Abhol-Hilfe](${pickupHelp(code).url})).` },
  ];
}

/** "in ganz Deutschland"; a one-store country keeps "in Österreich". */
const acrossLand = (code: CountryCode) => (storesOf(code).length === 1 ? inLand(code) : ganzIn(code));

const home: Dict["place"]["home"] = {
  appName: (code: CountryCode) => `ShelfSpring Abhol-Beobachtungsbuch ${land(code)}`,
  offer: "Buch, Atlas und Rückkehr-Logbuch kosten nichts; Merklisten ab $5 im Monat",
  itemList: (code: CountryCode) => `Apple Stores ${inLand(code)}`,
  restockTimesChip: "Stunden früherer Rückkehren",
  storesByRegion: (code: CountryCode) => `Nach ${regionWord(C(code))} blättern`,
  browse: (code: CountryCode) => `Mehr aus dem Buch ${inLand(code)}`,
  selloutH2: (code: CountryCode) => `Wie lange blieb ein zurückgekehrtes iPhone ${inLand(code)} im Regal?`,
  selloutLabel: (code: CountryCode) => acrossLand(code),
  last24Label: (code: CountryCode) => acrossLand(code),
  newsroom: "„Das iPhone Duo kommt in die Apple Stores weltweit“ · Apple Newsroom, 23. Oktober 2026",
};

function storeTitle(s: Store, region?: string): string {
  const name = apple(s);
  const shown = region && !s.name.toLowerCase().includes(region.toLowerCase()) && !name.toLowerCase().includes(region.toLowerCase()) ? region : null;
  return fitDe(content.titles.store(name, shown), 60, s.country);
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
  home,
  storeTitle,
  sources: (code: Exclude<CountryCode, "us">) => ({
    pickupHelp: { label: `Apples Hilfeseite „Versand und Abholung“ für ${land(code)} – was du zur Abholung brauchst`, url: pickupHelp(code).url },
    storeList: { label: `Apples Store-Verzeichnis für ${land(code)}`, url: storeListSource(code).url },
    tax: taxSource(code),
  }),
};


export const place: Dict["place"] = withShelfPlace("de", basePlace);
