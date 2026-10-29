# PALMAPP Local Backend (Prototype)

**Status:** standalone local SQLite REST API; **not yet integrated with the PALMAPP React frontend**. Designed for a single trusted local computer, not production internet deployment.

## Prerequisites

- Node.js **22+** (uses built-in `node:sqlite`; this API is experimental in Node 22)
- No third-party runtime packages or cloud database required

## Start and test

```bash
cd local-backend
npm test
npm start
```

The service listens on **127.0.0.1:3001**, not publicly accessible interfaces. Its health endpoint is `http://127.0.0.1:3001/api/local/health`.

Data is stored in `local-backend/data/palmapp.sqlite`, created automatically at first use and intentionally excluded from Git. Change the path with `PALM_DB` and the port with `PORT`. Auth configuration lives in `data/auth.json`, also excluded from Git; customize with `PALM_AUTH_FILE`.

## First-time local password setup (PowerShell)

Start the server, then:

```powershell
$body = @{ password = 'REPLACE-WITH-A-STRONG-PRIVATE-PASSWORD' } | ConvertTo-Json
Invoke-RestMethod http://127.0.0.1:3001/api/local/auth/setup -Method Post -ContentType application/json -Body $body
```

Use POST `/api/local/auth/login` with JSON `{ "password": "..." }` to obtain a secure-for-local-development HttpOnly cookie. Subsequent browser fetches should use `credentials: 'include'`. Sessions expire in 8 hours or on server restart.

For a frontend running at a different development port, route backend requests through the Vite same-origin proxy:

```ts
// In vite.config.ts, inside server:
proxy: {
  '/api/local': { target: 'http://127.0.0.1:3001', changeOrigin: true }
}
```

## REST routes

- `GET /api/local/health` public health probe
- `GET /api/local/auth/setup-status`
- `POST /api/local/auth/setup`, `POST /api/local/auth/login`, `POST /api/local/auth/logout`
- `GET /api/local/snapshot`: all operational modules
- `GET /api/local/inventory`: incoming, outgoing and available stock
- `GET /api/local/audit`: mutation history (optional query `limit`)
- `GET /api/local/backup`: JSON export, **not** a verified disaster-recovery restore procedure
- `GET /api/local/{module}`, `GET /api/local/{module}/{id}`
- `POST /api/local/{module}`, `PATCH /api/local/{module}/{id}`, `DELETE /api/local/{module}/{id}`
- `POST /api/local/purchases/{id}/pay`: `{ "status": "Paid" }` or `{ "status": "Partially Paid" }`
- `POST /api/local/purchases/{id}/cancel`: `{ "reason": "..." }`

Supported modules: `suppliers`, `farmers`, `vehicles`, `drivers`, `mills`, `employees`, `purchases`, `shipments`, and `expenses`. Direct deletion of purchase and shipment transactions is blocked. The backend recalculates purchase net weight, money totals and available stock, with SQLite transactions for writes.

## UI integration — pending

The existing frontend in `src/App.tsx` and `src/components/AppShell.tsx` still uses demo authentication and mock/localStorage state. To integrate, replace those flows with actual authentication and `/api/local/snapshot` loading. Await the result of every API mutation before updating UI, resetting forms or displaying success. Refetch/invalidate the snapshot after successful changes. Do not pretend the current offline cloud-sync simulation is a real remote sync.

The standalone backend **does not** seed `src/data/mockData.ts` into the database. The first snapshot will be empty until imported or entered through API.

## Known gaps before production use

- No per-user roles, password attempt throttling, TLS, multi-device synchronization, or audited CSRF protection beyond the local origin check for authenticated routes
- Partial payment stores only payment status, not amount, balance, or accounting journal
- No complete backup-and-restore workflow, hardware weighbridge integration, settings or notifications persistence
- Backend validation and financial business rules still require comprehensive audit
- No UI integration, browser E2E tests, server HTTP integration tests, load tests or security penetration tests yet

## Validation

Run `npm test` for the 11 Node unit tests currently committed. The provided baseline test run on Node 22.16.0 passed all 11 tests with 100% store line/function coverage and approximately 70.5% branch coverage. **This is not 100% feature coverage**.

Never expose the API port to the public internet without substantial security hardening. Do not use this prototype to settle live financial transactions until integration, reconciliation and recovery tests pass.
