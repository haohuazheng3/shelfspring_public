import { withShelfPlace } from "@/lib/seo/localizedCopy";
/**
 * 日本語: place — /ja-jp/… の国ページ群（ホーム、店舗一覧、地域・都市、機種ページ）のタイトル、答え先行の導入文、
 * キーワード節、価格・税の節、FAQ。数字はすべてライブのデータから組み立てる。観測台帳の口調（再入荷・棚・見守り）。
 * タイトル・説明文・H1 は検索向けに据え置き（どれも withShelfPlace が上書きする）。
 * 検索語（Google 広告・日本・月間）：アップルストア 67.3万、apple 銀座 7.4万、iphone duo 7.4万、アップルストア 店舗 2.2万、
 * アップルストア 在庫 確認 1,000、iphone 在庫 確認 880、iphone duo 価格 2,400、iphone 店頭受け取り 110。
 * タイトルは検索される語を先頭に、幅 60（CJK は 2 幅、fitTitleW）。説明文は幅 155。
 */
import { MODELS, catalogFor, citiesWithStores, statesWithStores, storesOf, modelByKey, type ModelKey, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { CA_PROVINCE_TAX, TAX_SOURCES, beforeTax, includedRate, pickupHelp, storeListSource, taxName, withProvinceTax } from "@/content/country-tax";
import { priceOf, priceRange, scarcest, pairsPct, duoStoresNow, INTL_TRACKING_SINCE, type IntlPlaceInput, type HomeCopyInput, type RestockTimesBrief } from "@/lib/seo/countryCopy";
import { alertHref, fmtDuration, type FaqItem } from "@/lib/seo/enrich";
import type { Block, Faq } from "@/lib/content/types";
import type { KeywordSection } from "@/components/content/KeywordSections";
import { num, price as priceIn, stamp, list, hour, fitTitleW } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, configLabel, countryLabel, regionLabel, storeLabel } from "@/lib/i18n/places";
import type { Dict } from "../en";
import { content } from "./content";

const L = "ja" as const;
const N = (n: number) => num(L, n);
const money = (c: Country, v: number) => priceIn(L, c, v);
const country = (cc: CountryCode) => countryLabel(cc, L);
const pctJa = (n: number) => `${n}%`;
const listJa = (items: string[], max = 6) => list(L, items, max, (n) => content.listMore(N(n)));
/** 地域の呼び方（日本：都道府県）。 */
const NOUN: Record<string, string> = { state: "州", province: "州", area: "エリア", department: "県", prefecture: "都道府県", emirate: "首長国", canton: "州", region: "地域", county: "県", city: "市" };
const noun = (c: Country) => NOUN[c.regionNoun ?? "area"] ?? "エリア";
/** 価格に含まれる税の日本語名。 */
const taxJa = (c: Country) => {
  const t = taxName(c);
  return t === "consumption tax" ? "消費税" : t === "VAT" ? "付加価値税" : t === "GST" ? "物品サービス税（GST）" : t;
};
/** 地名を日本語に（すでに日本語ならそのまま）。 */
const placeJa = (i: Pick<IntlPlaceInput, "cc" | "kind" | "name">) => (i.kind === "city" ? cityLabel(i.cc, i.name, L) : regionLabel(i.cc, i.name, L));
const provinceJa = (p: string) => regionLabel("ca", p, L);

/** 「記録を開いた11月2日から」（30日の窓が記録開始より前に届く間）、その後は「直近30日」。 */
function sinceWhen(now = Date.now()): string {
  return now - Date.parse(`${INTL_TRACKING_SINCE}T00:00:00Z`) < 30 * 86400_000 ? "記録を開いた11月2日から" : "直近30日";
}
/** 「11月2日 15:04 JST」（国の時間帯で）。 */
function whenIn(cc: CountryCode, iso: string | Date): string {
  return stamp(L, iso, COUNTRIES[cc].timeZone, true);
}

/* ------------------------------------------------------------------ 税 */

function taxSentence(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    if (t) return `256GBのiPhone Duoの定価は税抜${money(c, duo)}。受け取りのカウンターで${provinceJa(region!)}の${CA_PROVINCE_TAX[region!].label} ${t.rate}%が上乗せされ、およそ${money(c, t.total)}になります。`;
    return `256GBのiPhone Duoの定価は税抜${money(c, duo)}。受け取る店舗のある州によって、5%から15%の税が加わります。`;
  }
  const r = includedRate(c);
  if (r == null) return `香港には売上税がないので、店頭で受け取る256GBのiPhone Duoは定価の${money(c, duo)}きっかりです。`;
  return `${country(cc)}のapple.comでは、256GBのiPhone Duoが${money(c, duo)}。${taxJa(c)}${r}%を含んだ金額なので、店頭受け取りでもこの額を払えば済みます。`;
}

const PRICE_ROWS: [ModelKey, string][] = [["duo", "256GB"], ["duo", "1TB"], ["18-pro-max", "256GB"], ["18-pro-max", "1TB"], ["18-pro", "256GB"]];

/** Apple の価格と、日本語で読める税の出典。 */
function taxSource(cc: Exclude<CountryCode, "us">) {
  return cc === "jp" ? { label: "国税庁：No.6101 消費税の基本的なしくみ", url: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shohi/6101.htm" } : TAX_SOURCES[cc];
}

function priceSection(cc: CountryCode, placeName: string, region?: string, model: ModelKey = "duo"): KeywordSection {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const base = priceOf(cc, model) ?? 0;
  const src = taxSource(cc as Exclude<CountryCode, "us">);
  const shop = `apple.com/${c.buyPath ?? c.shopPath}`;
  const rows: [string, number][] = PRICE_ROWS.flatMap(([k, st]) => { const p = priceOf(cc, k, st); return p == null ? [] : [[`${modelByKey(k)!.name} ${st}`, p] as [string, number]]; });
  if (cc === "ca") {
    const t = region ? CA_PROVINCE_TAX[region] : undefined;
    if (t) {
      const pj = provinceJa(region!);
      return {
        id: "price-with-tax",
        h2: `${placeName}で受け取る${m.name}、税を足すといくら？`,
        lead: `${placeName}の店舗で256GBの${m.name}を受け取ると、およそ**${money(c, withProvinceTax(base, region!)!.total)}**。内訳は定価**税抜${money(c, base)}**に、${pj}の${t.label}（合計${t.total}%）。`,
        blocks: [
          { t: "note", text: "**かかる税は受け取る店舗の州のもの。**自宅の住所がある州ではありません。" },
          { t: "table", head: ["モデル", "apple.comの定価", `${t.total}%を足した額`], rows: rows.map(([label, p]) => [label, money(c, p), money(c, withProvinceTax(p, region!)!.total)]), caption: `${pj}で受け取る場合：カナダの定価に${t.label}（${t.total}%）を加算`, source: `[${src.label}](${src.url}) · 定価の出典：${shop}` },
        ],
      };
    }
    const provinces = Object.keys(CA_PROVINCE_TAX).filter((p) => storesOf("ca").some((s) => s.state === p));
    const cheapest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total < CA_PROVINCE_TAX[a].total ? b : a));
    const dearest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total > CA_PROVINCE_TAX[a].total ? b : a));
    return {
      id: "price-with-tax",
      h2: `${m.name}をカナダで受け取ると、税込みでいくら？州ごとの差`,
      lead: `いちばん安く済むのは${provinceJa(cheapest)}の**${money(c, withProvinceTax(base, cheapest)!.total)}**（${CA_PROVINCE_TAX[cheapest].total}%）、いちばん高くなるのは${provinceJa(dearest)}の**${money(c, withProvinceTax(base, dearest)!.total)}**（${CA_PROVINCE_TAX[dearest].total}%）。出発点は256GBの${m.name}の定価**${money(c, base)}**（税抜）で、そこに受け取る店舗の州の税が乗ります。`,
      blocks: [{
        t: "table",
        head: ["州", "税の種類", "合計の率", `${m.short} 256GB · 税を足した額`],
        rows: provinces.map((p) => [provinceJa(p), CA_PROVINCE_TAX[p].label, `${CA_PROVINCE_TAX[p].total}%`, money(c, withProvinceTax(base, p)!.total)]),
        caption: "Apple Storeのある州ごとの、店頭受け取りの税",
        source: `[${src.label}](${src.url}) · 定価の出典：${shop}`,
      }],
    };
  }
  const r = includedRate(c);
  const tn = taxJa(c);
  return {
    id: "price",
    h2: r == null ? `${country(cc)}での${m.name}の値段：${money(c, base)}から、税の上乗せなし` : `${country(cc)}での${m.name}の値段：${money(c, base)}から、${tn}は込み`,
    lead: r == null
      ? `香港には**売上税も付加価値税もありません**。だから${placeName}で256GBの${m.name}を受け取るときも、払うのはapple.comの表示どおり**${money(c, base)}**です。`
      : `${country(cc)}のapple.comに出ている256GBの${m.name}の値段**${money(c, base)}**には、**${tn}${r}%がすでに入っています**（税を除くと${money(c, beforeTax(c, base))}）。${placeName}のカウンターで別の税を求められることはありません。`,
    blocks: [{
      t: "table",
      head: r == null ? ["モデル", "apple.comの値段"] : ["モデル", "apple.comの値段", `${tn}${r}%を除いた額`],
      rows: rows.map(([label, p]) => (r == null ? [label, money(c, p)] : [label, money(c, p), money(c, beforeTax(c, p))])),
      caption: `${country(cc)}のapple.comの値段${r == null ? "" : ` · ${tn}を含む`}`,
      source: `[${src.label}](${src.url}) · 値段の出典：${shop}`,
    }],
  };
}

function taxFaq(cc: CountryCode, placeName: string, region?: string): FaqItem {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo") ?? 0;
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    return t
      ? { q: `${placeName}で256GBのiPhone Duoを受け取ると、税を足していくら？`, a: `およそ${money(c, t.total)}。定価は税抜${money(c, duo)}で、受け取る店舗のある${provinceJa(region!)}の${CA_PROVINCE_TAX[region!].label} ${t.rate}%がその場で加わります。` }
      : { q: "カナダのapple.comの定価は、税込みの額ですか？", a: `税は入っていません。256GBのiPhone Duoの${money(c, duo)}は税抜の額で、受け取る店舗の州がGST・HST・州の売上税のいずれかを加えます（低いのはアルバータ州の5%、高いのはケベック州の14.975%）。` };
  }
  const r = includedRate(c);
  return r == null
    ? { q: "香港で受け取るiPhoneに、税は上乗せされますか？", a: `何も上乗せされません。香港には付加価値税も売上税もないので、店頭で受け取る256GBのiPhone Duoは定価の${money(c, duo)}のままです。` }
    : { q: `${country(cc)}のapple.comに出ている値段は、${taxJa(c)}${r}%込みですか？`, a: `込みです。256GBのiPhone Duoなら${money(c, duo)}の中に${taxJa(c)}${r}%が入っていて、受け取りのカウンターで別に税を払うことはありません。` };
}

/* ------------------------------------------------------------------ 地域・都市ページ */

function placeTitle(i: IntlPlaceInput): string {
  const n = N(i.stores.length);
  const w = placeJa(i);
  return fitTitleW([
    `${w}のアップルストア（${n}店舗）：iPhone Duo在庫をライブ確認`,
    `${w}のアップルストア（${n}店舗）：iPhone在庫・入荷`,
    `${w}のアップルストア：iPhone在庫`,
    `${w}のアップルストア`,
  ]);
}

/** 説明文の価格部分。 */
function priceBit(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") { const t = region ? withProvinceTax(duo, region) : null; return t ? `、税込約${money(c, t.total)}` : `、税抜${money(c, duo)}`; }
  return includedRate(c) == null ? `、${money(c, duo)}から` : `、${money(c, duo)}（税込）から`;
}

function placeDescription(i: IntlPlaceInput): string {
  const n = N(i.stores.length);
  const w = placeJa(i);
  return fitTitleW([
    `${w}のアップルストア${n}店舗のうち、いまiPhone Duoを店頭受け取りできるのは${N(i.stockNow.duo)}店舗、18 Pro Maxは${N(i.stockNow["18-pro-max"])}店舗。店舗別のライブ在庫と入荷時間${priceBit(i.cc, i.region)}。`,
    `${w}のアップルストア${n}店舗：iPhone Duoの在庫は${N(i.stockNow.duo)}店舗、18 Pro Maxは${N(i.stockNow["18-pro-max"])}店舗。店舗別のライブ在庫と入荷時間。`,
  ], 155);
}

function placeIntro(i: IntlPlaceInput): string {
  const w = placeJa(i);
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? `（${N(i.cities)}都市）` : "";
  return `**${w}のApple Store ${N(i.stores.length)}店舗**${cities}の棚：iPhone Duoがあるのは**${N(i.stockNow.duo)}店舗**、18 Proは**${N(i.stockNow["18-pro"])}店舗**、18 Pro Maxは**${N(i.stockNow["18-pro-max"])}店舗**。`;
}

/** 「256GB Night Sky」→「256GB ナイトスカイ」。 */
const cfgJa = (label: string) => { const [storage, ...rest] = label.split(" "); return configLabel({ storage, color: rest.join(" ") }, L); };

function duoLead(i: IntlPlaceInput): string {
  const n = N(i.stores.length);
  const have = duoStoresNow(i);
  const st = i.duo;
  if (have.length > 0) return `iPhone Duoが棚にあるのは**${N(have.length)}/${n}店舗**：${listJa(have.map((s) => appleStoreLabel(s, L)), 4)}。`;
  if (st.month > 0) return `いまiPhone Duoが棚にある店舗は**0/${n}**。それでも${sinceWhen()}で**${N(st.month)}回**の再入荷が台帳に入っています。`;
  return `いまiPhone Duoが棚にある店舗は**0/${n}**。${sinceWhen()}の台帳にも、Duoの再入荷はまだ一度もありません。`;
}

function duoPoints(i: IntlPlaceInput, w: string, alert: string): Block[] {
  const n = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (have.length > 0 && st.month > 0) items.push(`**台帳（${sinceWhen()}）：**この地域の店舗でDuoの再入荷${N(st.month)}回`);
  if (st.lastRestock && last) items.push(`**いちばん新しい再入荷：**${appleStoreLabel(last, L)} · ${whenIn(i.cc, st.lastRestock.at)}`);
  if (st.medianMs != null) items.push(`**棚にあった時間：**中央値でおよそ${fmtDuration(st.medianMs, L)}`);
  items.push(`**手の打ち方：**${n <= 3 ? `${N(n)}店舗すべて` : `近い${N(Math.min(n, 5))}店舗`}を[${w}のiPhone Duoの見守りリストに入れる](${alert})`);
  items.push("**見守り1件**が見るのは1店舗・1構成。受け取れる状態を確かめた時点でプッシュ通知を送ります");
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: "**棚は1分ほどで入れ替わります：**apple.comを何度も読み込み直すより、行ける店舗を見守っておくほうが確実です。" });
  blocks.push({ t: "ul", items });
  return blocks;
}

function placeSections(i: IntlPlaceInput): KeywordSection[] {
  const n = i.stores.length;
  const w = placeJa(i);
  const alert = alertHref({ model: "duo", state: i.regionSlug || undefined, city: i.kind === "city" ? i.citySlug : undefined, country: i.cc });
  const scarce = scarcest(i, "18-pro-max");
  const pm = catalogFor("18-pro-max", i.cc).length;
  return [
    {
      id: "iphone-duo",
      h2: `いま${w}のどの店舗の棚にiPhone Duoがある？`,
      lead: duoLead(i),
      blocks: duoPoints(i, w, alert),
    },
    {
      id: "iphone-18-pro-max",
      h2: `${w}の棚にあるiPhone 18 Pro Maxは？店舗ごとに`,
      lead: `iPhone 18 Pro Maxが棚にあるのは**${N(i.stockNow["18-pro-max"])}/${N(n)}店舗**。店舗と構成の組み合わせ${N(n * pm)}通りで数えると、**${pctJa(pairsPct(i, "18-pro-max"))}**が棚にあり。`,
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**棚でいちばん見かけない構成：**${listJa(scarce.map((x) => `${cfgJa(x.label)}（${N(x.stores)}/${N(n)}店舗）`))}`] : []),
        `**iPhone 18 Pro：**${N(i.stockNow["18-pro"])}/${N(n)}店舗、組み合わせで見ると${pctJa(pairsPct(i, "18-pro"))}が棚にあり`,
        `**台帳（${sinceWhen()}）：**${i.max.month ? `18 Pro Maxの再入荷${N(i.max.month)}回` : "18 Pro Maxの再入荷はまだ記録なし"}`,
        ...(i.max.medianMs != null ? [`**棚にあった時間：**Pro Maxは中央値でおよそ${fmtDuration(i.max.medianMs, L)}`] : []),
      ] }],
    },
    priceSection(i.cc, w, i.cc === "ca" ? i.region : undefined),
  ];
}

/* ------------------------------------------------------------------ 国：店舗一覧とホーム */

function storesIndexTitle(cc: CountryCode): string {
  const n = N(storesOf(cc).length);
  const head = cc === "jp" ? "アップルストア店舗一覧" : `${country(cc)}のアップルストア一覧`;
  return fitTitleW([`${head}（全${n}店舗）：iPhone Duo在庫をライブ確認`, `${head}（全${n}店舗）：iPhone在庫`, `${country(cc)}のアップルストア：iPhone在庫`], 70);
}

function homeTitle(cc: CountryCode): string {
  const n = N(storesOf(cc).length);
  const head = cc === "jp" ? "アップルストアの在庫確認" : `${country(cc)}のアップルストア在庫確認`;
  return fitTitleW([`${head}｜iPhone在庫を全${n}店舗で15秒ごと`, `${head}｜全${n}店舗のiPhone在庫`, `${head}（全${n}店舗）`, head]);
}

function homeH1(cc: CountryCode): string {
  const n = storesOf(cc).length;
  return n === 1 ? `${country(cc)}のアップルストアのiPhone在庫をチェック` : `${country(cc)}のアップルストア全${N(n)}店舗のiPhone在庫をチェック`;
}

function allStoresPhrase(cc: CountryCode): string {
  const n = storesOf(cc).length;
  return n === 1 ? `${country(cc)}にただひとつのApple Store` : `${country(cc)}各地のApple Store ${N(n)}店舗`;
}

/** 店舗の分布：「6都道府県・6都市に分散」「全店が東京」「所在地：東京」。 */
function spreadPhrase(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const regions = statesWithStores(cc);
  const cities = citiesWithStores(cc);
  const n = storesOf(cc).length;
  if (n === 1) return `所在地：${cityLabel(cc, cities[0].name, L)}`;
  if (cities.length === 1) return `全店が${cityLabel(cc, cities[0].name, L)}`;
  if (!c.regionNoun || regions.length === 1) return `${N(cities.length)}都市に分散`;
  return `${N(regions.length)}${noun(c)}・${N(cities.length)}都市に分散`;
}

function modelPageTitles(cc: CountryCode, model: ModelKey): { title: string; h2: string[] } {
  const m = modelByKey(model)!;
  const n = storesOf(cc).length;
  const all = n === 1 ? "アップルストア" : `アップルストア全${N(n)}店舗`;
  return {
    title: fitTitleW([`${m.name}の在庫：${all}をライブ確認｜価格・入荷`, `${m.name}の在庫：${all}をライブ確認`, `${m.name}の在庫（${country(cc)}）`], 70),
    h2: [`近くのどのApple Storeの棚に${m.name}がある？`, priceSection(cc, country(cc), undefined, model).h2],
  };
}

function priceFrom(cc: CountryCode, model: ModelKey): string {
  const c = COUNTRIES[cc];
  const r = priceRange(cc, model);
  if (cc === "ca") return `**${money(c, r.low)}**（税抜）`;
  return includedRate(c) == null ? `**${money(c, r.low)}**` : `**${money(c, r.low)}**（${taxJa(c)}込み）`;
}

function modelIntro(cc: CountryCode, model: ModelKey, inStock: number): string {
  const m = modelByKey(model)!;
  const n = N(storesOf(cc).length);
  const now = inStock === 0
    ? `${country(cc)}のApple Storeで、いま${m.name}が棚にある店舗は**0/${n}**`
    : `${country(cc)}のApple Storeで、いま${m.name}が棚にある店舗は**${N(inStock)}/${n}**`;
  return `${now}。値段は${priceFrom(cc, model)}から。`;
}

function modelDescription(cc: CountryCode, model: ModelKey, inStock: number): string {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const n = N(storesOf(cc).length);
  const r = priceRange(cc, model);
  const p = `${money(c, r.low)}${cc === "ca" ? "（税抜）" : includedRate(c) == null ? "" : "（税込）"}`;
  return fitTitleW([
    `${m.name}の在庫は？いま${country(cc)}のアップルストア${n}店舗中${N(inStock)}店舗で店頭受け取りできます。店舗・構成別のライブ在庫、価格は${p}から、入荷時間も。`,
    `${m.name}の在庫：${country(cc)}のアップルストア${n}店舗中${N(inStock)}店舗にあり。店舗・構成別のライブ在庫、入荷時間、入荷通知。`,
  ], 155);
}

function modelRows(cc: CountryCode, storesNow: Record<ModelKey, number>, restocks: Record<ModelKey, number>): string[][] {
  const prefix = cc === "us" ? "" : `/${cc}`;
  return MODELS.map((m) => [`[${m.name}](${prefix}/stock/${m.slug})`, N(catalogFor(m.key, cc).length), N(storesNow[m.key] ?? 0), N(restocks[m.key] ?? 0)]);
}

function homeDescription(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const n = storesOf(cc).length;
  const cur = c.currency === "JPY" ? "円" : c.currency;
  return fitTitleW([
    `${allStoresPhrase(cc)}のiPhone Duo・18 Pro・Pro Max店頭受け取り在庫を15秒ごとにライブ確認。${n === 1 ? "価格" : "入荷時間と価格"}（${cur}）も掲載、入荷したらプッシュ通知。`,
    `${allStoresPhrase(cc)}のiPhone店頭受け取り在庫を15秒ごとにライブ確認。${n === 1 ? "価格" : "入荷時間と価格"}も掲載、入荷したらプッシュ通知。`,
  ], 155);
}

function homeIntro(cc: CountryCode): string {
  const n = N(storesOf(cc).length);
  return `${country(cc)}のApple Store ${n}店舗の棚：iPhone Duoは**{{duo.storesNow}}店舗**、iPhone 18 Proは**{{pro.storesNow}}店舗**、iPhone 18 Pro Maxは**{{pm.storesNow}}店舗**。`;
}

function homeSections(i: HomeCopyInput): KeywordSection[] {
  const cc = i.cc;
  const c = COUNTRIES[cc];
  const stores = storesOf(cc);
  const n = stores.length;
  return [
    {
      id: "iphone-stock",
      h2: `${country(cc)}の棚：Duo・18 Pro・Pro Maxを店舗ごとに`,
      lead: `ShelfSpringは、${allStoresPhrase(cc)}についてapple.comの店頭受け取りの答えを構成ごとに同期された在庫データから記録し、店舗${n > 1 ? `・${c.regionNoun ? noun(c) : "都市"}` : ""}・構成のどの切り口でも読めるようにしています。`,
      blocks: [
        { t: "table", head: ["モデル", "追跡する構成", "いま棚にある店舗", "台帳の再入荷"], rows: modelRows(cc, i.storesNow, i.restocks), caption: `${country(cc)}で台帳が追っている範囲 · {{asOf}}の記録` },
        { t: "ul", items: [
          `**範囲：**${N(n)}店舗（${spreadPhrase(cc)}） · 型番と定価は${country(cc)}のApple Storeに準拠`,
          "**同期された在庫データ**から、追跡中の構成をすべて記録",
          "**裏づけの観測がそろってから台帳へ：**apple.comの一瞬の表示の乱れは、再入荷にも「棚から消えた」にも数えません",
          `**確かめた変化は1件ずつ**[再入荷ログ](${i.restocksPath})に残り、${i.index?.indexable ? `[店舗ごとの記録](${i.index.path})` : "店舗ごとの記録"}のグラフにもなります`,
        ] },
        { t: "img", id: "phone-notification" },
      ],
    },
    priceSection(cc, country(cc)),
    {
      id: "alerts",
      h2: "棚を自分で見に行かずに済ませるには？",
      lead: `棚を見るのは無料で、料金がかかるのは「見に行かなくて済む」部分だけ。行けるApple Storeと欲しい構成を見守りリストに入れておけば、${n === 1 ? "その店舗" : "どれかの店舗"}で受け取れる状態を確かめた時点で、スマートフォンにプッシュ通知を送ります。`,
      blocks: [
        { t: "ol", items: [
          "**見守りを設定**を押し、モデル・ストレージ・色を決める。",
          n === 1 ? `店舗を選ぶ：${cityLabel(cc, stores[0].city, L)}の${appleStoreLabel(stores[0], L)}。` : "実際に行ける店舗だけにチェック。近い順に、道のりのkmとかかる時間を添えて並びます。",
          "iPhoneでは、ShelfSpringをホーム画面に追加してから通知を許可する（[手順](/install)）。",
          "通知が来たらそこからapple.comへ進み、その店舗での店頭受け取りで注文する。",
        ] },
        { t: "table", head: ["プラン", "月額（米ドル）", "見守りの上限"], rows: [["Plus", "$5 / 月", "10件"], ["Pro", "$10 / 月", "20件"], ["Max", "$20 / 月", "50件"]], caption: "見守り1件で1店舗・1構成 · 棚を見るだけなら無料（[プラン](/pricing)）" },
        { t: "note", text: "**台帳から言えること：**Duoは行ける店舗をすべて見守りに。18 Proと18 Pro Maxは、いまの棚の数字を見てから決めても遅くありません。" },
        { t: "img", id: "apple-store-pickup-counter" },
      ],
    },
  ];
}

function homeFaq(cc: CountryCode, rt: RestockTimesBrief): Faq[] {
  const n = N(storesOf(cc).length);
  const p = cc === "us" ? "" : `/${cc}`;
  const when = rt.n === 0
    ? `11月2日に記録を開いてから、確かめられた再入荷はまだゼロ。最初の1件が入りしだい、[${country(cc)}のiPhone Duo再入荷の時間帯](${rt.path})に店舗時刻の時間帯・曜日別で並べます。`
    : rt.peakHour != null
      ? `記録が集まるのは**店舗時刻の${hour(L, rt.peakHour, true)}前後**。11月2日からの台帳には${N(rt.n)}回の再入荷があり、記録のある店舗は${N(rt.stores)}/${N(rt.storesTotal)}。[時間帯・日付ごとの記録](${rt.path})。`
      : `11月2日からの台帳に再入荷は${N(rt.n)}回（${N(rt.stores)}/${N(rt.storesTotal)}店舗）。ただ、決まった時間帯を挙げられるほど記録のある日がまだそろっていません。[時間帯・日付ごとの記録](${rt.path})。`;
  return [
    { q: `${country(cc)}で、いまiPhone Duoが棚にあるApple Storeは？`, a: `{{asOf}}の観測では{{duo.storesNow}}/${n}店舗。店舗と構成ごとの内訳は[${country(cc)}のiPhone Duoの棚](${p}/stock/iphone-duo)にあります。` },
    { q: `${country(cc)}では、iPhone Duoはどの時間帯に棚へ戻る？`, a: when },
    { q: "通知はいつ届く？", a: `${country(cc)}の店舗の在庫データを同期し、条件に合う在庫を検出してから送ります。最初の「受け取れる」はもう一度確かめてから扱うので、Apple側の一時的な乱れが通知になることはありません。確認・同期・配信のそれぞれで遅れが出ることがあります。` },
    { q: "お金はかかる？", a: "棚の状況・地図・再入荷ログは無料。見守りはPlusが月$5で10件、Proが月$10で20件、Maxが月$20で50件まで（請求は米ドル）。解約はいつでもできます（[プラン](/pricing)）。" },
    taxFaq(cc, country(cc)),
    { q: "取り置きや予約を代わりにしてもらえる？", a: `できません。ShelfSpringがするのは、棚に出たことを知らせるところまで。注文はご自身でapple.comから店頭受け取りを選んで行い、品物を確保するのはAppleです（[Appleの受け取りの案内](${pickupHelp(cc).url})）。` },
  ];
}

const homeLabels: Dict["place"]["home"] = {
  appName: (cc: CountryCode) => `ShelfSpring 受け取り台帳（${country(cc)}）`,
  offer: "棚の状況・地図・再入荷ログは無料、見守りのプランは月$5から",
  itemList: (cc: CountryCode) => `${country(cc)}のアップルストア`,
  restockTimesChip: "過去の再入荷の時間帯",
  storesByRegion: (cc: CountryCode) => `${noun(COUNTRIES[cc])}ごとにたどる`,
  browse: (cc: CountryCode) => `${country(cc)}の台帳をもっと見る`,
  selloutH2: (cc: CountryCode) => `${country(cc)}で棚に戻ったiPhoneは、どれだけ棚にあった？`,
  selloutLabel: (cc: CountryCode) => `${country(cc)}全体`,
  last24Label: (cc: CountryCode) => `${country(cc)}全体`,
  newsroom: "Apple Newsroom：iPhone Duoが世界のApple Storeに登場（2026年10月23日、英語）",
};

/** 店舗ページの <title> と H1：「Apple 銀座：iPhone在庫・店頭受け取り・営業時間」（検索向けに据え置き）。`region` はその都市・地域で唯一の店舗のとき。 */
function storeTitle(s: Store, region?: string): string {
  const name = appleStoreLabel(s, L);
  const shown = region && !name.includes(region) && !storeLabel(s, L).includes(region) ? region : null;
  return fitTitleW(content.titles.store(name, shown));
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
  home: homeLabels,
  storeTitle,
  sources: (code: Exclude<CountryCode, "us">) => ({
    pickupHelp: { label: "apple.com「出荷・配送と受取について」— 店頭受け取りの手順", url: pickupHelp(code).url },
    storeList: { label: `apple.comに載っている直営店のリスト（${country(code)}）`, url: storeListSource(code).url },
    tax: taxSource(code),
  }),
};

export const place: Dict["place"] = withShelfPlace("ja", basePlace);
