import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fieldNarrative } from "@/components/seo/FieldGuideNarrative";
import { STORES } from "@/lib/apple/catalog";
import type { StoreStockSummary } from "@/lib/stock/queries";
import type { Lang } from "@/lib/i18n/locales";

const locale=vi.hoisted(()=>({lang:"en" as Lang}));
vi.mock("@/lib/i18n/server",()=>({pageLocale:()=>locale}));
vi.mock("@/components/ui/PendingLink",()=>({PendingLink:({children,href,...props}:Record<string,unknown>)=>createElement("a",{...props,href},children as never)}));
import { FieldCoverage, FieldIntro, FieldMethod, fieldCoverage, fieldGuideCopy, fieldGuideQuestions } from "@/components/seo/FieldGuide";

const stores=STORES.slice(0,3);
function row(storeNumber:string, at:Date|null, available:number):StoreStockSummary {
  return {storeNumber,lastCheckedAt:at,perModel:{duo:{available,total:8,parts:[]},"18-pro":{available:0,total:8,parts:[]},"18-pro-max":{available:0,total:8,parts:[]}}};
}

describe("field-guide observation evidence",()=>{
  beforeEach(()=>{locale.lang="en";});
  it("keeps missing and invalid observations unknown instead of reporting sold out",()=>{
    const stock=new Map([[stores[0].storeNumber,row(stores[0].storeNumber,null,5)],[stores[1].storeNumber,row(stores[1].storeNumber,new Date("invalid"),7)]]);
    const result=fieldCoverage(stores,stock);
    expect(result.observed).toBe(0);expect(result.available).toBeNull();expect(result.oldest).toBeNull();
    const html=renderToStaticMarkup(createElement(FieldCoverage,{stores,stock}));
    expect(html).toContain("Not observed");expect(html).toContain("—");expect(html).not.toContain("Sold out");
  });
  it("shows the actual partial coverage and sums configurations only for observed stores",()=>{
    const stock=new Map([[stores[0].storeNumber,row(stores[0].storeNumber,new Date("2026-11-06T23:00:00Z"),2)],[stores[1].storeNumber,row(stores[1].storeNumber,null,8)],[stores[2].storeNumber,row(stores[2].storeNumber,new Date("2026-11-06T22:59:30Z"),3)]]);
    const result=fieldCoverage(stores,stock);
    expect(result).toMatchObject({total:3,observed:2,available:5,oldest:"2026-11-06T22:59:30.000Z",newest:"2026-11-06T23:00:00.000Z"});
    expect(result.rows[1].available).toBeNull();
    expect(stock.get(stores[1].storeNumber)?.perModel.duo.available).toBe(8);
  });
  it("distinguishes a genuine observed zero from an empty data source",()=>{
    expect(fieldCoverage(stores,new Map()).available).toBeNull();
    expect(fieldCoverage(stores,new Map([[stores[0].storeNumber,row(stores[0].storeNumber,new Date("2026-11-06T23:00:00Z"),0)]])).available).toBe(0);
  });
  it("excludes summaries for stores outside the page scope",()=>{
    const extra=row("R999",new Date("2026-11-06T23:00:00Z"),999);
    expect(fieldCoverage(stores,new Map([["R999",extra]])).available).toBeNull();
  });
  it("renders both full dates when an observation interval crosses midnight",()=>{
    const stock=new Map([[stores[0].storeNumber,row(stores[0].storeNumber,new Date("2026-11-05T23:59:00Z"),1)],[stores[1].storeNumber,row(stores[1].storeNumber,new Date("2026-11-06T00:01:00Z"),1)]]);
    const html=renderToStaticMarkup(createElement(FieldCoverage,{stores,stock}));
    expect(html).toContain('dateTime="2026-11-05T23:59:00.000Z"');expect(html).toContain('dateTime="2026-11-06T00:01:00.000Z"');expect(html).toContain("UTC");
  });
  it.each(["en","ja","ko","zh-TW","zh-HK","de","de-CH","fr","fr-CA","it","es","nl","sv","ar"] as Lang[])("renders localized methodology and safe empty evidence for %s",lang=>{
    locale.lang=lang;
    const words=fieldGuideCopy(lang);
    const html=renderToStaticMarkup(createElement("div",null,createElement(FieldIntro,{title:"Store fixture"}),createElement(FieldMethod),createElement(FieldCoverage,{stores,stock:new Map()})));
    expect(html).toContain(words.coverage);expect(html).toContain(words.unknown);expect(html.match(/<h1\b/g)).toHaveLength(1);
    if(lang!=="en")expect(words.methodBody).not.toEqual(fieldGuideCopy("en").methodBody);
    const narrative=fieldNarrative(lang);
    const questions=fieldGuideQuestions({lang,place:"Fixture Place",stores:3,kind:"city",model:"iPhone Duo"});
    expect(questions).toHaveLength(4);
    expect(questions.every(x=>x.q.includes("Fixture Place")&&x.a.trim().length>0)).toBe(true);
    expect(questions.map(x=>x.a).join(" ")).not.toMatch(/\{(?:n|model)\}/);
    expect(questions[1].q+questions[1].a).toContain("iPhone Duo");
    if(lang!=="en") {
      expect(narrative.study).not.toEqual(fieldNarrative("en").study);
      expect(questions[0].q).not.toContain("What does");
      for(const key of ["configuration","places","hours","days","duration"] as const) expect(narrative[key]).not.toEqual(fieldNarrative("en")[key]);
    }
  });
});
