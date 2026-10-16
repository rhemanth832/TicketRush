# Validation — TicketRush Marketplace v2

Validated on 16 October 2026:

- TypeScript production compilation for the Express backend.
- Hosted Vinext/Worker build with D1 and R2 bindings declared.
- JavaScript syntax validation of the marketplace interface.
- Jest checks against the actual shared API/domain logic with an embedded SQLite implementation of the D1 storage interface, generated hosted migrations, and PGlite schema constraints.
- Interface checks through jsdom, including a full organiser registration → create/publish event with custom capacity → separate attendee registration → seat reservation → test checkout → QR retrieval → cancellation flow against the shared API.
- Gateway tests mock Razorpay HTTP responses and validate order/amount/currency/capture checks, tamper rejection and stable refund idempotency keys.

**33 local tests passed** in the verified local suite. Real PostgreSQL/Redis integration suites (including the original row-lock suite and the v2 marketplace adapter) are included in CI but were not executed here. Docker and k6 were not available. No rendered browser/screenshot QA was available. Razorpay test/live credentials were not provided, so no external merchant transaction was performed. Default checkout is explicitly labelled sandbox; sample listings always stay sandbox.
