# TicketRush

**An event ticket marketplace built around the last-seat problem.**

TicketRush gives organisers a workspace to publish events and gives attendees a place to discover experiences, reserve seats, pay, and download QR tickets. The Node.js backend combines Redis seat leases with transactional PostgreSQL inventory updates so competing requests cannot book the same seat.

[Quick start](#quick-start-in-vs-code-windows) · [Windows guide](RUNNING_WINDOWS.md) · [Concurrency](#how-booking-stays-consistent) · [Payments](#payments) · [API](#api-overview) · [Tests](#tests-and-load-testing)

> Portfolio project with working account, event, booking, and ticket flows. Checkout starts in a labelled sandbox. Razorpay integration is included; merchant credentials and end-to-end gateway testing are required before accepting actual payments. No production throughput benchmark is claimed.

## Features

| Organisers | Attendees |
| --- | --- |
| Register and sign in through the organiser portal | Register and sign in through the attendee portal |
| Create, edit, save drafts, and publish owned events | Search/filter published events by category, city, date, and price |
| Set dates, venue, address, language, age limits, and refund policy | View event information, images, tiers, and seat availability |
| Add up to six tiers with individual prices and quantities | Select up to six seats and reserve them for five minutes |
| Upload a cover and gallery images | Complete sandbox checkout or configured Razorpay checkout |
| Inspect sales totals, bookings, and attendee details | View/download signed QR tickets and resume pending orders |
| Export attendees to CSV | Cancel eligible bookings and track refund state |

Each account has one role. Create accounts with **different email addresses** to test both experiences. Permissions and event ownership are enforced by the API.

The event editor includes a title, summary, description, category, tags, language, start/end times, sales deadline, venue, street address, city, state, PIN code, ticket tiers, refund policy, and media. Dates use **IST (`Asia/Kolkata`)**. Capacity is calculated from tier quantities, up to **10,000 seats** per event. Images accept JPEG, PNG, or WebP up to **5 MB** each; a cover is required to publish.

## Tech stack

| Layer | Technology |
| --- | --- |
| API | Node.js, TypeScript, Express |
| Primary data | PostgreSQL transactions and inventory version checks |
| Coordination | Redis leases, Lua scripts, rate-limit counters, Socket.io fan-out |
| Background work | BullMQ confirmation-email jobs and transactional outbox |
| Authentication | JWT access tokens, rotating refresh tokens, PBKDF2 password hashing |
| Payments and tickets | Razorpay Standard Checkout, HMAC verification, signed QR payloads |
| Interface | HTML, CSS, JavaScript, Socket.io client |
| Quality and delivery | Jest, jsdom, PGlite, k6, Swagger, Docker Compose, GitHub Actions |

## Quick start in VS Code: Windows

**Prerequisites:** VS Code and Docker Desktop running Linux containers with a working WSL 2 backend. This Docker path does not require Node.js on your laptop. See [Docker's Windows requirements](https://docs.docker.com/desktop/setup/install/windows-install/).

1. Run in CMD:
```cmd
cd /d "%USERPROFILE%\Downloads\TicketRush-main"
notepad .env
```
Choose Yes if Notepad asks to create the file.

2. Paste these local-development settings:
```doenv
JWT_SECRET=local-only-change-this-jwt-secret-32-chars-minimum
TICKET_SECRET=local-only-change-this-ticket-secret-32-chars-minimum
ADMIN_EMAIL=admin@ticketrush.local
ADMIN_PASSWORD=TicketRushLocal2026!
POSTGRES_USER=ticketrush
POSTGRES_PASSWORD=ticketrush
POSTGRES_DB=ticketrush
CORS_ORIGIN=http://localhost:4000
PAYMENT_MODE=sandbox
```

Save the filename exactly as .env, choosing All Files as the file type. It belongs beside docker-compose.yml, where Compose reads its environment settings.

3. Close Notepad and run:
```cmd
docker compose config --quiet && docker compose up --build -d
docker compose ps -a
docker compose logs -f init-db api worker
```

Once the logs show TicketRush API listening on 4000, open:
- App: http://localhost:4000
- Swagger: http://localhost:4000/docs
- Email inbox: http://localhost:8025

           ##OR
1. Extract the current project into `Downloads\TicketRush`. Open that folder in VS Code using **File → Open Folder**.
2. Choose **Terminal → New Terminal**. Use the terminal dropdown to select **Command Prompt**. These commands use CMD syntax.
3. Start Docker Desktop and wait for its engine to run. Then run:

```cmd
cd /d "%USERPROFILE%\Downloads\TicketRush"
docker --version
docker compose version
docker info
if not exist .env copy .env.example .env
docker compose up --build -d
docker compose ps -a
docker compose logs -f api worker
```

Continue to Compose only after `docker info` succeeds. The first build starts PostgreSQL, Redis, and Mailpit, applies the schema, then starts the API and worker. `init-db` exiting with code `0` is expected. Press **Ctrl+C** to leave the log view; background containers keep running.

| Service | URL |
| --- | --- |
| TicketRush | [http://localhost:4000](http://localhost:4000) |
| Swagger | [http://localhost:4000/docs](http://localhost:4000/docs) |
| Health | [http://localhost:4000/api/health](http://localhost:4000/api/health) |
| Local email inbox | [http://localhost:8025](http://localhost:8025) |

The API serves the interface on port **4000**. A separate Live Server extension is unnecessary.

**If Docker reports a WSL error:** Compose cannot start the application until Docker's engine works. Follow [Microsoft's WSL setup](https://learn.microsoft.com/en-us/windows/wsl/install) or [the non-Docker path](RUNNING_WINDOWS.md#option-b-nodejs-without-docker). That path still needs reachable PostgreSQL and Redis servers.

### Everyday commands

Run from the project root:

```cmd
docker compose up -d
docker compose ps -a
docker compose logs -f api worker
docker compose down
```

After changing application code:

```cmd
docker compose up --build -d
```

Named volumes preserve databases and uploaded images across `docker compose down`. Adding `-v` to that command deliberately erases local data.

### Develop the API with hot reload

Use Node.js **22.13+** with PostgreSQL and Redis running separately. If Docker works, start just the infrastructure, then run Node locally:

```cmd
cd /d "%USERPROFILE%\Downloads\TicketRush"
if not exist .env copy .env.example .env
docker compose up -d postgres redis mailpit
cd backend
set "DOTENV_CONFIG_PATH=..\.env"
npm ci --ignore-scripts
npm run db:migrate
npm run dev
```

In a **second CMD terminal**, start the worker:

```cmd
cd /d "%USERPROFILE%\Downloads\TicketRush\backend"
set "DOTENV_CONFIG_PATH=..\.env"
npm run worker:dev
```

`DOTENV_CONFIG_PATH` loads the root `.env` from `backend/`. Set it in each new terminal. The v2 catalogue initializes on first API use; legacy `db:seed` is unnecessary. Run one API on port 4000: stop the Docker API before starting a local Node API.

For PostgreSQL setup without Docker, external Redis, SMTP, compiled start commands, and common errors, see **[RUNNING_WINDOWS.md](RUNNING_WINDOWS.md)**. Root framework dependencies are not needed for the Node backend.

## Try a complete booking

1. Choose **For organisers**, register, and open **Create event**.
2. Complete all four sections: details, date/venue, ticket tiers/policy, and media. Add a future date and a cover, then publish.
3. Sign out. Register an attendee using a different email address.
4. Find the event in **Discover**, select seats, and continue to reserve them for five minutes.
5. Enter ticket-holder details, accept the policy, and select **Complete test payment**. Use **Try a declined payment** to exercise failure handling.
6. Open **My tickets**, download the QR ticket, and cancel an eligible booking to inspect its status.
7. Sign in as the organiser to inspect sales and attendees. With the Node worker running, inspect the confirmation email in Mailpit.

Sample listings are illustrative and always use sandbox checkout, even when merchant keys are present. Their tickets are not valid for admission. The legacy v1 administrator account does not sign in to the marketplace; create your own organiser/attendee accounts.

## Architecture

```mermaid
flowchart TD
    Client[Browser] <-->|REST and Socket.io| API[Express API]
    API -->|Transactions and inventory| PG[(PostgreSQL)]
    API <-->|Leases and rate limits| Redis[(Redis)]
    Worker[BullMQ worker] <-->|Jobs| Redis
    Worker <-->|Outbox and delivery records| PG
    Worker -->|QR confirmation| Email[SMTP / Mailpit]
```

Payment callbacks and signed webhooks are handled by the API. In the active marketplace, BullMQ handles confirmation-email delivery after payment confirmation.

### How booking stays consistent

1. **Acquire the hold.** Redis Lua scripts coordinate seat leases with a five-minute TTL. Release checks ownership so one request cannot remove another request's lease.
2. **Check durable inventory.** PostgreSQL stores seat ownership and an inventory version. An update succeeds only when its expected version still matches.
3. **Commit together.** Booking consumes the hold, updates inventory, and inserts the pending order in one transaction. A losing version check rolls back the mutation.
4. **Handle retries.** A unique `(user_id, idempotency_key)` constraint and request fingerprint stop a retry from creating another order. Reusing a key with different input is rejected.
5. **Confirm after payment.** Tickets become available after confirmed payment. Confirmation writes an email outbox record in the same PostgreSQL transaction; the dispatcher enqueues a stable-ID BullMQ job.

The database remains the inventory authority if a Redis lease disappears. Socket.io/polling display availability; the server revalidates it when reserving. Pending paid orders retain their seats until checkout completes or is cancelled, because releasing inventory while payment is uncertain can oversell it.

Inventory is currently a versioned document per event: updates to the same event contend on that version. Horizontal scaling does not remove this contention point. Production capacity requires measured load tests.

## Payments

| Mode | Behaviour |
| --- | --- |
| Sandbox: default | Labelled test success/decline actions; no money moves or card/UPI details are collected |
| Razorpay test | Provider-hosted test checkout using merchant test credentials |
| Razorpay live | Actual checkout after merchant activation and integration testing |
| Free tickets | Confirmation without a payment provider |

To enable provider checkout for user-created events, add server credentials to `.env`:

```dotenv
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_server_only_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

Both the key ID and key secret must be present. Setting `PAYMENT_MODE` alone does not enable Razorpay in v2. Recreate the Docker API to load changed values:

```cmd
docker compose up -d --force-recreate api
```

For direct Node execution, restart the API after editing `.env`. Configure automatic capture and a publicly reachable HTTPS webhook:

```text
https://YOUR-BACKEND-DOMAIN/api/payments/webhook
```

Subscribe to `payment.captured`, `order.paid`, and `refund.processed`. The gateway cannot call a localhost webhook; local testing needs a public HTTPS endpoint.

The server creates provider orders from its stored total in **integer paise**, verifies callback HMAC against the stored provider order ID, and fetches payments to check ownership, amount, INR currency, and captured status. Webhook HMAC uses the raw request bytes. Refund retries use a stable `X-Refund-Idempotency` header; late captured payments on cancelled orders are refunded.

The app uses one platform merchant integration. Organiser settlements/payouts are not implemented. Gateway tests mock provider responses; no external merchant test/live transaction was performed in the authoring environment.

References: [Standard Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/) · [Idempotent refunds](https://github.com/razorpay/markdown-docs/blob/master/api/refunds/normal-refunds-idempotent.md)

## API overview

Swagger at `/docs` provides the request/response schemas. Protected routes use `Authorization: Bearer <accessToken>`. Prices use paise: `49900` means ₹499.

| Area | Routes |
| --- | --- |
| Authentication | `POST /api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`; `GET /api/auth/me` |
| Discovery | `GET /api/events`, `/api/events/:id`, `/api/events/:id/seats` |
| Event management | `POST /api/events`, `PATCH /api/events/:id`, `POST /api/uploads` |
| Seat holds | `POST /api/holds`, `DELETE /api/holds/:id?eventId=...` |
| Orders | `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id` |
| Checkout | `POST /api/payments/:orderId/checkout`, `/api/payments/:orderId/verify`, `/api/payments/:orderId/test` |
| Gateway events | `POST /api/payments/webhook` |
| Cancellation | `POST /api/orders/:orderId/cancel` |
| Tickets | `GET /api/tickets/:ticketId` |
| Organiser reporting | `GET /api/organiser/overview`, `/api/organiser/events`, `/api/organiser/events/:id/attendees` |

Send an **`Idempotency-Key` header** when creating an order. Node access tokens expire after 15 minutes. Refresh tokens rotate, expire after 30 days, and are stored hashed. Logout and refresh-token-family reuse revoke sessions.

## Configuration

Copy `.env.example` for the local template. Keep `.env` and merchant secrets out of Git; local environment files are ignored.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Direct Node PostgreSQL URL; Compose builds its internal URL from `POSTGRES_*` |
| `REDIS_URL` | Direct Node Redis TCP/TLS URL; Compose uses its Redis service |
| `JWT_SECRET`, `TICKET_SECRET` | Separate signing secrets, at least 32 characters each |
| `PORT`, `CORS_ORIGIN` | API port and allowed interface origin; local default uses port 4000 |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM` | Email transport; Compose uses Mailpit |
| `SMTP_USER`, `SMTP_PASSWORD` | Optional authenticated SMTP credentials for direct Node execution |
| `RAZORPAY_*` | Optional merchant checkout and webhook configuration |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Required legacy settings; these do not create a v2 organiser login |

Use new passwords and signing secrets before external deployment. Uploaded user data, tokens, and runtime state must stay out of source control.

## Tests and load testing

With Node.js 22.13+ installed, run from the project root:

```cmd
cd backend
npm ci --ignore-scripts
npm run typecheck
npm run build
npm test
```

The default suite needs no running PostgreSQL/Redis. Embedded SQLite and PGlite cover API/domain/schema checks; jsdom covers interface flows. Cases include permissions, drafts, 20 last-seat contenders, repeated requests, hold ownership, uploads, refresh-token reuse, QR tickets, cancellation, declined/free checkout, gateway verification, and an organiser-to-attendee booking flow.

**Recorded validation:** 33 tests passed and 11 real-service tests were skipped in the authoring environment. See [VALIDATION.md](VALIDATION.md). Embedded database and mocked gateway tests are not production capacity measurements.

### PostgreSQL/Redis integration

Use a disposable database whose connection URL contains `_test` and an isolated Redis database. With Compose infrastructure running, create the database once from the project root:

```cmd
docker compose exec postgres createdb -U ticketrush ticketrush_test
```

From `backend/` in a separate CMD terminal:

```cmd
set "DATABASE_URL=postgresql://ticketrush:ticketrush@localhost:5432/ticketrush_test"
set "REDIS_URL=redis://localhost:6379/14"
npm run test:integration
```

These URLs assume default local credentials. The command sets `RUN_INTEGRATION=1` and runs the suites with real services. Close this terminal afterwards so test database variables do not affect development.

### k6

With k6 installed and the API running, use a disposable environment and run from the project root:

```cmd
k6 run load/race.js
k6 run load/browse.js
```

The race scenario creates a one-seat event and checks exactly one pending order and 19 conflicts from 20 contenders. It creates test accounts/events but does not charge a payment. Docker, real-service integration, and k6 execution were not available in the authoring environment.

## CI and container publishing

`.github/workflows/ci.yml` builds the backend and runs integration tests with PostgreSQL and Redis on pushes to `main` and pull requests. Tags such as `v2.0.0` also publish a Docker image to GitHub Container Registry after tests pass. This publishes an image; it does not deploy a running server. Check GitHub Actions after pushing the repository.

## Project structure

```text
public/                        Marketplace interface, QR bundle, and images
backend/src/app.ts             Express API and static interface serving
backend/src/marketplace/        Shared account, event, booking, and payment logic
backend/src/market-adapter.ts   PostgreSQL, Redis, JWT, and upload adapter
backend/src/gateway.ts          Razorpay orders, verification, and refunds
backend/src/market-jobs.ts      Transactional email outbox and QR worker
backend/src/schema.sql         PostgreSQL schema and additive v2 tables
backend/src/booking.ts          Retained v1 row-lock reference implementation
backend/tests/                 API, gateway, DOM, schema, and integration tests
load/                          k6 race and discovery scenarios
.github/workflows/ci.yml        CI tests and tagged container publishing
docker-compose.yml             Local application and infrastructure services
RUNNING_WINDOWS.md             VS Code/CMD setup and troubleshooting
app/, db/, drizzle/            Alternative hosted runtime and migrations
```

The root Vinext app is an alternative hosted target. The **downloadable Node/PostgreSQL/Redis application runs from `backend/`**; Docker builds it plus `public/`, without root framework dependencies.

The hosted target shares domain logic but uses D1 atomic batches, R2 uploads, opaque access tokens, and polling. It does not run PostgreSQL, Redis, BullMQ, or the Node SMTP worker. Node uses Socket.io with Redis fan-out and five-second seat polling as a fallback; discovery refreshes every fifteen seconds.

## Current boundaries

Email delivery is at-least-once. Production operations need abandoned-checkout reconciliation, monitored failed jobs, backups, and measured capacity. Email verification, password recovery, organiser KYC, event moderation, admission check-in scanning, and organiser payouts are outside this version. Rendered browser QA was unavailable; interface checks use jsdom.

See [ASSETS.md](ASSETS.md) and [THIRD_PARTY_LICENSES.txt](THIRD_PARTY_LICENSES.txt) for attribution. No project-wide open-source license has been selected.
