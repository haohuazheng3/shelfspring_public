# ShelfSpring

ShelfSpring helps shoppers compare Apple Store pickup availability, explore restock history, and receive availability alerts.

Production shares inventory and history with an existing collection cluster while keeping each site's accounts, subscriptions and delivery records in separate database schemas. Shared-feed workers read inventory in place; independent collector deployments remain supported. The private cluster migration and administration tools are not part of this export.

## Run locally

Use Node.js 24 or newer and PostgreSQL. Install dependencies with `npm ci`, copy `.env.example` to `.env.local`, and configure the services you want to use. Authentication requires your own Clerk application; payments and notifications require your own provider accounts.

Run `npm run db:migrate` with your database connection configured, then `npm run seed` to load the store and product catalogue. Start the website with `npm run dev`. For a production build, run `npm run build` followed by `npm start`.

Run `npm test`, `npm run typecheck`, and `npm run lint` to check changes. Inventory collection and notification workers run separately from the website and require their own configuration.

## Self-hosted workers

Reusable host helpers are included in `scripts/runtime`. The Ubuntu/PostgreSQL scripts require an explicitly selected server: create `/etc/shelfspring-host-ip` as a root-owned file containing only that server's IPv4 address, with mode 600. Each host script checks its local address against this file before changing services. Keep the production and preview database roles separate. The source-feed input JSON requires your own HTTPS `SITE_URL`, `HOST_LABEL`, inventory-source connection and any notification settings you enable. Never commit that input file or generated credentials.

The mail worker has its own lockfile: run `npm ci --prefix infra/workers/mail`. Copy `wrangler.example.toml` to `wrangler.toml` in that directory and set your own application origin, verified recipient and backup bucket. In `src/index.ts` inside the worker, set the `FROM` and `OWNER` constants to your own verified addresses; the fixed recipient must match the mail binding and configuration. Set the three named secrets using Wrangler, never in that file. Configure the host probe's mail-worker URL and token, and use your own HTTPS backup URL and dedicated backup token. Provider account administration, email-routing setup, hosted deployment workflows and their account-specific routing test are intentionally excluded. Website and reusable-runtime tests are included; these scripts do not provision third-party accounts for you.

Visit https://shelfspring.com or contact contact@shelfspring.com for product support.

## License

See LICENSE for the terms of use.
