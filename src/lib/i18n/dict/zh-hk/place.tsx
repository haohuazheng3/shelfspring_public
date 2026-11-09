import { withShelfPlace } from "@/lib/seo/localizedCopy";
/**
 * 繁體中文（香港）: place — the copy builders of a country's page tree (English: lib/seo/countryCopy.ts), written for
 * Hong Kong readers. Keywords (Google Ads, Hong Kong, monthly): iphone duo 18,100 · apple 廣東道 9,900 · apple ifc
 * 9,900 · apple apm 2,400 · apple store 香港 1,900 · iphone duo 價錢 590 · iphone 18 pro max 現貨 260 · apple 又一城
 * 260 · apple store 沙田 260 · iphone 現貨 210 · apple 銅鑼灣 210 · iphone duo 香港 140. Hong Kong has no sales tax.
 */
import type { Dict } from "../en";
import { INTL_TRACKING_SINCE, duoStoresNow, modelRows, pairsPct, priceOf, priceRange, scarcest, type HomeCopyInput, type IntlPlaceInput, type RestockTimesBrief } from "@/lib/seo/countryCopy";
import { CA_PROVINCE_TAX, TAX_SOURCES, beforeTax, includedRate, pickupHelp, storeListSource, withProvinceTax } from "@/content/country-tax";
import { catalogFor, citiesWithStores, modelByKey, statesWithStores, storesOf, type ModelKey, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import { alertHref, fmtDuration, listWords, type FaqItem } from "@/lib/seo/enrich";
import { price } from "@/lib/i18n/format";
import { cityLabel } from "@/lib/i18n/places";
import type { KeywordSection } from "@/components/content/KeywordSections";
import type { Block, Faq, Source } from "@/lib/content/types";
import { CURRENCY, HK_TITLE, L, apple, cityNoun, cn, fitW, hr, n, rn, taxNameZh, taxNoteZh, zhCfg, zhPlace, zoneStampZh } from "./common";

type NonUs = Exclude<CountryCode, "us">;
const money = (cc: CountryCode, v: number) => price(L, COUNTRIES[cc], v);
const lw = (items: string[], max = 6) => listWords(items, max, L);

/** 記錄窗口："在 11 月 2 日起的記錄中"（匯入的歷史仍未滿 30 日時），之後是"在最近 30 日內"。 */
function sinceWhen(now = Date.now()): string {
  return now - Date.parse(`${INTL_TRACKING_SINCE}T00:00:00Z`) < 30 * 86400_000 ? "在 11 月 2 日起的記錄中" : "在最近 30 日內";
}
/** 同一窗口的標籤寫法（放在括號或冒號前）："11 月 2 日起"／"最近 30 日"。 */
function windowLabel(now = Date.now()): string {
  return now - Date.parse(`${INTL_TRACKING_SINCE}T00:00:00Z`) < 30 * 86400_000 ? "11 月 2 日起" : "最近 30 日";
}

/** The official pages behind a country's lines, in Chinese where the source has a Chinese page (Hong Kong). */
function sources(code: NonUs): { pickupHelp: Source; storeList: Source; tax: Source } {
  if (code === "hk") return {
    pickupHelp: { label: "Apple 香港「付運及送遞」說明 · Apple Store 提取服務——到店需出示的文件", url: "https://www.apple.com/hk-zh/shop/help/shipping_delivery" },
    storeList: { label: "Apple 香港零售店名單", url: "https://www.apple.com/hk/retail/storelist/" },
    tax: { label: "稅務局網站：香港現行稅種", url: "https://www.ird.gov.hk/chi/tax/index.htm" },
  };
  return { pickupHelp: pickupHelp(code), storeList: storeListSource(code), tax: TAX_SOURCES[code] };
}

/* ------------------------------------------------------------------ tax */

function taxSentence(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    if (t) return `256GB iPhone Duo 的未連稅標價是 ${money(cc, duo)}；${zhPlace(cc, region!)}在櫃台另收 ${n(t.rate)}% ${CA_PROVINCE_TAX[region!].label}，合共約 ${money(cc, t.total)}。`;
    return `256GB iPhone Duo 的未連稅標價是 ${money(cc, duo)}；取貨店所在的省份會再加 5% 至 15%。`;
  }
  const r = includedRate(c);
  if (r == null) return `香港不徵銷售稅，在店內提取的 256GB iPhone Duo 只付標價 ${money(cc, duo)}，不多一分。`;
  return `${money(cc, duo)} 是 256GB iPhone Duo 在${cn(cc)}的標價，${r}% ${taxNameZh(c)}已計算在內，取貨時毋須再付稅。`;
}

const PRICE_ROWS: [ModelKey, string][] = [["duo", "256GB"], ["duo", "1TB"], ["18-pro-max", "256GB"], ["18-pro-max", "1TB"], ["18-pro", "256GB"]];

function priceSection(cc: CountryCode, placeName: string, region?: string, model: ModelKey = "duo"): KeywordSection {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const base = priceOf(cc, model) ?? 0;
  const place = zhPlace(cc, placeName);
  const src = sources(cc as NonUs).tax;
  const shopPath = cc === "hk" ? "hk-zh" : (c.buyPath ?? c.shopPath);
  const rows: [string, number][] = PRICE_ROWS.flatMap(([k, st]) => { const p = priceOf(cc, k, st); return p == null ? [] : [[`${modelByKey(k)!.name} ${st}`, p] as [string, number]]; });
  if (cc === "ca") {
    const t = region ? CA_PROVINCE_TAX[region] : undefined;
    if (t) {
      const prov = zhPlace(cc, region!);
      const table: Block = {
        t: "table",
        head: ["配置", "標價（apple.com）", `計入 ${n(t.total)}% ${t.label}後`],
        rows: rows.map(([label, p]) => [label, money(cc, p), money(cc, withProvinceTax(p, region!)!.total)]),
        caption: `${prov}取貨：加拿大標價另加 ${t.label}（${n(t.total)}%）`,
        source: `[${src.label}](${src.url})；標價來源：apple.com/ca`,
      };
      const parts = t.hst ? `${n(t.hst)}% HST` : t.pst ? `${t.gst}% GST 加 ${n(t.pst)}% ${t.label.split(" + ")[1]}` : `${t.gst}% GST，不另收省稅`;
      return {
        id: "price-with-tax",
        h2: `${place}取貨，${m.name} 連稅實付多少`,
        lead: `256GB ${m.name} 的標價：**未連稅 ${money(cc, base)}**。${prov}再收 ${parts}，於${place}的店取貨約付 **${money(cc, withProvinceTax(base, region!)!.total)}**。`,
        blocks: [{ t: "note", text: "**稅率跟取貨店走：**由店舖所在省份決定，與你的帳單地址無關。" }, table],
      };
    }
    const provinces = Object.keys(CA_PROVINCE_TAX).filter((p) => storesOf("ca").some((s) => s.state === p));
    const cheapest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total < CA_PROVINCE_TAX[a].total ? b : a));
    const dearest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total > CA_PROVINCE_TAX[a].total ? b : a));
    return {
      id: "price-with-tax",
      h2: `${m.name} 連稅價錢，逐省列出`,
      lead: `256GB ${m.name} 的未連稅標價是 **${money(cc, base)}**。在${zhPlace(cc, cheapest)}（${n(CA_PROVINCE_TAX[cheapest].total)}%）取貨合共 **${money(cc, withProvinceTax(base, cheapest)!.total)}**；在${zhPlace(cc, dearest)}（${n(CA_PROVINCE_TAX[dearest].total)}%）則升至 **${money(cc, withProvinceTax(base, dearest)!.total)}**。`,
      blocks: [{
        t: "table",
        head: ["省份", "稅種", "稅率", `${m.short} 256GB 稅後`],
        rows: provinces.map((p) => [zhPlace(cc, p), CA_PROVINCE_TAX[p].label, `${n(CA_PROVINCE_TAX[p].total)}%`, money(cc, withProvinceTax(base, p)!.total)]),
        caption: "取貨櫃台加收的稅（只列設有 Apple Store 的省份）",
        source: `[${src.label}](${src.url})；標價來源：apple.com/ca`,
      }],
    };
  }
  const r = includedRate(c);
  const tn = taxNameZh(c);
  return {
    id: "price",
    h2: `${m.name} 在${cn(cc)}：標價 ${money(cc, base)}，${r == null ? "毋須另付銷售稅" : `${r}% ${tn}已計入`}`,
    lead: r == null
      ? `香港**不徵銷售稅**，增值稅亦不存在：256GB ${m.name} 在 apple.com 的標價 **${money(cc, base)}**，就是在${place}取貨時的全部費用。`
      : `**${money(cc, base)}** 買到${cn(cc)}的 256GB ${m.name}；這個數字已包含 **${r}% ${tn}**（扣除後為 ${money(cc, beforeTax(c, base))}），在${place}取貨不會再加稅。`,
    blocks: [{
      t: "table",
      head: r == null ? ["配置", "標價（apple.com）"] : ["配置", "標價（apple.com）", `扣除 ${r}% ${tn}後`],
      rows: rows.map(([label, p]) => (r == null ? [label, money(cc, p)] : [label, money(cc, p), money(cc, beforeTax(c, p))])),
      caption: `${cn(cc)}標價一覽${r == null ? "" : `（${tn}已在內）`}`,
      source: `[${src.label}](${src.url})；標價來源：apple.com/${shopPath}`,
    }],
  };
}

function taxFaq(cc: CountryCode, placeName: string, region?: string): FaqItem {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo") ?? 0;
  const place = zhPlace(cc, placeName);
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    return t
      ? { q: `在${place}取 256GB iPhone Duo，連稅大約多少？`, a: `約 ${money(cc, t.total)}：Apple 的未連稅標價是 ${money(cc, duo)}，再由你取貨那間店按${zhPlace(cc, region!)}的 ${n(t.rate)}% ${CA_PROVINCE_TAX[region!].label}收稅。` }
      : { q: "Apple 加拿大的標價包含稅嗎？", a: `不包含：256GB iPhone Duo 的 ${money(cc, duo)} 是未連稅價，之後由取貨店所在省份加收 GST、HST 或省銷售稅（艾伯塔省 5% 最低，魁北克省 14.975% 最高）。` };
  }
  const r = includedRate(c);
  return r == null
    ? { q: "在香港取貨，iPhone 會被加稅嗎？", a: `不會加任何稅：香港既無增值稅，亦無銷售稅，在店內提取的 256GB iPhone Duo 就是標價 ${money(cc, duo)}。` }
    : { q: `apple.com 在${cn(cc)}收的價錢，已包含 ${r}% ${taxNameZh(c)}嗎？`, a: `已包含：256GB iPhone Duo 標示的 ${money(cc, duo)} 內含 ${r}% ${taxNameZh(c)}，取貨時櫃台不會再收稅。` };
}

/* ------------------------------------------------------------------ region / city pages */

const placeOf = (i: IntlPlaceInput) => zhPlace(i.cc, i.name, i.kind === "city" ? "city" : "region");

function placeTitle(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = placeOf(i);
  return fitW([
    `${w} Apple Store：${k === 2 ? "兩間" : `全部 ${n(k)} 間`}分店 iPhone Duo 即時現貨`,
    `${w} Apple Store：iPhone Duo 即時現貨`,
    `${w} Apple Store：今日 iPhone 現貨`,
    `${w} Apple Store iPhone 現貨`,
  ]);
}

function priceBit(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") { const t = region ? withProvinceTax(duo, region) : null; return t ? `；iPhone Duo 連${zhPlace(cc, region!)}稅項約 ${money(cc, t.total)}` : `；iPhone Duo 未連稅 ${money(cc, duo)} 起`; }
  return `；iPhone Duo ${money(cc, duo)} 起（${taxNoteZh(c)}）`;
}

function placeDescription(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = placeOf(i);
  return fitW([
    `${w}共 ${n(k)} 間 Apple Store：現時 ${n(i.stockNow.duo)} 間可即時取貨 iPhone Duo，${n(i.stockNow["18-pro-max"])} 間有 18 Pro Max。逐店即時現貨、補貨時間${priceBit(i.cc, i.region)}。`,
    `${w}共 ${n(k)} 間 Apple Store：${n(i.stockNow.duo)} 間現有 iPhone Duo 可取貨，${n(i.stockNow["18-pro-max"])} 間有 18 Pro Max。逐店即時現貨及補貨時間。`,
  ], 155);
}

function placeIntro(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? `（${n(i.cities)} 個${cityNoun(i.cc)}）` : "";
  return `觀察簿收錄${placeOf(i)}${cities}的 **${n(k)} 間 Apple Store**。最近一次查看時，iPhone Duo 在 **${n(i.stockNow.duo)}** 間在架，18 Pro Max **${n(i.stockNow["18-pro-max"])}** 間，18 Pro **${n(i.stockNow["18-pro"])}** 間。`;
}

function duoLead(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const have = duoStoresNow(i);
  if (have.length > 0) return `上次查看時在架：${lw(have.map((s) => apple(s)), 4)}（**${n(have.length)}/${n(k)} 間**）。`;
  if (i.duo.month > 0) return `iPhone Duo 暫時在全部 **${n(k)} 間**都已落架；不過觀察簿${sinceWhen()}仍錄得 **${n(i.duo.month)} 次確認回架**。`;
  return `iPhone Duo 在全部 **${n(k)} 間**都已落架，觀察簿${sinceWhen()}亦未有任何確認回架。`;
}

function duoPoints(i: IntlPlaceInput, w: string, alert: string): Block[] {
  const k = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (have.length > 0 && st.month > 0) items.push(`**回架（${windowLabel()}）：**這幾間店合共 ${n(st.month)} 次 Duo 回架`);
  if (st.lastRestock && last) items.push(`**最近一次回架：**${apple(last)}，${zoneStampZh(st.lastRestock.at, i.cc)}`);
  if (st.medianMs != null) items.push(`**在架時間中位數：**由回架到清架約 ${fmtDuration(st.medianMs, L)}`);
  items.push(`**監察清單：**[監察${w}的 iPhone Duo](${alert})，${k <= 3 ? `${k === 2 ? "兩間" : k === 1 ? "這間" : "三間"}都加上` : `加上你到得了、最近的 ${n(Math.min(k, 5))} 間`}`);
  items.push("**規則大小：**每個提示只涵蓋一間店及一款指定配置；偵測到在架並完成同步後才送出，快慢不一");
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: "**觀察簿仍未錄得回架：**先把想要的配置放進監察清單，落單前再對照最新一次查看。" });
  blocks.push({ t: "ul", items });
  return blocks;
}

function placeSections(i: IntlPlaceInput): KeywordSection[] {
  const k = i.stores.length;
  const w = placeOf(i);
  const alert = alertHref({ model: "duo", state: i.regionSlug, city: i.kind === "city" ? i.citySlug : undefined, country: i.cc });
  const scarce = scarcest(i, "18-pro-max");
  const pm = catalogFor("18-pro-max", i.cc).length;
  return [
    {
      id: "iphone-duo",
      h2: `${w}：iPhone Duo 在哪些店在架`,
      lead: duoLead(i),
      blocks: duoPoints(i, w, alert),
    },
    {
      id: "iphone-18-pro-max",
      h2: `${w}：18 Pro Max 各店在架情況`,
      lead: `Pro Max 在 **${n(i.stockNow["18-pro-max"])}/${n(k)} 間**在架；把每個「店 × 配置」組合（共 ${n(k * pm)} 個）計算在內，**${pairsPct(i, "18-pro-max")}%** 有上架。`,
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**現時選擇最少：**${lw(scarce.map((x) => `${zhCfg(x.label)}，${n(x.stores)}/${n(k)} 間`))}`] : []),
        `**同場的 18 Pro：**${n(i.stockNow["18-pro"])}/${n(k)} 間，${pairsPct(i, "18-pro")}% 組合在架`,
        `**Pro Max 回架（${windowLabel()}）：**${i.max.month ? `${n(i.max.month)} 次確認回架` : "未有記錄"}`,
        ...(i.max.medianMs != null ? [`**在架時間中位數：**回架的 Pro Max 約 ${fmtDuration(i.max.medianMs, L)}`] : []),
      ] }],
    },
    priceSection(i.cc, w, i.cc === "ca" ? i.region : undefined),
  ];
}

/* ------------------------------------------------------------------ country: store index and home */

function storesIndexTitle(cc: CountryCode): string {
  const k = storesOf(cc).length;
  const w = cn(cc);
  return fitW([
    `${w} Apple Store 一覽：${k === 2 ? "兩間" : `全部 ${n(k)} 間`}分店 iPhone Duo 即時現貨`,
    `${w} Apple Store 一覽：iPhone Duo 即時現貨`,
    `${w} Apple Store：iPhone 即時現貨`,
  ], 70);
}

function homeTitle(cc: CountryCode): string {
  const k = storesOf(cc).length;
  return `${cn(cc)} iPhone 現貨查詢：${k === 1 ? "" : `${n(k)} 間 `}Apple Store 每 15 秒檢查`;
}

function homeH1(cc: CountryCode): string {
  const k = storesOf(cc).length;
  return k === 1 ? `${cn(cc)}取貨觀察簿：唯一一間 Apple Store` : `${cn(cc)}取貨觀察簿：${n(k)} 間 Apple Store`;
}

function allStoresPhrase(cc: CountryCode): string {
  const k = storesOf(cc).length;
  return k === 1 ? `${cn(cc)}僅有的一間 Apple Store` : `遍及${cn(cc)}的 ${n(k)} 間 Apple Store`;
}

function spreadPhrase(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const regions = statesWithStores(cc);
  const cities = citiesWithStores(cc);
  const k = storesOf(cc).length;
  const one = (x: { name: string }) => cityLabel(cc, x.name, L);
  if (k === 1) return `設於${one(cities[0])}`;
  if (cities.length === 1) return `全數集中在${one(cities[0])}`;
  if (!c.regionNoun || regions.length === 1) return `散佈 ${n(cities.length)} 個${cityNoun(cc)}`;
  return `散佈 ${n(regions.length)} 個${rn(c)}、共 ${n(cities.length)} 個城市`;
}

function modelPageTitles(cc: CountryCode, model: ModelKey): { title: string; h2: string[] } {
  const m = modelByKey(model)!;
  const k = storesOf(cc).length;
  const w = cn(cc);
  return {
    title: fitW([`${m.name} 現貨：${w} ${k === 1 ? "" : `${n(k)} 間 `}Apple Store 即時查詢`, `${m.name} 現貨：${w} Apple Store 即時查詢`, `${m.name} ${w}現貨`], 70),
    h2: [`${m.name} 在${w}：現時在架的零售店`, priceSection(cc, w, undefined, model).h2],
  };
}

function modelIntro(cc: CountryCode, model: ModelKey, inStock: number): string {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const k = storesOf(cc).length;
  const r = priceRange(cc, model);
  const p = cc === "ca" ? `**${money(cc, r.low)}** 起（未連稅）` : `**${money(cc, r.low)}** 起，${taxNoteZh(c)}`;
  const now = inStock === 0
    ? (k === 1 ? `${cn(cc)}僅有的一間 Apple Store 暫時**沒有** ${m.name} 在架` : `${m.name} 在${cn(cc)}全部 ${n(k)} 間 Apple Store **都已落架**`)
    : `${m.name} 在${cn(cc)} **${n(inStock)}/${n(k)}** 間 Apple Store 在架`;
  return `${now}，以頁面顯示的觀察時間為準；標價 ${p}。`;
}

function modelDescription(cc: CountryCode, model: ModelKey, inStock: number): string {
  const m = modelByKey(model)!;
  const k = storesOf(cc).length;
  const r = priceRange(cc, model);
  return fitW([
    `${m.name} ${cn(cc)}有貨嗎？${n(k)} 間 Apple Store 中現有 ${n(inStock)} 間可取貨。逐店逐款即時現貨，${money(cc, r.low)} 起${cc === "ca" ? "（未連稅）" : ""}，附補貨時間。`,
    `${m.name} ${cn(cc)}：${n(k)} 間 Apple Store 中 ${n(inStock)} 間現在有貨。逐店逐款即時取貨現貨、補貨時間及提醒。`,
  ], 155);
}

/* ------------------------------------------------------------------ country home */



function homeDescription(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const k = storesOf(cc).length;
  return `即時查看${allStoresPhrase(cc)}的 iPhone Duo、18 Pro 及 18 Pro Max 取貨現貨，每 15 秒更新。${k === 1 ? "" : "補貨時間、"}${CURRENCY[c.currency] ?? c.currency}價錢一目了然；你的分店一補貨即推送通知。`;
}

function homeIntro(cc: CountryCode): string {
  const k = storesOf(cc).length;
  if (k === 1) return `${cn(cc)}僅有一間 Apple Store，最新架上點算：iPhone Duo **{{duo.storesNow}}/1**、18 Pro **{{pro.storesNow}}/1**、18 Pro Max **{{pm.storesNow}}/1**。`;
  return `${cn(cc)}最新架上點算：iPhone Duo 在 **{{duo.storesNow}}/${n(k)}** 間 Apple Store 在架，18 Pro **{{pro.storesNow}}** 間，18 Pro Max **{{pm.storesNow}}** 間。`;
}

function homeSections(i: HomeCopyInput): KeywordSection[] {
  const cc = i.cc;
  const c = COUNTRIES[cc];
  const k = storesOf(cc).length;
  const stores = storesOf(cc);
  const w = cn(cc);
  const by = k > 1 ? `、按${c.regionNoun ? rn(c) : cityNoun(cc)}` : "";
  return [
    {
      id: "iphone-stock",
      h2: `${w}的貨架：逐店記錄 Duo、18 Pro、Pro Max`,
      lead: `ShelfSpring 透過同步的存貨資料，記下 apple.com 上${allStoresPhrase(cc)}每款配置的店內取貨狀態，可按店${by}及按配置翻查。`,
      blocks: [
        { t: "table", head: ["iPhone", "追蹤中的配置", "在架零售店", "觀察簿內的回架"], rows: modelRows(cc, i.storesNow, i.restocks), caption: `${w}觀察範圍 · {{asOf}} 查看` },
        { t: "ul", items: [
          `**範圍：**${spreadPhrase(cc)}；零件編號及標價依照 Apple ${w}網上商店`,
          "**先看時間戳：**所有方案讀同一份存貨資料，收集及同步都可能帶來延遲",
          "**兩次查看一致才入簿：**變化要經確認才記錄；提示並不能替你留貨",
          `**每一項經確認的變化**都寫進[回架日誌](${i.restocksPath})，亦即${i.index?.indexable ? `[每間店頁面](${i.index.path})` : "店頁"}上鐘點圖的來源`,
        ] },
        { t: "img", id: "phone-notification" },
      ],
    },
    priceSection(cc, w),
    {
      id: "alerts",
      h2: `${w} Apple Store 取貨的監察清單`,
      lead: `把取貨選擇收窄成一張實際可行的清單：揀${k === 1 ? "這間" : "你到得了的"} Apple Store，再揀你肯接受的配置。翻閱觀察簿不收費；付費提示會在符合條件的回架傳到 ShelfSpring 後通知你，送達時間不一。`,
      blocks: [
        { t: "ol", items: [
          "按「**設定提示**」，選定型號、容量及機色。",
          k === 1 ? `選取零售店：${apple(stores[0])}（${cityLabel(cc, stores[0].city, L)}）。` : "選取到得了的店；名單由最近的開始，列出行車公里數及估計車程。",
          "iPhone 用戶：在 Safari 把 ShelfSpring 安裝到主畫面，再開啟通知（[設定步驟](/install)）。",
          "收到通知後前往 apple.com，先確認那間店仍然在架，再選擇在該店取貨。",
        ] },
        { t: "table", head: ["監察清單", "月費（美元）", "店 × 配置規則"], rows: [["Plus", "$5", "10"], ["Pro", "$10", "20"], ["Max", "$20", "50"]], caption: "每條規則監察一間店及一款指定配置；翻閱觀察簿不收費（[方案](/pricing)）" },
        { t: "note", text: "**按證據取捨：**決定哪些店放進監察清單之前，先比較現時在架情況、樣本大小及近期回架。" },
        { t: "img", id: "apple-store-pickup-counter" },
      ],
    },
  ];
}

function homeFaq(cc: CountryCode, rt: RestockTimesBrief): Faq[] {
  const k = storesOf(cc).length;
  const w = cn(cc);
  const p = `/${cc}`;
  const when = rt.n === 0
    ? `11 月 2 日起匯入的記錄仍未有確認回架；[${w}的 Duo 回架記錄](${rt.path})之後會把每一次按當地鐘點及星期歸類。`
    : rt.peakHour != null
      ? `集中在**當地時間${hr(rt.peakHour)}前後**，根據 11 月 2 日起的記錄：${n(rt.stores)}/${n(rt.storesTotal)} 間店共錄得 ${n(rt.n)} 次確認回架（[完整鐘點及星期記錄](${rt.path})）。`
      : `11 月 2 日起的記錄中，${n(rt.stores)}/${n(rt.storesTotal)} 間店共錄得 ${n(rt.n)} 次確認回架，但分佈的日子太少，說不出慣常鐘點（[完整鐘點及星期記錄](${rt.path})）。`;
  return [
    { q: `此刻${w}哪些店有 iPhone Duo 在架？`, a: `最近一次查看（{{asOf}}）是 {{duo.storesNow}}/${n(k)} 間；[${w}的 Duo 一覽](${p}/stock/iphone-duo)按店、按配置分行，每行附上自己的時間戳。` },
    { q: `${w}的 iPhone Duo 一般幾點回架？`, a: when },
    { q: "提示幾時會送到我手上？", a: `在回架出現於${w}的同步資料之後。收集、同步、網絡及你的裝置設定都會加入少許延遲，而且所有方案讀同一份資料，出發前請先在 Apple 確認仍然在架。` },
    { q: "哪些免費、哪些要付費？", a: "翻閱觀察簿、地圖及回架日誌都免費。提示規則分 Plus（每月 $5，10 條）、Pro（$10，20 條）及 Max（$20，50 條），以美元收費，可在帳戶內取消（[方案](/pricing)）。" },
    taxFaq(cc, w),
    { q: "ShelfSpring 會替我留起手機嗎？", a: `做不到：通知只指向一個偵測到的上架，要在 apple.com 落單並獲確認，手機才算屬於你（[Apple 提取服務說明](${sources(cc as NonUs).pickupHelp.url})）。` },
  ];
}

const home: Dict["place"]["home"] = {
  appName: (cc: CountryCode) => `ShelfSpring ${cn(cc)}取貨觀察簿`,
  offer: "觀察簿、地圖及回架日誌免費翻閱；提示方案每月 $5（美元）起",
  itemList: (cc: CountryCode) => `${cn(cc)} Apple Store`,
  restockTimesChip: "過往回架鐘點",
  storesByRegion: (cc: CountryCode) => `按${rn(COUNTRIES[cc])}瀏覽`,
  browse: (cc: CountryCode) => `再翻${cn(cc)}觀察簿`,
  selloutH2: (cc: CountryCode) => `${cn(cc)}回架的 iPhone 在架多久？`,
  selloutLabel: (cc: CountryCode) => (cc === "hk" ? "全港各店" : `${cn(cc)}各店`),
  last24Label: (cc: CountryCode) => (cc === "hk" ? "全港" : `${cn(cc)}全境`),
  newsroom: "Apple Newsroom：iPhone Duo 登陸全球 Apple Store（2026 年 10 月 23 日）",
};


function storeTitle(s: Store, region?: string): string {
  const own = HK_TITLE[s.storeNumber];
  const name = own ? own[0] : apple(s);
  const where = own ? own[1] : region && !name.includes(region) ? region : null;
  const r = where ? `（${where}）` : "";
  return fitW([
    `${name}${r}：iPhone 現貨・取貨・營業時間`,
    `${name}${r}：iPhone 現貨及營業時間`,
    `${name}：iPhone 現貨・取貨・營業時間`,
    `${name}：iPhone 現貨及營業時間`,
    `${name}：iPhone 現貨`,
  ]);
}

const basePlace: Dict["place"] = {
  sinceWhen,
  placeLabel: (cc: CountryCode, name: string) => zhPlace(cc, name),
  whenIn: (cc: CountryCode, iso: string | Date) => zoneStampZh(iso, cc),
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

export const place: Dict["place"] = withShelfPlace("zh-HK", basePlace);
