"use client";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { useLocale } from "@/components/i18n/LangProvider";
import { baseLang, type Locale } from "@/lib/i18n/locales";
import { chrome as en } from "@/lib/i18n/dict/en/chrome";
import { chrome as ja } from "@/lib/i18n/dict/ja/chrome";
import { chrome as ko } from "@/lib/i18n/dict/ko/chrome";
import { chrome as zh_tw } from "@/lib/i18n/dict/zh-tw/chrome";
import { chrome as zh_hk } from "@/lib/i18n/dict/zh-hk/chrome";
import { chrome as de } from "@/lib/i18n/dict/de/chrome";
import { chrome as fr } from "@/lib/i18n/dict/fr/chrome";
import { chrome as it } from "@/lib/i18n/dict/it/chrome";
import { chrome as es } from "@/lib/i18n/dict/es/chrome";
import { chrome as nl } from "@/lib/i18n/dict/nl/chrome";
import { chrome as sv } from "@/lib/i18n/dict/sv/chrome";
import { chrome as ar } from "@/lib/i18n/dict/ar/chrome";
const COPY = { "en": en.notFound, "ja": ja.notFound, "ko": ko.notFound, "de": de.notFound, "fr": fr.notFound, "it": it.notFound, "es": es.notFound, "nl": nl.notFound, "sv": sv.notFound, "ar": ar.notFound, "zh-TW": zh_tw.notFound, "zh-HK": zh_hk.notFound };
/** Segment 404s read the URL-derived provider; no request headers enter a public cached tree. */
export default function NotFound({ locale }: { locale?: Locale } = {}) {
  const current = useLocale();
  const loc = locale ?? current;
  const F = COPY[loc.lang as keyof typeof COPY] ?? COPY[baseLang(loc.lang) as keyof typeof COPY] ?? en.notFound;
  const p = loc.native ? `/${loc.id}` : "";
  const cls = "underline decoration-line-2 hover:text-ink";
  return <div className="mx-auto max-w-2xl px-4 pt-24 text-center">
    <div className="eyebrow">404</div><h1 className="display mt-2 text-3xl sm:text-5xl">{F.title}</h1>
    <p className="mt-4 text-ink-2">{F.body(<Link href={`${p}/stores`} className={cls}>{F.stores}</Link>, <Link href={`${p}/map`} className={cls}>{F.map}</Link>)}</p>
    <Link href={p || "/"} className="btn btn-primary mt-6">{F.home}</Link>
  </div>;
}
