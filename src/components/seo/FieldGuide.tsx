import { PendingLink as Link } from "@/components/ui/PendingLink";
import { storePath,type Store } from "@/lib/apple/catalog";
import { num } from "@/lib/i18n/format";
import { baseLang,type Lang } from "@/lib/i18n/locales";
import { storeLabel } from "@/lib/i18n/places";
import { pageLocale } from "@/lib/i18n/server";
import type { StoreStockSummary } from "@/lib/stock/queries";
import type { ReactNode } from "react";
import { fieldNarrative } from "./FieldGuideNarrative";

type Words = { edition: string; lead: string; compare: string; evidence: string; method: string; methodBody: string; coverage: string; observed: string; choices: string; unknown: string; updated: string; next: string; history: string; alternatives: string };
const WORDS: Record<string, Words> = {
  en: { edition: "The pickup field guide", lead: "Start with the choices you can reach. Compare store observations, narrow the configuration, then check the order with Apple. The history below explains the record; it cannot reserve the next phone.", compare: "Compare your pickup options", evidence: "The observation record", method: "Read this before you travel", methodBody: "Availability is an observation, not a reservation or a count of phones. Blank data is unknown. A return counts one store and one configuration becoming available again; repeated returns can involve the same store. Historical patterns do not predict the next delivery. Confirm your order and pickup time with Apple before travelling.", coverage: "Snapshot coverage", observed: "Stores with observations", choices: "Available store–configuration pairs", unknown: "Not observed", updated: "Observation window", next: "Build your shortlist", history: "What changed over time", alternatives: "Keep another store in reach" },
  ja: { edition: "受け取りのフィールドガイド", lead: "行ける店舗から候補を選び、観測された在庫と構成を比べましょう。最後にAppleで注文を確認してください。履歴は過去の記録であり、次の端末を予約するものではありません。", compare: "受け取り候補を比較", evidence: "観測の記録", method: "出かける前に", methodBody: "在庫表示は観測結果であり、予約や端末数ではありません。未取得のデータは不明です。再入荷1回は1店舗の1構成が再び購入可能になった記録で、同じ店舗を繰り返し数える場合があります。履歴は次回入荷の予測ではありません。移動前にAppleで注文と受け取り時刻を確認してください。", coverage: "観測の範囲", observed: "観測記録のある店舗", choices: "在庫ありの店舗と構成の組み合わせ", unknown: "未観測", updated: "観測期間", next: "候補を絞る", history: "時間とともに変わったこと", alternatives: "別の店舗も候補に" },
  ko: { edition: "픽업 현장 가이드", lead: "방문할 수 있는 매장부터 고르고 관측된 재고와 구성을 비교하세요. 주문은 Apple에서 확인하세요. 이력은 과거 기록이며 다음 기기를 예약하지 않습니다.", compare: "픽업 후보 비교", evidence: "관측 기록", method: "방문 전 확인", methodBody: "재고 표시는 관측 결과이며 예약이나 기기 수가 아닙니다. 데이터가 없으면 알 수 없는 상태입니다. 재입고 한 건은 한 매장의 한 구성이 다시 가능해진 기록이며 같은 매장이 반복될 수 있습니다. 과거 기록은 다음 입고를 예측하지 않습니다. 이동 전 Apple에서 주문과 픽업 시간을 확인하세요.", coverage: "관측 범위", observed: "관측 기록이 있는 매장", choices: "구매 가능한 매장·구성 조합", unknown: "미관측", updated: "관측 시간 범위", next: "후보 매장 고르기", history: "시간에 따른 변화", alternatives: "다른 매장도 비교" },
  "zh-TW": { edition: "取貨實查指南", lead: "先選能前往的門市，再比較觀測庫存與規格，最後到 Apple 確認訂單。下方歷史說明過去的紀錄，並不預留下一支手機。", compare: "比較取貨選擇", evidence: "觀測紀錄", method: "出發前先確認", methodBody: "庫存顯示是觀測結果，不是預約或手機數量。空白資料代表未知。一次補貨是一家門市的一種規格再次可供取貨，同一門市可能重複計入。歷史規律不能預測下次到貨。請先在 Apple 確認訂單與取貨時間再出發。", coverage: "本次觀測範圍", observed: "有觀測資料的門市", choices: "有貨的門市與規格組合", unknown: "尚未觀測", updated: "觀測時間範圍", next: "建立候選清單", history: "隨時間發生的變化", alternatives: "保留鄰近替代門市" },
  "zh-HK": { edition: "取貨實查指南", lead: "先選可前往的分店，再比較觀測庫存及配置，最後到 Apple 確認訂單。以下歷史只說明過去紀錄，並不預留下一部手機。", compare: "比較取貨選擇", evidence: "觀測紀錄", method: "出發前先確認", methodBody: "庫存顯示是觀測結果，不是預約或手機數量。空白資料代表未知。一次補貨是一間分店的一款配置再次可供取貨，同一分店可能重複計入。歷史規律不能預測下次到貨。請先在 Apple 確認訂單及取貨時間再出發。", coverage: "本次觀測範圍", observed: "有觀測資料的分店", choices: "有貨的分店與配置組合", unknown: "尚未觀測", updated: "觀測時間範圍", next: "建立候選清單", history: "隨時間發生的變化", alternatives: "保留附近替代分店" },
  de: { edition: "Der Abholwegweiser", lead: "Beginne mit erreichbaren Stores. Vergleiche beobachtete Bestände, wähle eine Variante und bestätige die Bestellung bei Apple. Die Historie erklärt vergangene Meldungen; sie reserviert kein nächstes Gerät.", compare: "Abholmöglichkeiten vergleichen", evidence: "Die Beobachtungen", method: "Vor der Fahrt lesen", methodBody: "Verfügbarkeit ist eine Beobachtung, keine Reservierung oder Stückzahl. Fehlende Daten bleiben unbekannt. Eine Rückkehr zählt eine Variante in einem Store; derselbe Store kann mehrfach vorkommen. Vergangene Muster sagen keine nächste Lieferung voraus. Bestätige Bestellung und Abholzeit vor der Fahrt bei Apple.", coverage: "Umfang der Momentaufnahme", observed: "Stores mit Beobachtungen", choices: "Verfügbare Store-Varianten-Paare", unknown: "Nicht beobachtet", updated: "Beobachtungszeitraum", next: "Deine Auswahl eingrenzen", history: "Was sich im Verlauf änderte", alternatives: "Einen weiteren Store einplanen" },
  fr: { edition: "Le guide pratique du retrait", lead: "Commencez par les magasins accessibles. Comparez les stocks observés, choisissez une configuration, puis confirmez la commande chez Apple. L’historique explique le passé ; il ne réserve pas le prochain appareil.", compare: "Comparer les possibilités de retrait", evidence: "Le relevé des observations", method: "À lire avant de partir", methodBody: "La disponibilité est une observation, pas une réservation ni un nombre de téléphones. Une donnée absente reste inconnue. Un retour compte une configuration dans un magasin, qui peut revenir plusieurs fois. L’historique ne prédit pas la prochaine livraison. Confirmez commande et horaire chez Apple avant de partir.", coverage: "Couverture du relevé", observed: "Magasins observés", choices: "Paires magasin–configuration disponibles", unknown: "Non observé", updated: "Période d’observation", next: "Construire votre sélection", history: "Les changements dans le temps", alternatives: "Garder un autre magasin possible" },
  it: { edition: "La guida pratica al ritiro", lead: "Parti dagli store raggiungibili. Confronta le disponibilità osservate, scegli una configurazione e conferma l’ordine con Apple. Lo storico descrive il passato; non riserva il prossimo telefono.", compare: "Confronta le possibilità di ritiro", evidence: "Il registro delle osservazioni", method: "Prima di metterti in viaggio", methodBody: "La disponibilità è un’osservazione, non una prenotazione o un numero di telefoni. I dati mancanti restano sconosciuti. Un ritorno conta una configurazione in uno store, anche più volte nello stesso store. Lo storico non prevede la prossima consegna. Conferma ordine e orario di ritiro con Apple prima di partire.", coverage: "Copertura della rilevazione", observed: "Store con osservazioni", choices: "Coppie store–configurazione disponibili", unknown: "Non osservato", updated: "Intervallo di osservazione", next: "Prepara la tua selezione", history: "Che cosa è cambiato nel tempo", alternatives: "Tieni uno store alternativo" },
  es: { edition: "La guía práctica de recogida", lead: "Empieza por las tiendas a las que puedas llegar. Compara las observaciones, elige una configuración y confirma el pedido con Apple. El historial describe el pasado; no reserva el próximo teléfono.", compare: "Compara opciones de recogida", evidence: "El registro de observaciones", method: "Antes de desplazarte", methodBody: "La disponibilidad es una observación, no una reserva ni una cantidad de teléfonos. Los datos ausentes siguen siendo desconocidos. Una reposición cuenta una configuración en una tienda, que puede repetirse. El historial no predice la próxima entrega. Confirma el pedido y la hora con Apple antes de salir.", coverage: "Cobertura de la observación", observed: "Tiendas observadas", choices: "Pares tienda–configuración disponibles", unknown: "Sin observación", updated: "Intervalo de observación", next: "Prepara tu selección", history: "Qué cambió con el tiempo", alternatives: "Conserva otra tienda como opción" },
  nl: { edition: "De praktische afhaalgids", lead: "Begin bij stores die je kunt bereiken. Vergelijk waargenomen voorraad, kies een uitvoering en bevestig de bestelling bij Apple. De geschiedenis beschrijft het verleden en reserveert geen volgend toestel.", compare: "Afhaalopties vergelijken", evidence: "Het waarnemingsregister", method: "Lees dit voor vertrek", methodBody: "Beschikbaarheid is een waarneming, geen reservering of aantal telefoons. Ontbrekende gegevens blijven onbekend. Een aanvulling telt één uitvoering in één store; dezelfde store kan vaker meetellen. Historische patronen voorspellen geen volgende levering. Bevestig bestelling en afhaaltijd bij Apple voor vertrek.", coverage: "Dekking van de momentopname", observed: "Stores met waarnemingen", choices: "Beschikbare store-uitvoeringparen", unknown: "Niet waargenomen", updated: "Waarnemingsperiode", next: "Maak je selectie", history: "Wat er in de tijd veranderde", alternatives: "Houd een andere store achter de hand" },
  sv: { edition: "Den praktiska hämtningsguiden", lead: "Börja med butiker du kan nå. Jämför observerat lager, välj en variant och bekräfta beställningen hos Apple. Historiken beskriver det förflutna och reserverar inte nästa telefon.", compare: "Jämför hämtningsalternativ", evidence: "Observationsregistret", method: "Läs innan du åker", methodBody: "Tillgänglighet är en observation, ingen reservation eller mängd telefoner. Saknade uppgifter är okända. En påfyllning räknar en variant i en butik; samma butik kan återkomma. Historiska mönster förutsäger ingen nästa leverans. Bekräfta beställning och hämtningstid hos Apple innan du åker.", coverage: "Observationens täckning", observed: "Butiker med observationer", choices: "Tillgängliga butiks- och variantpar", unknown: "Inte observerat", updated: "Observationsperiod", next: "Gör ditt urval", history: "Vad som ändrats över tid", alternatives: "Ha en alternativ butik" },
  ar: { edition: "الدليل العملي للاستلام", lead: "ابدأ بالمتاجر التي يمكنك الوصول إليها. قارن المخزون المرصود واختر التكوين ثم أكد الطلب لدى Apple. يشرح السجل الماضي ولا يحجز الهاتف التالي.", compare: "قارن خيارات الاستلام", evidence: "سجل الرصد", method: "اقرأ قبل الذهاب", methodBody: "التوفر رصد وليس حجزاً أو عدداً للهواتف. البيانات الغائبة غير معروفة. تُحسب العودة لتكوين واحد في متجر واحد، وقد يتكرر المتجر نفسه. الأنماط الماضية لا تتنبأ بالتسليم التالي. أكد الطلب ووقت الاستلام لدى Apple قبل الذهاب.", coverage: "نطاق الرصد", observed: "المتاجر التي رُصدت", choices: "أزواج المتاجر والتكوينات المتاحة", unknown: "لم يُرصد", updated: "فترة الرصد", next: "حدد قائمتك المختصرة", history: "ما الذي تغير مع الوقت", alternatives: "احتفظ بمتجر بديل" },
};

export function fieldGuideCopy(lang: Lang): Words { return WORDS[lang] ?? WORDS[baseLang(lang)] ?? WORDS.en; }

/** Independent editorial answers in every supported language; factual labels stay in the catalog. */
export function fieldGuideQuestions({ place, stores, kind, model = "iPhone", lang = "en" }: { place: string; stores: number; kind: "city" | "region" | "store" | "product" | "country" | "study"; model?: string; lang?: Lang }) {
  if (lang !== "en") return fieldNarrative(lang).questions.map(([q,a]) => ({ q: `${q} · ${place}`, a: a.replaceAll("{n}",num(lang,stores)).replaceAll("{model}",model) }));
  const location = kind === "store" ? `at ${place}` : `in ${place}`;
  const scope = stores === 1 ? "one Apple Store" : `${stores} Apple Stores`;
  return [
    { q: `What does this ${kind === "study" ? "record" : "guide"} cover ${location}?`, a: `The comparison covers ${scope}. Each availability observation belongs to an exact model, storage and color at a specific store. A total across locations does not mean the nearest store has your choice, and an unavailable data connection is not evidence of a sell-out.` },
    { q: `How should I compare pickup options for ${model} ${location}?`, a: kind === "store" ? `Open the exact configuration at this store, read its observation time, then check nearby alternatives you could reach. Complete the order with Apple before making the trip; a listing here does not hold the device for you.` : `Set a realistic travel boundary first. Compare the exact configurations inside it and keep a second reachable store in your shortlist. Use the live store details for the current observation and the history only to understand what has happened before.` },
    { q: `Does a recorded return mean a new shipment arrived ${location}?`, a: `No. A return means one store–configuration pair changed from unavailable to available in the recorded pickup observations. Cancellations or other stock changes can also reopen a listing. The record does not identify shipments or count physical phones.` },
    { q: `What will an alert watch ${location}?`, a: `One alert watches one store and one exact configuration. A matching confirmed return can trigger delivery while your plan covers that rule. Source checks, synchronization and notification delivery add delay, so an alert is not a reservation or a promise that stock will remain available.` },
  ];
}

export function FieldIntro({ title, description, actions, children }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; children?: ReactNode }) {
  const F = fieldGuideCopy(pageLocale().lang);
  return <header className="field-intro"><div><p className="field-kicker">{F.edition}</p><h1 className="field-title">{title}</h1><div className="field-lead">{description ?? F.lead}</div>{actions && <div className="mt-6 flex flex-wrap gap-2">{actions}</div>}</div>{children && <div className="min-w-0">{children}</div>}</header>;
}

export function FieldSection({ id, title, caption, action, children }: { id?: string; title: ReactNode; caption?: ReactNode; action?: ReactNode; children: ReactNode }) {
  return <section id={id} className="field-section scroll-mt-24"><div className="field-section-head"><div>{caption && <p className="field-kicker">{caption}</p>}<h2 className="text-2xl font-semibold">{title}</h2></div>{action}</div><div className="mt-5">{children}</div></section>;
}

export function FieldMethod({ children }: { children?: ReactNode }) {
  const F = fieldGuideCopy(pageLocale().lang);
  return <section className="field-callout"><p className="field-kicker">{F.evidence}</p><h2 className="mt-2 text-xl font-semibold">{F.method}</h2><p className="mt-3 text-sm leading-relaxed text-ink-2">{F.methodBody}</p>{children && <div className="mt-5">{children}</div>}</section>;
}

/** Existing store summaries only: no extra queries, averaging, freshness claims or unknown→zero coercion. */
export function fieldCoverage(stores: readonly Store[], stock: ReadonlyMap<string, StoreStockSummary>) {
  const rows = stores.map(store => {
    const summary = stock.get(store.storeNumber);
    const stamp = summary?.lastCheckedAt;
    const observedAt = stamp && Number.isFinite(new Date(stamp).getTime()) ? new Date(stamp).toISOString() : null;
    return { store, observedAt, available: observedAt && summary ? Object.values(summary.perModel).reduce((n, model) => n + model.available, 0) : null };
  });
  const observed = rows.filter(row => row.observedAt !== null);
  const times = observed.map(row => row.observedAt!).sort();
  return { rows, total: stores.length, observed: observed.length, available: observed.length ? observed.reduce((n, row) => n + row.available!, 0) : null,
    oldest: times[0] ?? null, newest: times.at(-1) ?? null };
}

export function FieldCoverage({ stores, stock }: { stores: readonly Store[]; stock: ReadonlyMap<string, StoreStockSummary> }) {
  const lang = pageLocale().lang;
  const F = fieldGuideCopy(lang);
  const coverage = fieldCoverage(stores, stock);
  const stamp = (iso: string) => new Intl.DateTimeFormat(lang, {dateStyle:"medium",timeStyle:"short",timeZone:"UTC"}).format(new Date(iso));
  return (
    <section className="pane p-5 sm:p-6" data-field-coverage="observations">
      <p className="field-kicker">{F.coverage}</p>
      <dl className="mt-4 space-y-4">
        <div><dt className="text-xs text-ink-3">{F.observed}</dt><dd className="mt-1 font-mono text-3xl">{num(lang,coverage.observed)}<span className="text-base text-ink-3"> / {num(lang,coverage.total)}</span></dd></div>
        <div className="border-t border-line pt-3"><dt className="text-xs text-ink-3">{F.choices}</dt><dd className="mt-1 font-mono text-3xl">{coverage.available===null ? "—" : num(lang,coverage.available)}</dd></div>
        <div className="border-t border-line pt-3"><dt className="text-xs text-ink-3">{F.updated}</dt><dd className="mt-2 break-words text-xs leading-relaxed text-ink-2">
          {coverage.oldest ? <><time dateTime={coverage.oldest}>{stamp(coverage.oldest)}</time>{coverage.newest!==coverage.oldest && <> – <time dateTime={coverage.newest!}>{stamp(coverage.newest!)}</time></>} UTC</> : F.unknown}
        </dd></div>
      </dl>
    </section>
  );
}

export function FieldStoreIndex({ stores }: { stores: readonly Store[] }) {
  const lang = pageLocale().lang;
  return <nav className="field-index" aria-label={fieldGuideCopy(lang).next}>{stores.map(store => <Link key={store.storeNumber} href={storePath(store)} className="field-row"><span className="font-medium">{storeLabel(store, lang)}</span><span className="font-mono text-xs text-ink-3" aria-hidden="true">↗</span></Link>)}</nav>;
}
