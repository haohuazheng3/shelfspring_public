import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { expect, it } from "vitest";

it("requires self-host configuration and retains private adapter scope and preview role guards", () => {
  const program = String.raw`
import importlib.util,json,pathlib,sys,tempfile
root=pathlib.Path(sys.argv[1])
def load(relative):
    spec=importlib.util.spec_from_file_location('helper',root/relative)
    mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);return mod
generic=load('scripts/runtime/write-source-env.py')
preview=load('scripts/runtime/write-preview-env.py')
with tempfile.TemporaryDirectory() as directory:
    work=pathlib.Path(directory);inputs=work/'inputs.json';output=work/'feed.env'
    (work/'poller-local.url').write_text('postgres://u:p@db.example.test/app')
    inputs.write_text('{}')
    try:generic.write_env(inputs,output,'a'*40,str(work));raise AssertionError('missing site permitted')
    except ValueError:pass
    assert not output.exists()
    inputs.write_text(json.dumps({'SITE_URL':'https://shop.example.test','HOST_LABEL':'inventory-test'}))
    generic.write_env(inputs,output,'a'*40,str(work))
    values={k:json.loads(v) for k,v in (line.split('=',1) for line in output.read_text().splitlines())}
    assert values['SITE_URL']=='https://shop.example.test' and values['HOST_LABEL']=='inventory-test'
    assert values['INVENTORY_SOURCE_KEY']=='inventory-source' and output.stat().st_mode&0o777==0o600
    private=root/'scripts'/'ops'/'write-source-env.py'
    if private.is_file():
        adapter=load(str(private.relative_to(root)))
        try:adapter.write_env(inputs,output,'a'*40,str(work));raise AssertionError('private scope override permitted')
        except ValueError:pass
        output.unlink();inputs.write_text('{}');adapter.write_env(inputs,output,'a'*40,str(work))
        values={k:json.loads(v) for k,v in (line.split('=',1) for line in output.read_text().splitlines())}
        assert values['SITE_URL']=='https://shelfspring.com' and values['HOST_LABEL']=='shelfspring-db'
        assert values['INVENTORY_SOURCE_KEY']=='pickupchecker'
    (work/'shelfspring_preview-local.url').write_text('postgres://u:p@db.example.test/app')
    (work/'shelfspring_inventory_reader.pw').write_text('a'*40)
    try:preview.write_preview_env(output,'a'*40,str(work));raise AssertionError('remote preview permitted')
    except ValueError:pass
print('runtime configuration and private boundaries verified')
`;
  expect(execFileSync("python3", ["-I", "-c", program, resolve(".")], { encoding: "utf8" }).trim())
    .toBe("runtime configuration and private boundaries verified");
});
