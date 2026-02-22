# DPIS Reference — Product & API Guidance

Use this as guidance for product behavior, data model, API design, and UI patterns. Source: former Replit reference implementation (consolidated here).

---

## 1. Product vision (from PRD)

- **DPIS**: AI-driven pricing optimization using competitor intelligence, demand forecasting, and optimization.
- **Goals**: Maximize profit; react to competitors in <15 min; reduce manual pricing; target +5–15% margin, +3–10% revenue.
- **Agents**: Scraper → Demand Forecast → Optimization → Strategy → Price recommendation.

Full PRD: `docs/DPIS-PRD.txt`

---

## 2. Data model (reference)

- **products**: `id`, `name`, `sku`, `cost`, `currentPrice`, `inventoryLevel`, `minMargin` (prices in **cents**).
- **competitor_prices**: `productId`, `competitorName`, `price` (cents), `timestamp`.
- **pricing_recommendations**: `productId`, `recommendedPrice`, `expectedDemand`, `expectedProfit`, `confidence`, `timestamp`.

---

## 3. API contract (reference)

| Area | Method | Path | Purpose |
|------|--------|------|---------|
| Dashboard | GET | `/api/dashboard/stats` | `totalProducts`, `averageMargin`, `activeCompetitors`, `recentRecommendations` |
| Products | GET | `/api/products` | List products |
| Products | GET | `/api/products/:id` | Get one product |
| Products | POST | `/api/products` | Create product |
| Products | POST | `/api/products/:id/optimize` | Run optimization → returns recommendation |
| Products | POST | `/api/products/:id/apply-price` | Body: `{ price: number }` → update current price |
| Competitors | GET | `/api/products/:productId/competitor-prices` | List competitor prices |
| Competitors | POST | `/api/products/:productId/competitor-prices` | Body: `{ competitorName, price }` |
| Recommendations | GET | `/api/products/:productId/recommendations` | List recommendations |

---

## 4. Backend patterns

- **Optimization**: Enforce `minPrice = cost * (1 + minMargin/100)`; grid search or solver over price; demand model `demand = f(price, competitorPrice)`; optional undercut strategy; persist and return recommendation.
- **Validation**: Validate body/params; 400 with `message` (and optional `field`) for validation errors; 404 for missing resources.

---

## 5. Key UI behaviors

- **Dashboard**: Stats (total products, average margin, active competitors, recent optimizations); link to product catalog.
- **Product list**: Table/list of products; link to product detail.
- **Product detail**: Current price, cost, margin %, inventory; chart (current vs competitors); competitor table with “Add Competitor”; **Optimization** (run → show recommended price, confidence, projected demand/profit → “Apply Recommended Price”); parameters (min margin, strategy).

Use `Manus/` as the primary implementation reference for this repo; use this doc and the PRD for product and API alignment.
