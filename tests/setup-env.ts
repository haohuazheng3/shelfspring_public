/**
 * Tests run the same with or without a deployment's environment. `vercel build` runs `npm test` with the project's
 * production variables in process.env (shared-cluster mode, feed mode, database URLs), which switched code paths
 * under test and failed every deploy from 2026-11-09 on. Each test that needs one of these sets it itself.
 */
for (const key of Object.keys(process.env)) {
  if (/^(DATABASE_|INVENTORY_|PREVIEW_INVENTORY_MODE$|POLLER_|FASTLANE_|HOST_LABEL$)/.test(key)) delete process.env[key];
}
