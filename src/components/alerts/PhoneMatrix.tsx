"use client";
/**
 * Phones: a tab per model and, under it, every exact configuration as a grid — storage down the side,
 * colour across the top. Ticking a cell adds that phone (to every chosen store), unticking removes it.
 */
import { useId, useState } from "react";
import { COLOR_META, MODELS, STORAGE_ORDER, type ModelKey } from "@/lib/apple/catalog-us";
import { COUNTRIES, formatPrice, type CountryCode } from "@/lib/apple/countries";
import type { GeoStore } from "@/lib/geo";
import { phoneKey, type Phone } from "@/lib/alertSet";
import { useLang, useT } from "@/components/i18n/LangProvider";
import { fill, price, bidi } from "@/lib/i18n/format";
import { colorLabel } from "@/lib/i18n/places";
import type { Lang } from "@/lib/i18n/locales";
import "@/components/pages/Workspace.css";

/**
 * A store as the picker of another country's page receives it (no hours or addresses: they stay on the server).
 * In another language: Apple's names there for the store, its city and its region (catalog.pickerStore).
 */
export type PickerStore = GeoStore & Required<Pick<GeoStore, "slug" | "country" | "region">> & { label?: string; cityLabel?: string; regionLabel?: string };

/**
 * What the alert setup offers: every configuration per model with its price, and — on another country's
 * pages — that country (prices in its currency) and its stores for the store list. Absent = the US.
 * In another language a configuration also carries its colour's name and price as written there.
 */
export interface PhoneCatalog {
  configs: Record<ModelKey, { storage: string; color: string; price: number; partNumber: string; colorLabel?: string; priceLabel?: string }[]>;
  country?: CountryCode;
  stores?: PickerStore[];
}

export function PhoneMatrix({ catalog, selected, onToggle, initialModel, disabled = false }: {
  catalog: PhoneCatalog; selected: Phone[]; onToggle: (p: Phone) => void; initialModel?: ModelKey; disabled?: boolean;
}) {
  const d = useT().alerts.matrix;
  const tabsId = useId();
  const lang = useLang();
  const firstPicked = selected[0]?.model as ModelKey | undefined;
  const [model, setModel] = useState<ModelKey>(initialModel ?? firstPicked ?? MODELS[0].key);
  const configs = catalog.configs[model] ?? [];
  const storages = STORAGE_ORDER.filter((s) => configs.some((c) => c.storage === s));
  const colors = [...new Set(configs.map((c) => c.color))];
  const picked = new Set(selected.map(phoneKey));
  const countFor = (m: ModelKey) => selected.filter((p) => p.model === m).length;
  const colorName = (c: string) => configs.find((x) => x.color === c)?.colorLabel ?? colorLabel(c, lang);
  const priceOf = (cfg: (typeof configs)[number]) => (lang !== "en" ? cfg.priceLabel ?? price(lang, COUNTRIES[catalog.country ?? "us"], cfg.price)
    : catalog.country && catalog.country !== "us" ? formatPrice(COUNTRIES[catalog.country], cfg.price) : `$${cfg.price.toLocaleString("en-US")}`);
  return (
    <div className="phone-choice-workspace">
      <div className="phone-model-tabs" role="tablist" aria-label={d.model}>
        {MODELS.map((m) => {
          const n = countFor(m.key);
          return <button key={m.key} id={`${tabsId}-${m.key}`} type="button" role="tab" tabIndex={model === m.key ? 0 : -1} aria-selected={model === m.key} aria-controls={`${tabsId}-panel`} onClick={() => setModel(m.key)} onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            const at = MODELS.findIndex((entry) => entry.key === m.key);
            const delta = (event.key === "ArrowRight" ? 1 : -1) * (lang === "ar" ? -1 : 1);
            const index = event.key === "Home" ? 0 : event.key === "End" ? MODELS.length - 1 : (at + delta + MODELS.length) % MODELS.length;
            setModel(MODELS[index].key);
            event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[index]?.focus();
          }} className="phone-model-tab"><span>{m.name}</span>{n > 0 && <span className="phone-choice-count">{n}</span>}</button>;
        })}
      </div>
      <div id={`${tabsId}-panel`} role="tabpanel" aria-labelledby={`${tabsId}-${model}`} className="mt-5 space-y-5" aria-label={fill(d.configs, { model: MODELS.find((m) => m.key === model)?.name ?? model })}>
        {storages.map((storage) => <fieldset key={storage} className="border-t border-line pt-3">
          <legend className="pe-3 font-mono text-xs font-semibold text-ink-2">{storage}</legend>
          <div className="phone-choice-grid">
            {colors.map((color) => {
              const cfg = configs.find((x) => x.storage === storage && x.color === color);
              if (!cfg) return null;
              const phone = { model, storage, color };
              const on = picked.has(phoneKey(phone));
              return <button key={color} type="button" role="checkbox" aria-checked={on} aria-label={`${storage} ${colorName(color)}`} disabled={disabled} onClick={() => onToggle(phone)} className="phone-choice" data-selected={on}>
                <span className="phone-choice-swatch" style={{ background: COLOR_META[color]?.hex ?? "#888" }} aria-hidden />
                <span className="min-w-0"><span className="block text-xs font-semibold">{colorName(color)}</span><span className="mt-1 block font-mono text-[11px] text-ink-3">{priceOf(cfg)}</span></span>
                <span className="phone-choice-tick" aria-hidden>{on ? "✓" : "+"}</span>
              </button>;
            })}
          </div>
        </fieldset>)}
      </div>
    </div>
  );
}

/** "iPhone Duo 256GB Night Sky", or "Duo 256GB Night Sky" short; the colour in Apple's name for it in `lang`. */
export function phoneName(p: Phone, short = false, lang: Lang = "en"): string {
  const m = MODELS.find((x) => x.key === p.model);
  return `${short ? bidi(m?.short ?? p.model, lang) : m?.name ?? p.model} ${p.storage} ${colorLabel(p.color, lang)}`;
}
