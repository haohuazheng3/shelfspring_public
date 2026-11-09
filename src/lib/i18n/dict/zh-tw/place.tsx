import { withShelfPlace } from "@/lib/seo/localizedCopy";
/**
 * 台灣中文：place —— 各國頁面樹（首頁、門市索引、地區、城市、機型頁）的文案產生器，以台灣（tw）為主。
 * 與英文 lib/seo/countryCopy.ts 同樣的參數與回傳形狀；句子依即時數字組成。關鍵字：iPhone Duo、現貨查詢、
 * Apple 直營店、門市取貨、價格（Google Ads 台灣：iphone duo 33,100、apple 直營店 8,100、iphone duo 價格 1,900、
 * iphone 現貨 查詢 170）。地名參數多半是英文資料，這裡一律用 places.ts 換成 Apple 台灣的寫法。
 */
import * as cc from "@/lib/seo/countryCopy";
import type { HomeCopyInput, IntlPlaceInput, RestockTimesBrief } from "@/lib/seo/countryCopy";
import { CA_PROVINCE_TAX, CA_TAX_SOURCE, TAX_SOURCES, beforeTax, includedRate, pickupHelp, storeListSource, withProvinceTax } from "@/content/country-tax";
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { catalogFor, citiesWithStores, modelByKey, statesWithStores, storesOf, type ModelKey, type Store } from "@/lib/apple/catalog";
import { alertHref, fmtDuration, type FaqItem } from "@/lib/seo/enrich";
import type { Block, Faq, Source } from "@/lib/content/types";
import type { KeywordSection } from "@/components/content/KeywordSections";
import { fitTitleW, list, price } from "../../format";
import { appleStoreLabel, cityLabel, regionLabel, storeLabel } from "../../places";
import type { Dict } from "../en";
import { content } from "./content";
import { L, cn, currencyZh, hh, n, regionZh, stampZh, taxName, taxNoteZh, zhCfg, zoneName, zs } from "./util";

const money = (c: Country, v: number) => price(L, c, v);
const TRACKING_START = "2026-11-02";

/** 紀錄範圍：「在 11 月 2 日起的歷史紀錄裡」（匯入的歷史還不滿 30 天時），之後是「在最新 30 天的範圍內」。 */
function sinceWhen(now = Date.now()): string {
  return now - Date.parse(`${TRACKING_START}T00:00:00Z`) < 30 * 86400_000 ? "在 11 月 2 日起的歷史紀錄裡" : "在最新 30 天的範圍內";
}
/** 同一範圍的標籤寫法（括號、冒號前）：「11 月 2 日起」／「最新 30 天」。 */
function windowLabel(now = Date.now()): string {
  return now - Date.parse(`${TRACKING_START}T00:00:00Z`) < 30 * 86400_000 ? "11 月 2 日起" : "最新 30 天";
}

/** 地名參數（英文資料或已是中文）→ Apple 台灣的寫法。 */
const placeOf = (i: IntlPlaceInput) => (i.kind === "city" ? cityLabel(i.cc, i.name, L) : regionLabel(i.cc, i.name, L));

/** 「11 月 3 日 上午 10:31（台北標準時間）」。 */
function whenIn(code: CountryCode, iso: string | Date): string {
  const tz = COUNTRIES[code].timeZone;
  return `${stampZh(iso, tz)}（${zoneName(tz, iso)}）`;
}

/* ------------------------------------------------------------------ 稅與價格 */

function taxSentence(code: CountryCode, region?: string): string {
  const c = COUNTRIES[code];
  const duo = cc.priceOf(code, "duo");
  if (duo == null) return "";
  if (code === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    if (t) return zs(`${money(c, duo)} 是 iPhone Duo 256GB 的未稅定價；${region}在櫃台再收 ${t.rate}% ${CA_PROVINCE_TAX[region!].label}，合計大約 ${money(c, t.total)}。`);
    return zs(`${money(c, duo)} 是 iPhone Duo 256GB 的未稅定價；取貨門市所在的省份會再加 5% 到 15%。`);
  }
  const r = includedRate(c);
  if (r == null) return zs(`香港不課銷售稅，到店領取的 iPhone Duo 256GB 就是定價 ${money(c, duo)}，不會多出一毛。`);
  return zs(`${money(c, duo)} 是 iPhone Duo 256GB 在${cn(code)}的定價，裡面已經算進 ${r}% ${taxName(code)}，所以取貨不必再付稅。`);
}

const PRICE_ROWS: [ModelKey, string][] = [["duo", "256GB"], ["duo", "1TB"], ["18-pro-max", "256GB"], ["18-pro-max", "1TB"], ["18-pro", "256GB"]];

/** 各國的稅務來源；台灣指向財政部賦稅署中文網站。 */
function taxSource(code: Exclude<CountryCode, "us">): Source {
  return code === "tw" ? { label: "營業稅說明（財政部賦稅署）", url: "https://www.dot.gov.tw/" } : TAX_SOURCES[code];
}

function priceSection(code: CountryCode, placeName: string, region?: string, model: ModelKey = "duo"): KeywordSection {
  const c = COUNTRIES[code];
  const m = modelByKey(model)!;
  const base = cc.priceOf(code, model) ?? 0;
  const src: Source = code === "us" ? { label: "apple.com", url: "https://www.apple.com/shop/buy-iphone" } : taxSource(code);
  const rows: [string, number][] = PRICE_ROWS.flatMap(([k, st]) => { const p = cc.priceOf(code, k, st); return p == null ? [] : [[`${modelByKey(k)!.name} ${st}`, p] as [string, number]]; });
  if (code === "ca") {
    const t = region ? CA_PROVINCE_TAX[region] : undefined;
    if (t) {
      return {
        id: "price-with-tax",
        h2: zs(`在${placeName}取貨，${m.name} 稅後實付多少`),
        lead: zs(`${m.name} 256GB 定價：**未稅 ${money(c, base)}**。${region}接著加上 ${t.total}% ${t.label}，在${placeName}的店取貨大約是 **${money(c, withProvinceTax(base, region!)!.total)}**。`),
        blocks: [
          { t: "note", text: "**稅率跟著取貨門市走：**由門市所在省份決定，跟你的帳單地址無關。" },
          { t: "table", head: ["組合", "定價（apple.com）", `加上 ${t.total}% ${t.label}`], rows: rows.map(([label, p]) => [label, money(c, p), money(c, withProvinceTax(p, region!)!.total)]), caption: zs(`${region}取貨：加拿大定價另加 ${t.label}（${t.total}%）`), source: `[${CA_TAX_SOURCE.label}](${CA_TAX_SOURCE.url})；定價出處：apple.com/ca` },
        ],
      };
    }
    const provinces = Object.keys(CA_PROVINCE_TAX).filter((p) => storesOf("ca").some((s) => s.state === p));
    const cheapest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total < CA_PROVINCE_TAX[a].total ? b : a));
    const dearest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total > CA_PROVINCE_TAX[a].total ? b : a));
    return {
      id: "price-with-tax",
      h2: zs(`${m.name} 稅後價格，一省一省列`),
      lead: zs(`**${money(c, base)}** 是 ${m.name} 256GB 的未稅定價。在${cheapest}（${CA_PROVINCE_TAX[cheapest].total}%）取貨合計 **${money(c, withProvinceTax(base, cheapest)!.total)}**；到了${dearest}（${CA_PROVINCE_TAX[dearest].total}%）會變成 **${money(c, withProvinceTax(base, dearest)!.total)}**。`),
      blocks: [{
        t: "table",
        head: ["省份", "稅目", "稅率", `${m.short} 256GB 稅後`],
        rows: provinces.map((p) => [p, CA_PROVINCE_TAX[p].label, `${CA_PROVINCE_TAX[p].total}%`, money(c, withProvinceTax(base, p)!.total)]),
        caption: "取貨櫃台加收的稅（只列設有 Apple 直營店的省份）",
        source: `[${CA_TAX_SOURCE.label}](${CA_TAX_SOURCE.url})；定價出處：apple.com/ca`,
      }],
    };
  }
  const r = includedRate(c);
  const tn = taxName(code);
  return {
    id: "price",
    h2: zs(`${cn(code)}的 ${m.name}：定價 ${money(c, base)}，${taxNoteZh(c)}`),
    lead: r == null
      ? zs(`香港**不課銷售稅**，加值稅也不收：${m.name} 256GB 在 apple.com 標的 **${money(c, base)}**，就是到${placeName}取貨要付的全部金額。`)
      : zs(`**${money(c, base)}** 就能在${cn(code)}買到 ${m.name} 256GB；這個數字已經包含 **${r}% ${tn}**（扣掉後是 ${money(c, beforeTax(c, base))}），在${placeName}取貨不會再加稅。`),
    blocks: [{
      t: "table",
      head: r == null ? ["組合", "定價（apple.com）"] : ["組合", "定價（apple.com）", `扣掉 ${r}% ${tn}後`],
      rows: rows.map(([label, p]) => (r == null ? [label, money(c, p)] : [label, money(c, p), money(c, beforeTax(c, p))])),
      caption: zs(`${cn(code)}定價一覽${r == null ? "" : `（${tn}已在內）`}`),
      source: `[${src.label}](${src.url})；定價出處：apple.com/${c.buyPath ?? c.shopPath}`,
    }],
  };
}

function taxFaq(code: CountryCode, placeName: string, region?: string): FaqItem {
  const c = COUNTRIES[code];
  const duo = cc.priceOf(code, "duo") ?? 0;
  if (code === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    return t
      ? { q: zs(`在${placeName}領 iPhone Duo 256GB，稅後大概多少？`), a: zs(`大約 ${money(c, t.total)}：Apple 的未稅定價是 ${money(c, duo)}，再由你取貨的那家店收${region}的 ${t.rate}% ${CA_PROVINCE_TAX[region!].label}。`) }
      : { q: "Apple 加拿大的定價裡有包含稅嗎？", a: zs(`沒有：iPhone Duo 256GB 的 ${money(c, duo)} 是未稅價，取貨那家店的省份再加上 GST、HST 或省營業稅（最低是 Alberta 5%，最高是 Quebec 14.975%）。`) };
  }
  const r = includedRate(c);
  return r == null
    ? { q: "在香港取貨，iPhone 會被加稅嗎？", a: zs(`一毛都不會加：香港既沒有加值稅，也沒有銷售稅，到店領取的 iPhone Duo 256GB 就是定價 ${money(c, duo)}。`) }
    : { q: zs(`apple.com 在${cn(code)}收的金額，已經包含 ${r}% ${taxName(code)}了嗎？`), a: zs(`包含：iPhone Duo 256GB 標示的 ${money(c, duo)} 裡面就有 ${r}% ${taxName(code)}，取貨時櫃台不會再收稅。`) };
}

/* ------------------------------------------------------------------ 地區、城市頁 */

function placeTitle(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = placeOf(i);
  return fitTitleW([
    `${w} Apple 直營店 iPhone Duo 即時現貨：${k === 2 ? "兩家" : `${n(k)} 家`}一次看`,
    `${w} Apple 直營店 iPhone Duo 即時現貨`,
    `${w} Apple 直營店 iPhone 現貨`,
    `${w} Apple 直營店`,
  ].map(zs));
}

function priceBit(code: CountryCode, region?: string): string {
  const c = COUNTRIES[code];
  const duo = cc.priceOf(code, "duo");
  if (duo == null) return "";
  if (code === "ca") { const t = region ? withProvinceTax(duo, region) : null; return t ? `、${region}含稅約 ${money(c, t.total)}` : `、未稅 ${money(c, duo)} 起`; }
  return `、價格 ${money(c, duo)} 起（${taxNoteZh(c)}）`;
}

function placeDescription(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = placeOf(i);
  return fitTitleW([
    `${w}共 ${n(k)} 家 Apple 直營店：現在 ${n(i.stockNow.duo)} 家可門市取貨 iPhone Duo、${n(i.stockNow["18-pro-max"])} 家有 18 Pro Max。各門市即時現貨、補貨時段${priceBit(i.cc, i.region)}。`,
    `${w}共 ${n(k)} 家 Apple 直營店：現在 ${n(i.stockNow.duo)} 家有 iPhone Duo、${n(i.stockNow["18-pro-max"])} 家有 18 Pro Max。各門市即時現貨與補貨時段。`,
  ].map(zs), 155);
}

function placeIntro(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? `（${n(i.cities)} 個城市）` : "";
  return zs(`觀測簿收錄了${placeOf(i)}${cities}的 **${n(k)} 家 Apple 直營店**。最近一次查看，iPhone Duo 在 **${n(i.stockNow.duo)}** 家上架中，18 Pro Max **${n(i.stockNow["18-pro-max"])}** 家，18 Pro **${n(i.stockNow["18-pro"])}** 家。`);
}

/** Duo 區塊的答案句：哪幾家現在有。 */
function duoLead(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const have = cc.duoStoresNow(i);
  const st = i.duo;
  if (have.length > 0) return zs(`上次查看時上架中：${list(L, have.map((s) => appleStoreLabel(s, L)), 4, (x) => `另外 ${n(x)} 家`)}（**${n(have.length)}/${n(k)} 家**）。`);
  if (st.month > 0) return zs(`iPhone Duo 目前在全部 **${n(k)} 家**都已下架；不過觀測簿${sinceWhen()}仍有 **${n(st.month)} 次確認的重新上架**。`);
  return zs(`iPhone Duo 在全部 **${n(k)} 家**都已下架，觀測簿${sinceWhen()}也沒有任何確認的重新上架。`);
}

function duoPoints(i: IntlPlaceInput, w: string, alert: string): Block[] {
  const k = i.stores.length;
  const have = cc.duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (have.length > 0 && st.month > 0) items.push(`**重新上架（${windowLabel()}）：**這些店合計 ${n(st.month)} 次 Duo 回架`);
  if (st.lastRestock && last) items.push(`**最近一次重新上架：**${appleStoreLabel(last, L)}，${whenIn(i.cc, st.lastRestock.at)}`);
  if (st.medianMs != null) items.push(`**上架時間中位數：**從回架到下架大約 ${fmtDuration(st.medianMs, L)}`);
  items.push(`**追蹤清單：**[追蹤${w}的 iPhone Duo](${alert})，${k <= 3 ? (k === 1 ? "加上這家店" : k === 2 ? "兩家都加進去" : "三家都加進去") : `加上你去得了、最近的 ${n(Math.min(k, 5))} 家`}`);
  items.push("**規則單位：**每則提醒只對應一家店加一個確切組合；偵測到上架並完成同步後才送出，時間不一定");
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: "**觀測簿還沒記到重新上架：**先把想要的組合放進追蹤清單，下單前再對照最新一次查看。" });
  blocks.push({ t: "ul", items: items.map(zs) });
  return blocks;
}

function placeSections(i: IntlPlaceInput): KeywordSection[] {
  const k = i.stores.length;
  const w = placeOf(i);
  const alert = alertHref({ model: "duo", state: i.regionSlug, city: i.kind === "city" ? i.citySlug : undefined, country: i.cc });
  const scarce = cc.scarcest(i, "18-pro-max");
  const pm = catalogFor("18-pro-max", i.cc).length;
  return [
    {
      id: "iphone-duo",
      h2: zs(`${w}：iPhone Duo 在哪幾家上架中`),
      lead: duoLead(i),
      blocks: duoPoints(i, w, alert),
    },
    {
      id: "iphone-18-pro-max",
      h2: zs(`${w}：18 Pro Max 各店上架情況`),
      lead: zs(`Pro Max 在 **${n(i.stockNow["18-pro-max"])}/${n(k)} 家**上架中；把所有「店 × 組合」（共 ${n(k * pm)} 個）算進來，**${cc.pairsPct(i, "18-pro-max")}%** 有上架。`),
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**目前選擇最少：**${list(L, scarce.map((x) => `${zhCfg(x.label)}，${n(x.stores)}/${n(k)} 家`))}`] : []),
        `**一旁的 18 Pro：**${n(i.stockNow["18-pro"])}/${n(k)} 家，${cc.pairsPct(i, "18-pro")}% 組合上架中`,
        `**Pro Max 重新上架（${windowLabel()}）：**${i.max.month ? `確認 ${n(i.max.month)} 次` : "沒有紀錄"}`,
        ...(i.max.medianMs != null ? [`**上架時間中位數：**回架的 Pro Max 大約 ${fmtDuration(i.max.medianMs, L)}`] : []),
      ].map(zs) }],
    },
    priceSection(i.cc, w, i.cc === "ca" ? i.region : undefined),
  ];
}

/* ------------------------------------------------------------------ 國家：門市索引與首頁 */

/** 店名（不含 Apple）：「台北 101」。 */
const shortName = (s: Store) => storeLabel(s, L);

function storesIndexTitle(code: CountryCode): string {
  const stores = storesOf(code);
  const k = stores.length;
  const w = cn(code);
  return fitTitleW([
    k <= 3 ? `${w} Apple 直營店 iPhone 現貨：${stores.map(shortName).join("、")}` : `${w}全部 ${n(k)} 家 Apple 直營店：iPhone Duo 即時現貨`,
    `${w} Apple 直營店：iPhone Duo 即時現貨`,
    `${w} Apple 直營店 iPhone 現貨`,
  ].map(zs), 70);
}

function homeTitle(code: CountryCode): string {
  const k = storesOf(code).length;
  const w = cn(code);
  return fitTitleW([
    `iPhone Duo 現貨查詢：${w} Apple 直營店庫存，每 15 秒更新`,
    `${w} iPhone 現貨查詢：${n(k)} 家 Apple 直營店，每 15 秒更新`,
    `${w} iPhone 現貨查詢`,
  ].map(zs));
}

function homeH1(code: CountryCode): string {
  const k = storesOf(code).length;
  const w = cn(code);
  return zs(k === 1 ? `${w}取貨觀測簿：僅有的一家 Apple 直營店` : `${w}取貨觀測簿：${k === 2 ? "兩家" : `${n(k)} 家`} Apple 直營店`);
}

function allStoresPhrase(code: CountryCode): string {
  const k = storesOf(code).length;
  return zs(k === 1 ? `${cn(code)}僅有的那家 Apple 直營店` : `遍布${cn(code)}的 ${n(k)} 家 Apple 直營店`);
}

function spreadPhrase(code: CountryCode): string {
  const c = COUNTRIES[code];
  const regions = statesWithStores(code);
  const cities = citiesWithStores(code);
  const k = storesOf(code).length;
  const city = (x: string) => cityLabel(code, x, L);
  if (k === 1) return `設在${city(cities[0].name)}`;
  if (cities.length === 1) return `全數集中在${city(cities[0].name)}`;
  if (!c.regionNoun || regions.length === 1) return `散在 ${n(cities.length)} 個城市`;
  return `散在 ${n(regions.length)} 個${regionZh(c)}、共 ${n(cities.length)} 個城市`;
}

function modelPageTitles(code: CountryCode, model: ModelKey): { title: string; h2: string[] } {
  const m = modelByKey(model)!;
  const k = storesOf(code).length;
  const w = cn(code);
  const all = k === 1 ? "Apple 直營店" : k === 2 ? "兩家 Apple 直營店" : `全部 ${n(k)} 家 Apple 直營店`;
  return {
    title: fitTitleW([`${m.name} ${w}現貨與價格：${all}即時庫存`, `${m.name} ${w}現貨與價格`, `${m.name} ${w}現貨`].map(zs), 70),
    h2: [zs(`${m.name} 在${w}：現在哪些貨架上有`), priceSection(code, w, undefined, model).h2],
  };
}

function modelIntro(code: CountryCode, model: ModelKey, inStock: number): string {
  const c = COUNTRIES[code];
  const m = modelByKey(model)!;
  const k = storesOf(code).length;
  const w = cn(code);
  const r = cc.priceRange(code, model);
  const p = code === "ca" ? `**${money(c, r.low)}** 起（未稅）` : `**${money(c, r.low)}** 起（${taxNoteZh(c)}）`;
  const head = inStock === 0
    ? (k === 1 ? `${w}僅有的那家 Apple 直營店，${m.name} 目前**已下架**` : `${m.name} 在${w}全部 ${n(k)} 家 Apple 直營店**都已下架**`)
    : `${m.name} 在${w} **${n(inStock)}/${n(k)}** 家 Apple 直營店上架中`;
  return zs(`${head}，以頁面上的觀測時間為準；定價 ${p}。`);
}

function modelDescription(code: CountryCode, model: ModelKey, inStock: number): string {
  const c = COUNTRIES[code];
  const m = modelByKey(model)!;
  const k = storesOf(code).length;
  const w = cn(code);
  const r = cc.priceRange(code, model);
  return fitTitleW([
    `${w}有 ${m.name} 現貨嗎？${n(k)} 家 Apple 直營店中現在 ${n(inStock)} 家可門市取貨。依門市與規格即時更新，售價 ${money(c, r.low)} 起${code === "ca" ? "（未稅）" : ""}，附補貨時段。`,
    `${m.name} ${w}現貨：${n(k)} 家 Apple 直營店中現在 ${n(inStock)} 家有貨。各門市、各規格即時現貨、補貨時段與通知。`,
  ].map(zs), 155);
}

function homeDescription(code: CountryCode): string {
  const c = COUNTRIES[code];
  const k = storesOf(code).length;
  return zs(`每 15 秒即時查詢${allStoresPhrase(code)}的 iPhone Duo、18 Pro 與 18 Pro Max 門市取貨現貨。${k === 1 ? "價格" : "補貨時段與價格"}以${currencyZh(c)}顯示；你的門市一補貨，馬上推播通知你。`);
}

function homeIntro(code: CountryCode): string {
  const k = storesOf(code).length;
  const w = cn(code);
  if (k === 1) return zs(`${w}只有一家 Apple 直營店，最新的貨架點數：iPhone Duo **{{duo.storesNow}}/1**、18 Pro **{{pro.storesNow}}/1**、18 Pro Max **{{pm.storesNow}}/1**（1 = 上架中）。`);
  return zs(`${w}最新的貨架點數：iPhone Duo 在 **{{duo.storesNow}}/${n(k)}** 家 Apple 直營店上架中，18 Pro **{{pro.storesNow}}** 家，18 Pro Max **{{pm.storesNow}}** 家。`);
}

function homeSections(i: HomeCopyInput): KeywordSection[] {
  const code = i.cc;
  const c = COUNTRIES[code];
  const w = cn(code);
  const stores = storesOf(code);
  const k = stores.length;
  return [
    {
      id: "iphone-stock",
      h2: zs(`${w}的貨架：逐店記下 Duo、18 Pro、Pro Max`),
      lead: zs(`ShelfSpring 透過同步的庫存資料，記錄 apple.com 上${allStoresPhrase(code)}每個組合的門市取貨狀態，可以按店${k > 1 ? `、按${regionZh(c)}` : ""}或按組合查閱。`),
      blocks: [
        { t: "table", head: ["iPhone", "追蹤中的組合", "上架中的直營店", "觀測簿裡的重新上架"], rows: cc.modelRows(code, i.storesNow, i.restocks), caption: zs(`${w}觀測範圍 · {{asOf}} 查看`) },
        { t: "ul", items: [
          `**範圍：**${allStoresPhrase(code)}，${spreadPhrase(code)}；零件編號與定價照 Apple ${w}線上商店`,
          "**先看時間戳記：**所有方案讀同一份庫存資料，蒐集與同步都可能帶來延遲",
          "**兩次查看一致才記錄：**變化必須經過確認；提醒沒辦法替你保留商品",
          `**每一筆確認過的變化**都會進[上架日誌](${i.restocksPath})，${i.index?.indexable ? `[每家店頁面](${i.index.path})` : "店頁"}上的時鐘圖就是從這裡來`,
        ].map(zs) },
        { t: "img", id: "phone-notification" },
      ],
    },
    priceSection(code, w),
    {
      id: "alerts",
      h2: zs(`${w} Apple 直營店取貨的追蹤清單`),
      lead: zs(`把取貨選項縮成一份做得到的清單：挑${k === 1 ? "這家" : "你去得了的"} Apple 直營店，再挑你能接受的組合。看觀測簿不用錢；付費提醒會在符合條件的重新上架傳到 ShelfSpring 之後通知你，送達時間不一定。`),
      blocks: [
        { t: "ol", items: [
          "點 **設定提醒**，選好機型、容量與機身色。",
          k === 1 ? `選擇店家：${cityLabel(code, stores[0].city, L)}的 ${appleStoreLabel(stores[0], L)}。` : "選你去得了的店；清單從最近的開始，標出道路公里數與預估車程。",
          "iPhone 使用者：從 Safari 把 ShelfSpring 安裝到主畫面，再打開通知（[設定步驟](/install)）。",
          "收到通知後到 apple.com，先確認那家店仍然上架，再選擇在那裡取貨。",
        ].map(zs) },
        { t: "table", head: ["追蹤清單", "月費（美元）", "店 × 組合規則"], rows: [["Plus", "$5", "10"], ["Pro", "$10", "20"], ["Max", "$20", "50"]], caption: "每條規則追蹤一家店與一個確切組合；看觀測簿不收費（[方案](/pricing)）" },
        { t: "note", text: zs("**照證據挑：**決定哪些店要放進追蹤清單之前，先比對目前的上架情況、樣本大小與近期的重新上架。") },
        { t: "img", id: "apple-store-pickup-counter" },
      ],
    },
  ];
}

function homeFaq(code: CountryCode, rt: RestockTimesBrief): Faq[] {
  const k = storesOf(code).length;
  const w = cn(code);
  const p = code === "us" ? "" : `/${code}`;
  const when = rt.n === 0
    ? `11 月 2 日起匯入的紀錄還沒有確認的重新上架；[${w}的 Duo 上架紀錄](${rt.path})之後會把每一次依當地時間與星期分類。`
    : rt.peakHour != null
      ? `集中在**當地時間${hh(rt.peakHour)}**附近，依據 11 月 2 日起的紀錄：${n(rt.stores)}/${n(rt.storesTotal)} 家店合計 ${n(rt.n)} 次確認的重新上架（[完整的時段與星期紀錄](${rt.path})）。`
      : `11 月 2 日起的紀錄裡，${n(rt.stores)}/${n(rt.storesTotal)} 家店合計 ${n(rt.n)} 次確認的重新上架，但分散的天數太少，還講不出固定時段（[完整的時段與星期紀錄](${rt.path})）。`;
  return [
    { q: zs(`此刻${w}哪些店有 iPhone Duo 上架中？`), a: zs(`最近一次查看（{{asOf}}）是 {{duo.storesNow}}/${n(k)} 家；[${w}的 Duo 一覽](${p}/stock/iphone-duo)一店一列、一個組合一行，每行都有自己的時間戳記。`) },
    { q: zs(`${w}的 iPhone Duo 通常幾點重新上架？`), a: zs(when) },
    { q: "提醒什麼時候會送到我這裡？", a: zs(`在重新上架出現在${w}的同步資料之後。蒐集、同步、網路與你的裝置設定都會多出一點延遲，而且每個方案讀的是同一份資料，出門前請先在 Apple 確認仍然上架。`) },
    { q: "哪些免費、哪些要付費？", a: zs("看觀測簿、地圖與上架日誌都免費。提醒規則分成 Plus（每月 $5，10 條）、Pro（$10，20 條）與 Max（$20，50 條），以美元計費，可在帳號裡取消（[方案](/pricing)）。") },
    taxFaq(code, w),
    { q: "ShelfSpring 會幫我保留手機嗎？", a: zs(`沒辦法：通知只指向一個偵測到的上架，必須在 apple.com 下單並得到確認，手機才算是你的（[Apple 取貨說明](${pickupHelp(code).url})）。`) },
  ];
}

const homeLabels: Dict["place"]["home"] = {
  appName: (code: CountryCode) => zs(`ShelfSpring ${cn(code)}取貨觀測簿`),
  offer: zs("觀測簿、地圖與上架日誌都免費；提醒方案每月 $5 起"),
  itemList: (code: CountryCode) => zs(`${cn(code)}的 Apple 直營店`),
  restockTimesChip: "過去回架的時段",
  storesByRegion: (code: CountryCode) => `依${regionZh(code)}瀏覽`,
  browse: (code: CountryCode) => `${cn(code)}觀測簿的其他部分`,
  selloutH2: (code: CountryCode) => zs(`${cn(code)}重新上架的 iPhone 在架上撐了多久？`),
  selloutLabel: (code: CountryCode) => zs(code === "tw" ? "全台各店" : `${cn(code)}各店`),
  last24Label: (code: CountryCode) => (code === "tw" ? "全台" : `${cn(code)}全境`),
  newsroom: "Apple Newsroom：iPhone Duo 抵達全球 Apple 直營店（2026 年 10 月 23 日）",
};

/** 門市頁的 <title> 與 H1：「Apple 信義 A13：iPhone 現貨查詢、庫存、門市取貨與營業時間」。 */
function storeTitle(s: Store, region?: string): string {
  const name = appleStoreLabel(s, L);
  const shown = region && !name.toLowerCase().includes(region.toLowerCase()) ? region : null;
  return fitTitleW(content.titles.store(name, shown).map(zs));
}

function sources(code: Exclude<CountryCode, "us">): { pickupHelp: Source; storeList: Source; tax: Source } {
  const w = cn(code);
  return {
    pickupHelp: { label: zs(`取貨要帶哪些證件：Apple ${w}送貨與取貨說明`), url: pickupHelp(code).url },
    storeList: { label: zs(`Apple ${w}官網的直營店清單`), url: storeListSource(code).url },
    tax: taxSource(code),
  };
}

const basePlace: Dict["place"] = {
  sinceWhen,
  /** 中文地名不會和美國地名撞名，原樣使用。 */
  placeLabel: (_code: CountryCode, name: string) => name,
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
  modelRows: cc.modelRows,
  homeDescription,
  homeIntro,
  homeSections,
  homeFaq,
  home: homeLabels,
  storeTitle,
  sources,
};

export const place: Dict["place"] = withShelfPlace("zh-TW", basePlace);
