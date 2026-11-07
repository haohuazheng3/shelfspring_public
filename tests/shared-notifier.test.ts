import { afterEach, describe, expect, it, vi } from "vitest";
const state=vi.hoisted(()=>({update:vi.fn()}));
vi.mock("@/lib/db",async()=>({schema:await import("@/lib/db/schema"),db:()=>({
  select:()=>({from:()=>({innerJoin:()=>({where:async()=>[]})})}),
  update:()=>{state.update();return {set:()=>({where:async()=>undefined})};},
})}));
import { notifyRestocks } from "@/lib/stock/notify";
afterEach(()=>{vi.unstubAllEnvs();vi.clearAllMocks();});
describe("shared inventory notifier ownership",()=>{
  it("uses its private matching flow but never stamps the original inventory event",async()=>{
    vi.stubEnv("INVENTORY_FEED_MODE","shared");vi.stubEnv("VERCEL_ENV","production");vi.stubEnv("PREVIEW_INVENTORY_MODE","0");
    const transitions=[{storeNumber:"R001",partNumber:"TEST/A",kind:"restock" as const,quote:null,at:new Date(),firstSeen:false}];
    expect(await notifyRestocks(transitions,[100])).toEqual({matched:0,sent:0,failed:0,skipped:0});expect(state.update).not.toHaveBeenCalled();
    vi.stubEnv("INVENTORY_FEED_MODE","source");await notifyRestocks(transitions,[100]);expect(state.update).toHaveBeenCalledOnce();
  });
});
