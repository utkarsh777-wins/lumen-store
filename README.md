# Lumen

Lumen is a small-batch home store: ceramics, textiles, lighting, fragrance, and bath. The shop covers browsing, a persistent bag and wishlist, guest checkout, accounts, and an admin desk. Prices and stock are decided on the server.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4
- Prisma 6 with SQLite (`prisma/dev.db`)
- Zod for checkout and account input
- JWT sessions (`jose`) and `bcryptjs` passwords
- Vitest for cart, pricing, and checkout rules
- Stripe test mode when both API keys are set; otherwise a labeled demo card

Catalog reads use the Next.js cache (`use cache`, tag `catalog`, one-minute revalidation). Cart, account, and admin reads stay inside Suspense because they depend on cookies.

## Requirements

- Node.js 20.9 or newer (22 works)
- npm 10

## Setup

```bash
npm install
npm run setup
npm run dev
```

`npm install` copies `.env.example` to `.env` when `.env` is missing and generates the Prisma client. `npm run setup` creates the SQLite file and loads the sample catalog. Open [http://localhost:3000](http://localhost:3000).

To start over:

```bash
npm run db:reset
```

## Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLite URL. `file:./dev.db` is resolved next to `prisma/schema.prisma`, so the file is `prisma/dev.db`. |
| `AUTH_SECRET` | Signs the session cookie. The sample value is for local development only. The app refuses to boot in production without a real secret. |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, Open Graph tags, and the sitemap. |
| `STRIPE_SECRET_KEY` | Optional. Stripe secret key (`sk_test_...`). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional. Stripe publishable key (`pk_test_...`). |
| `STRIPE_WEBHOOK_SECRET` | Unused. Checkout confirms the PaymentIntent on the server before it writes the order, so a webhook is not required. |

Leave both Stripe keys empty to use the demo payment. Checkout shows a banner that no charge will be made.

Demo cards:

- `4242 4242 4242 4242` succeeds with any future `MM/YY` expiry and a 3–4 digit CVC
- `4000 0000 0000 0002` is a Luhn-valid decline
- Any other Luhn-valid, unexpired number also succeeds

When both Stripe keys are present, the payment step uses Stripe Elements. The PaymentIntent amount must match the server quote in USD and the status must be `succeeded`.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@lumen.studio` | `lumen-admin` |
| Customer | `jonah@example.com` | `lumen-guest` |

Jonah has a Portland address, a wishlist item, and orders `LM-1001` (delivered) and `LM-1008` (shipped). The seed also includes orders for other shoppers so the admin desk has a mix of paid, fulfilled, shipped, delivered, and cancelled states.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | `prisma generate` and a production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest once |
| `npm run test:watch` | Vitest watch mode |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:push` | Push the schema to SQLite |
| `npm run db:seed` | Load the sample catalog (replaces existing rows) |
| `npm run db:reset` | Drop the schema, push, and seed |
| `npm run setup` | Create `.env` if needed, generate, push, and seed |

## Catalog

The seed writes five categories and 34 products (about 63 variants) with local photographs in `public/media/`. Listing price is the lowest variant price. A few pieces are intentionally scarce: the incense dish is sold out, and the hearth mug’s Ink color is sold out.

Photography is from Unsplash and stored in the repo so the shop runs offline. See the footer for the credit.

## Shopping rules

- Standard shipping is $8 and free on merchandise of $75 or more. Express is $18. Overnight is $32.
- Tax is 8% of the merchandise subtotal. Shipping is not taxed.
- Checkout ignores client prices and recomputes the quote from current variant prices.
- Stock drops inside the order transaction. A cancelled order returns stock. Moving a cancelled order back to an active status takes the stock again.
- Guest carts live in the `lumen_cart` cookie. Signing in merges that cart and the guest wishlist into the account.
- Order confirmation is available to the buyer, an admin, or anyone holding the unguessable token from the confirmation URL. The token is also stored in an httpOnly cookie for a day.

## Architecture

```
src/app/(store)     shop, bag, checkout, account
src/app/admin       role-gated desk
src/actions         server actions (cart, checkout, auth, admin)
src/lib             domain rules, Prisma, sessions, cached catalog
src/proxy.ts        session gate for /account and /admin
prisma              schema, seed, and the SQLite file
```

Request flow:

1. `src/proxy.ts` checks the `lumen_session` cookie on `/account/*` and `/admin/*`. Customers who are signed out go to the login page. Anyone who is not an admin is sent home from `/admin`.
2. Storefront pages read the catalog through `src/lib/catalog.ts`. Mutations call `updateTag("catalog")`.
3. `src/lib/pricing.ts`, `src/lib/cart-math.ts`, and `src/lib/payments.ts` are pure and covered by `src/lib/domain.test.ts`.
4. `placeOrder` validates the address and payment, decrements stock with a conditional update, and writes an `LM-` order number.

Admin can create and edit products and categories, adjust inventory, and move orders through Paid, Fulfilled, Shipped, Delivered, and Cancelled. The overview shows paid revenue, average order value, a seven-day chart, low stock, and recent orders.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Deploy

SQLite keeps local setup free of extra services. The database file has to live on a disk that survives restarts, so this build fits a single Node process better than a stateless serverless function.

On a VM or a container with a persistent volume:

1. Set `AUTH_SECRET` to a long random string and `NEXT_PUBLIC_SITE_URL` to the public origin.
2. Point `DATABASE_URL` at a path on the volume, for example `file:/data/lumen.db`.
3. Install, generate, and migrate:

```bash
npm ci
npx prisma generate
npx prisma db push
npm run build
npm start
```

4. Seed once if you want the sample catalog: `npm run db:seed`. Seeding deletes existing catalog, cart, and order rows.
5. Put the process behind HTTPS. The session, cart, and order-access cookies are `Secure` when `NODE_ENV` is `production`.

Stripe, if you use it, stays in test mode until you swap in live keys. Add the live keys only on the host, never in git.

A Postgres (or other Prisma-supported) database is the usual next step for more than one app instance. Change the datasource provider, set `DATABASE_URL`, and run `prisma db push` against that database. The application code talks to Prisma and does not depend on SQLite-specific queries beyond case-sensitive `contains` filters, which behave differently on Postgres (`mode: "insensitive"` is available there).

## Project layout notes

- Dark mode follows the system theme and can be toggled from the header. The choice is stored by `next-themes`.
- `/sitemap.xml` lists the home page, shop, collections, products, and the static stories. `/robots.txt` asks crawlers to skip account, admin, bag, wishlist, and checkout.
- Product and collection routes are prerendered from the catalog. Pages that read cookies render their dynamic sections inside Suspense.

## License

Lumen Store is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).

Copyright © 2026 Utkarsh Kumar. 

This project is a full-stack e-commerce application currently intended for development, demonstration, and educational purposes. It is not an operational commercial storefront.

Third-party libraries, dependencies, and assets remain subject to their respective licenses.

See the [LICENSE](LICENSE) file for full licensing terms.
