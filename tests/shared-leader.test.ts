import { describe, expect, it, vi } from "vitest";
import { SharedInventoryLeader, sharedLeaderTarget, type LeaderConnection, type LeaderStatus } from "@/lib/stock/shared-leader";
const leader = (host="linode-1", epoch=2): LeaderStatus => ({using:host==="linode-1"?"primary":"standby",writable:true,
  probes:[{name:host==="linode-1"?"primary":"standby",ok:true,ms:1,recovery:false,host,owner:host,epoch}]});
function fixture(status: LeaderStatus | null=leader()) {
  let current=status; let fail:()=>void=()=>{};
  const end=vi.fn(async()=>undefined);
  const query=vi.fn(async(text:string) => ({rows: text.includes("current_schema")?[{schema:"shelfspring",role:"shelfspring_poller",recovery:false}]
    :text.includes("pg_try_advisory_lock")?[{acquired:true}]:[{recovery:false}]}));
  const connection:LeaderConnection={query,end,onError:listener=>{fail=listener;}};
  const connect=vi.fn(async()=>connection);
  const read=vi.fn(async()=>current);
  const lock=new SharedInventoryLeader({HOST_LABEL:"linode-1"},{status:read,connect});
  return {lock,end,query,connect,read,set:(value:LeaderStatus|null)=>{current=value;},fail:()=>fail()};
}
describe("private shared-feed leader ownership",()=>{
  it("leaves followers, unknown authority, and read-only databases entirely idle",async()=>{
    for(const status of [null,leader("linode-2"),{...leader(),writable:false},{...leader(),probes:[{...leader().probes[0],owner:null}]}]) {
      const f=fixture(status); expect(await f.lock.check()).toEqual({leader:false,acquired:false}); expect(f.connect).not.toHaveBeenCalled();
    }
    expect(sharedLeaderTarget(leader(),"unknown-host")).toBeNull();
  });
  it("marks acquisition only once and releases when another host becomes authoritative before dispatch",async()=>{
    const f=fixture(); expect(await f.lock.check()).toEqual({leader:true,acquired:true});
    expect(await f.lock.check()).toEqual({leader:true,acquired:false});
    f.set(leader("linode-2",3));expect(await f.lock.check()).toEqual({leader:false,acquired:false});expect(f.end).toHaveBeenCalledOnce();
  });
  it("does not initialize claims when a healthy worker already owns the session lock",async()=>{
    const f=fixture(); f.query.mockImplementation(async(text)=>({rows:text.includes("current_schema")?[{schema:"shelfspring",role:"shelfspring_poller",recovery:false}]:[{acquired:false}]}));
    expect(await f.lock.check()).toEqual({leader:false,acquired:false}); expect(f.end).toHaveBeenCalledOnce();
  });
  it("rechecks authority after lock acquisition and drops ownership on a connection loss",async()=>{
    const f=fixture();f.read.mockResolvedValueOnce(leader()).mockResolvedValueOnce(leader("linode-2",3));
    expect(await f.lock.check()).toEqual({leader:false,acquired:false});expect(f.end).toHaveBeenCalledOnce();
    expect(await f.lock.check()).toEqual({leader:true,acquired:true});f.fail();
    f.set(null);expect(await f.lock.check()).toEqual({leader:false,acquired:false});expect(f.end).toHaveBeenCalledTimes(2);
  });
  it("never reacquires during the post-claim check or an error-reporting fence", async () => {
    const f = fixture();
    expect(await f.lock.check(false)).toEqual({ leader: false, acquired: false }); expect(f.connect).not.toHaveBeenCalled();
    expect(await f.lock.check()).toEqual({ leader: true, acquired: true });
    f.fail();
    expect(await f.lock.check(false)).toEqual({ leader: false, acquired: false }); expect(f.connect).toHaveBeenCalledOnce();
    expect(await f.lock.check()).toEqual({ leader: true, acquired: true });
  });

});
