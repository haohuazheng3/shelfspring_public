"use client";
/**
 * /install — the illustrated "put ShelfSpring on your Home Screen" guide. Picks the platform
 * from the device, lets the reader switch, and keeps the live notification switch next to the steps.
 */
import { useEffect, useId, useState } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { Rich } from "@/components/i18n/Rich";
import { useAppLocale, useLang, useT } from "@/components/i18n/LangProvider";
import { fill } from "@/lib/i18n/format";
import { signInHome } from "@/lib/i18n/locales";
import { fetchMe } from "@/lib/me";
import { usePush, type PushState } from "./usePush";
import { B } from "./PushSetup";
import {
  SafariUrlMock, SafariShareMock, ShareSheetMock, AddDialogMock, HomeScreenMock, IosPermissionMock,
  ChromeMenuMock, ChromeInstallMock, AndroidPermissionMock, DesktopPermissionMock, DesktopInstallMock,
} from "./Mocks";
import type { Platform } from "@/lib/push/platform";
import { fieldCopy } from "@/content/field-guide";
import "@/components/pages/Workspace.css";

type Tab = "ios" | "android" | "desktop";
const TABS: Tab[] = ["ios", "android", "desktop"];
type T = ReturnType<typeof useT>["install"];

interface Step { title: string; text: React.ReactNode; art: React.ReactNode; action?: "notify" | "install" }

export function InstallGuide({ vapidPublicKey }: { vapidPublicKey: string }) {
  const p = usePush(vapidPublicKey);
  const d = useT().install;
  const lang = useLang(), F = fieldCopy(lang), tabsId = useId();
  // Sign-in and the closing watchlist button lead to the home page of the person's language ("/" in English).
  const home = signInHome(useAppLocale() ?? undefined);
  const [picked, setTab] = useState<Tab | null>(null);
  const tab: Tab = picked ?? (p.platform === "unknown" ? "ios" : p.platform);

  const steps = STEPS[tab](p, d);
  const installed = p.standalone;
  const signedIn = p.signedIn === true;
  const on = p.status === "on";
  // A signed-in reader whose alerts already reach a device (often the Home Screen app, while this is Safari).
  const [already, setAlready] = useState<string | null>(null);
  useEffect(() => {
    if (!signedIn) return;
    let gone = false;
    void fetchMe().then((me) => { if (!gone && me?.devices?.active) setAlready(me.devices.label); });
    return () => { gone = true; };
  }, [signedIn]);

  return (
    <div className="field-page">
      {/* hero */}
      <section className="field-intro">
        <div>
          <div className="field-kicker">{F.guide} / {d.hero.eyebrow}</div>
          <h1 className="field-title">{d.hero.title}</h1>
          <p className="field-lead">{d.hero.lead}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#steps" className="btn btn-primary btn-lg">{d.hero.seeSteps}</a>
            {on ? <button type="button" className="btn btn-ghost btn-lg" disabled={p.busy} aria-busy={p.busy} onClick={() => void p.sendTest()}>{p.busy && <span className="spinner" aria-hidden />}{d.hero.sendTest}</button>
              : p.status === "ready" && signedIn ? <button type="button" className="btn btn-ghost btn-lg" disabled={p.busy} onClick={() => void p.turnOn()}>{p.busy && <span className="spinner" />}{d.hero.turnOn}</button>
              : null}
          </div>
          {p.notice && <p role="status" className="mt-4 text-sm text-accent">{p.notice}</p>}
          {p.error && <p role="alert" className="mt-4 text-sm text-bad">{p.error}</p>}
        </div>
        <aside className="pane p-6"><p className="field-kicker">{F.alert}</p><p className="mt-3 text-sm leading-relaxed text-ink-2">{F.alertNote}</p>
          {already && !on ? (
            <p className="mt-8 rounded-2xl bg-accent/10 px-4 py-3 text-sm text-ink-2">
              <Rich text={d.hero.already} b="text-accent" vars={{ label: already, link: <Link href="/account" className="underline">{d.hero.myAlerts}</Link> }} />
            </p>
          ) : <Progress installed={installed} signedIn={signedIn} on={on} platform={p.platform} status={p.status} d={d} />}
        </aside>
      </section>

      {/* steps */}
      <section id="steps" className="install-workspace field-section scroll-mt-28">
        <div className="install-platform-dock">
          <div>
            <h2 className="display text-2xl sm:text-4xl">{d.steps.title}</h2>
            <p className="mt-2 text-ink-2">{d.steps.intro[tab]}</p>
          </div>
          <div className="seg mt-5 flex-wrap" role="tablist" aria-label={d.steps.tabsLabel}>
            {TABS.map((t, at) => (
              <button key={t} id={`${tabsId}-${t}`} type="button" role="tab" tabIndex={tab === t ? 0 : -1} aria-selected={tab === t} aria-controls={`${tabsId}-panel`} onClick={() => setTab(t)} onKeyDown={(event) => {
                if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                event.preventDefault();
                const delta = (event.key === "ArrowRight" ? 1 : -1) * (lang === "ar" ? -1 : 1);
                const index = event.key === "Home" ? 0 : event.key === "End" ? TABS.length - 1 : (at + delta + TABS.length) % TABS.length;
                setTab(TABS[index]);
                event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[index]?.focus();
              }}>{d.steps.tabs[t]}</button>
            ))}
          </div>
        </div>

        <ol id={`${tabsId}-panel`} role="tabpanel" aria-labelledby={`${tabsId}-${tab}`} className="space-y-6">
          {steps.map((s, i) => (
            <li key={i} className="pane install-step p-5 sm:p-7">
              <div><p className="field-kicker" aria-hidden>0{i + 1}</p><h3 className="display mt-3 text-2xl">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{s.text}</p>
              {s.action && <StepAction kind={s.action} p={p} d={d} home={home} />}
              {s.action === "notify" && p.notice && <p className="mt-3 text-sm text-accent">{p.notice}</p>}
              {s.action === "notify" && p.error && <p className="mt-3 text-sm text-bad">{p.error}</p>}
              </div><div className="install-step-art">{s.art}</div>
            </li>
          ))}
        </ol>
      </section>

      {/* notes */}
      <section className="field-section mx-auto max-w-3xl divide-y divide-line">
        {d.notes.map(({ q, a }) => (
          <details key={q} className="py-5"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-3 text-sm leading-relaxed text-ink-2">{a}</p></details>
        ))}
      </section>

      <section className="pane mt-16 flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
        <div>
          <h2 className="display text-2xl">{d.cta.title}</h2>
        </div>
        <Link href={`${home}#notify`} className="btn btn-primary btn-lg">{d.cta.button}</Link>
      </section>
    </div>
  );
}

function Progress({ installed, signedIn, on, platform, status, d }: { installed: boolean; signedIn: boolean; on: boolean; platform: Platform; status: PushState["status"]; d: T }) {
  const needsInstall = platform === "ios";
  const items: [string, boolean, boolean][] = [
    [d.progress.homeScreen, installed, needsInstall],
    [d.progress.signedIn, signedIn, true],
    [d.progress.on, on, true],
  ];
  const visible = items.filter(([, , show]) => show);
  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      {visible.map(([label, done]) => (
        <span key={label} className="check-row"><span className="check-dot" data-on={done}>{done ? "✓" : ""}</span><span className={done ? "text-ink" : "text-ink-3"}>{label}</span></span>
      ))}
      {status === "denied" && <span className="text-bad">{fill(d.progress.blocked, { n: needsInstall ? 6 : platform === "android" ? 4 : 1 })}</span>}
    </div>
  );
}

function StepAction({ kind, p, d, home }: { kind: "notify" | "install"; p: PushState; d: T; home: string }) {
  const a = d.action;
  if (kind === "install") {
    if (!p.canInstall) return null;
    return <button type="button" className="btn btn-primary mt-4 w-full" disabled={p.busy} onClick={() => void p.install()}>{a.install}</button>;
  }
  if (p.status === "on") return <div className="mt-4 rounded-2xl bg-accent/12 px-4 py-3 text-sm text-accent">{a.on}{" "}<button type="button" className="underline" disabled={p.busy} onClick={() => void p.sendTest()}>{a.sendTest}</button></div>;
  if (p.status === "needs-install") return <div className="mt-4 rounded-2xl bg-ink/4 px-4 py-3 text-sm text-ink-3">{a.needsInstall}</div>;
  if (p.status === "needs-signin") return <a href={`${home}?signin=1&next=${encodeURIComponent("/install")}`} className="btn btn-primary mt-4 w-full">{a.signInFirst}</a>;
  if (p.status === "ready" && p.signedIn === false) return <a href={`${home}?signin=1&next=${encodeURIComponent("/install")}`} className="btn btn-primary mt-4 w-full">{a.signInThenOn}</a>;
  if (p.status === "ready") return <button type="button" className="btn btn-primary mt-4 w-full" disabled={p.busy} onClick={() => void p.turnOn()}>{p.busy && <span className="spinner" />}{a.turnOn}</button>;
  if (p.status === "denied") return <div className="mt-4 rounded-2xl bg-bad/10 px-4 py-3 text-sm text-bad">{a.denied}</div>;
  return null;
}

/** One step: the dictionary's title and text (text may carry **bold**), its illustration and live control. */
const step = (s: { title: string; text: string }, art: React.ReactNode, action?: Step["action"]): Step => ({ title: s.title, text: <B text={s.text} />, art, ...(action ? { action } : {}) });

const STEPS: Record<Tab, (p: PushState, d: T) => Step[]> = {
  ios: (_p, { steps: { ios: s }, mocks: t }) => [
    step(s.safari, <SafariUrlMock />),
    step(s.share, <SafariShareMock t={t} />),
    step(s.choose, <ShareSheetMock t={t} />),
    step(s.add, <AddDialogMock t={t} />),
    step(s.open, <HomeScreenMock />),
    step(s.allow, <IosPermissionMock t={t} />, "notify"),
  ],
  android: (p, { steps: { android: s }, mocks: t }) => [
    step(s.chrome, <ChromeMenuMock t={t} />),
    step(p.canInstall ? s.install : s.menu, <ChromeInstallMock t={t} />, "install"),
    step(s.open, <HomeScreenMock />),
    step(s.allow, <AndroidPermissionMock t={t} />, "notify"),
  ],
  desktop: (_p, { steps: { desktop: s }, mocks: t }) => [
    step(s.allow, <DesktopPermissionMock t={t} />, "notify"),
    step(s.install, <DesktopInstallMock t={t} />, "install"),
    step(s.phone, <HomeScreenMock />),
  ],
};
