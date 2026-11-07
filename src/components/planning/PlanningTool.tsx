"use client";
import { useState } from "react";
import { numericInput, pickupNextStep, ruleBudget, tripBudget } from "@/lib/planning/calculators";
import type { PlanningGuide } from "@/content/planning/guides";
import styles from "./styles";

type Capacity = { name: string; limit: number };
const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

function NumberField({ label, value, set, max, integer = false }: { label: string; value: string; set: (v: string) => void; max: number; integer?: boolean }) {
  const valid = numericInput(value, max, integer) !== null;
  return <label className={styles.field}>{label}<input type="number" min="0" max={max} step={integer ? 1 : "any"} value={value} onChange={(e) => set(e.target.value)} aria-invalid={!valid} />
    {!valid && <span className={styles.inputError}>Enter {integer ? "a whole number" : "a number"} from 0 to {max.toLocaleString("en-US")}.</span>}</label>;
}

export function PlanningTool({ kind, capacities }: { kind: PlanningGuide["tool"]; capacities: Capacity[] }) {
  const [stores, setStores] = useState("3");
  const [configurations, setConfigurations] = useState("2");
  const [colors, setColors] = useState("2");
  const [sizes, setSizes] = useState("2");
  const [distance, setDistance] = useState("80");
  const [rate, setRate] = useState("0.50");
  const [fixed, setFixed] = useState("10");
  const [minutes, setMinutes] = useState("180");
  const [hourly, setHourly] = useState("0");
  const [ready, setReady] = useState(false);
  const [canCollect, setCanCollect] = useState(true);
  const [deliveryFits, setDeliveryFits] = useState(true);
  const storeCount = numericInput(stores, 500, true);
  const configCount = numericInput(configurations, 100, true);
  const colorCount = numericInput(colors, 20, true);
  const sizeCount = numericInput(sizes, 20, true);
  const tripInputs = [numericInput(distance, 10000), numericInput(rate, 100), numericInput(fixed, 10000), numericInput(minutes, 10000), numericInput(hourly, 10000)];
  const trip = tripInputs.every((n): n is number => n !== null) ? tripBudget(tripInputs[0], tripInputs[1], tripInputs[2], tripInputs[3], tripInputs[4]) : null;
  return <section id="worksheet" className={styles.tool} aria-labelledby="worksheet-title">
    <p className={styles.eyebrow}>Your working page</p>
    <h2 id="worksheet-title">{({ delivery: "Choose the next sensible step", stores: "Budget your watch list", configuration: "Count acceptable combinations", travel: "Put a number on the journey" })[kind]}</h2>
    <p>Try your own inputs. This worksheet stays in your browser and does not save selections or change orders.</p>
    {kind === "delivery" ? <>
      <div className={styles.checks}>
        <label><input type="checkbox" checked={ready} onChange={(e) => setReady(e.target.checked)} /> Apple has said my pickup order is ready.</label>
        <label><input type="checkbox" checked={canCollect} onChange={(e) => setCanCollect(e.target.checked)} /> I can make the collection trip and window.</label>
        <label><input type="checkbox" checked={deliveryFits} onChange={(e) => setDeliveryFits(e.target.checked)} /> The current delivery estimate fits my deadline.</label>
      </div><output className={styles.result} aria-live="polite">{pickupNextStep(ready, canCollect, deliveryFits)}</output>
      <p className={styles.note}>Based on your answers, not live order information. A delivery estimate can change.</p>
    </> : kind === "travel" ? <>
      <div className={styles.fields}>
        <NumberField label="Round-trip distance (miles)" value={distance} set={setDistance} max={10000} />
        <NumberField label="Your cost per mile (USD)" value={rate} set={setRate} max={100} />
        <NumberField label="Parking, tolls or fares (USD)" value={fixed} set={setFixed} max={10000} />
        <NumberField label="Total trip and collection time (minutes)" value={minutes} set={setMinutes} max={10000} />
        <NumberField label="Optional value of your time (USD/hour)" value={hourly} set={setHourly} max={10000} />
      </div><output className={styles.result} aria-live="polite">{trip ? <><strong>{money(trip.cash)} cash expense</strong><span>{money(trip.timeValue)} optional time value · {money(trip.combined)} combined planning cost</span></> : "Complete the valid inputs to calculate your trip."}</output>
      <p className={styles.note}>Illustrative defaults. Cash = miles × rate + fixed costs. Time value = minutes ÷ 60 × hourly value. No traffic, tax or route data is fetched.</p>
    </> : <>
      <div className={styles.fields}>
        <NumberField label="Reachable stores" value={stores} set={setStores} max={500} integer />
        {kind === "stores" ? <NumberField label="Exact acceptable configurations" value={configurations} set={setConfigurations} max={100} integer /> : <>
          <NumberField label="Acceptable colors for one model" value={colors} set={setColors} max={20} integer />
          <NumberField label="Acceptable storage capacities" value={sizes} set={setSizes} max={20} integer />
        </>}
      </div>
      {(() => {
        const count = kind === "stores" ? configCount : colorCount !== null && sizeCount !== null ? colorCount * sizeCount : null;
        if (count === null || storeCount === null) return <output className={styles.result} aria-live="polite">Complete the valid inputs to calculate coverage.</output>;
        return <><output className={styles.result} aria-live="polite"><strong>{storeCount * count} alert rules</strong><span>{storeCount} stores × {count} exact configurations{kind === "configuration" ? ` (${colorCount} colors × ${sizeCount} capacities)` : ""}</span></output>
          <ul className={styles.capacity}>{capacities.map((p) => { const budget = ruleBudget(storeCount, count, p.limit); return <li key={p.name}><strong>{p.name} · {p.limit} rules</strong><span>{budget.fits ? "This hypothetical list fits" : `${budget.over} rules over capacity`}</span></li>; })}</ul>
          <p className={styles.note}>{kind === "configuration" ? "Assumes every color/capacity combination is acceptable and offered for your model. Count exceptions individually." : "Assumes every configuration at every selected store. Your account may use a smaller, selective set of pairs."} This does not activate any alerts.</p></>;
      })()}
    </>}
    <noscript><p>Enable JavaScript to change this worksheet. The article and example calculation remain readable without it.</p></noscript>
  </section>;
}
