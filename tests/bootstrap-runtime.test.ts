import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { expect, it } from "vitest";

it("runs the real bootstrap gate command from its release even when SSH starts in a different directory", () => {
  const directory = realpathSync(mkdtempSync(join(tmpdir(), "bootstrap-runtime-")));
  try {
    const release = join(directory, "release with spaces"), root = join(directory, "service root");
    mkdirSync(join(release, "scripts/runtime"), { recursive: true });
    mkdirSync(root);
    symlinkSync(resolve("node_modules"), join(release, "node_modules"), "dir");
    writeFileSync(join(release, "package.json"), '{"type":"module"}');
    writeFileSync(join(root, "poller.env"), 'BOOTSTRAP_FIXTURE="1"\n');
    writeFileSync(join(release, "scripts/runtime/source-sync-gate.ts"), `
      const expected: string | undefined = process.env.release;
      if (process.cwd() !== expected || process.env.BOOTSTRAP_FIXTURE !== "1") throw new Error("Wrong bootstrap runtime context");
      console.log("Fixture gate loaded from release");
    `);
    const line = readFileSync("infra/linode/provision.sh", "utf8").split("\n")
      .find((value) => value.includes("--import tsx") && value.includes("scripts/runtime/source-sync-gate.ts"));
    expect(line).toBeDefined();
    const command = line!.replace("/usr/local/bin/node", '"$TEST_NODE_BINARY"');
    const output = execFileSync("bash", ["-c", `set -euo pipefail\n${command}`], {
      cwd: directory, encoding: "utf8", env: { NODE_ENV: "test", PATH: process.env.PATH, TEST_NODE_BINARY: process.execPath, release, root },
    });
    expect(output.trim()).toBe("Fixture gate loaded from release");
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
