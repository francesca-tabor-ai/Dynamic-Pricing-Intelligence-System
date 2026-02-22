# DPIS Project TODO

## Phase 1: Initialize & Design System
- [x] Project scaffold, database schema, design system

## Phase 2: Backend - Core Procedures
- [x] Product CRUD, competitor tracking, pricing history, demand data
- [x] Optimization engine, demand forecasting, agent pipeline, Vitest tests

## Phase 3–4: Frontend
- [x] Dashboard, Products, Recommendations, Pipeline, Analytics, auth, charts

## Phase 5: Integration & Polish
- [x] E2E testing of all flows (Playwright, home + auth-guard flows)
- [x] UI refinement: empty states (Products, Analytics), consistent Empty component
- [x] Loading states: table skeleton (Products), Suspense fallback for lazy routes
- [x] Error handling: query error states + retry (Products), error messages (Recommendations, Analytics)
- [x] Performance: lazy-loaded dashboard routes (Products, Recommendations, Pipeline, Analytics)
- [x] Vite config ESM fix (__dirname), analytics script optional (no malformed URI in dev)

## Phase 6: Delivery
- [x] Final checkpoint: `npm run check` and `npm run build` pass
- [x] Delivery: codebase ready for handoff

## Run commands
- `npm run dev` — start app (set `OAUTH_SERVER_URL` for login)
- `npm run test` — unit tests (Vitest)
- `npm run test:e2e` — E2E tests (Playwright; starts server automatically; set `PORT=3000` if needed)
- `npm run build` && `npm run start` — production
