<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Dynamic Pricing Intelligence System

**AI-powered pricing that maximizes margin and keeps you ahead of the market.**

View this app in AI Studio: [Open in AI Studio](https://ai.studio/apps/e54059ab-ad45-4369-9942-7ce5ad678e1d)

---

## Turn price into your competitive advantage

Dynamic Pricing Intelligence System (DPIS) is an AI-driven platform that continuously optimizes your product prices using **competitor intelligence**, **demand forecasting**, and **mathematical optimization**. Stop guessing—let data and AI recommend prices that protect margin, respond to the market, and grow profit.

Whether you sell across channels or manage a focused catalog, DPIS gives you one place to see how you stack up, where demand is heading, and exactly what to charge next.

---

## Why DPIS?

- **Competitor-aware** — See how your prices compare to key retailers (e.g. Amazon, Best Buy) and sync market data on demand so your strategy stays current.
- **Demand-driven** — Uses your own sales history to model how volume responds to price (elasticity) and surfaces the price that maximizes profit, not just revenue.
- **Guardrails built in** — Enforces minimum margins, optional max prices, and inventory-aware recommendations so optimization never compromises your business rules.
- **One-click application** — Review AI recommendations and apply optimal prices in a single action, with full visibility into the expected profit impact.

---

## What you get

| Capability | Description |
|------------|-------------|
| **Market overview** | Dashboard with revenue, margins, price reactions, and inventory value at a glance. |
| **Product catalog** | All products with current price, market average, stock, and competitive status (e.g. “Competitive” vs “Above market”). |
| **Pricing intelligence** | Per-product optimal price, expected profit at that price, and price elasticity so you know how sensitive demand is. |
| **Competitor landscape** | Per-product view of competitor names and prices so you can position against the market. |
| **Sales performance history** | Historical price–volume data and charts to validate demand patterns and recommendations. |
| **Sync market** | Simulated market sync to refresh competitor-style data and keep intelligence up to date. |

---

## How it works

1. **Your data** — Products (name, SKU, cost, current price, min margin, optional max price, stock) plus competitor prices and sales history.
2. **Intelligence engine** — Demand is modeled from sales history (e.g. linear demand curve). The system solves for the price that maximizes profit subject to your margin and price constraints.
3. **Recommendations** — For each product you see an optimal price, expected profit at that price, and elasticity. You can apply the recommendation with one click.
4. **Guardrails** — Minimum margin and optional max price are always respected; low-stock alerts can inform when to prioritize margin over volume.

---

## Get started

**Prerequisites:** Node.js

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment**  
   Set `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key.
3. **Run the app**
   ```bash
   npm run dev
   ```

Open the app and explore the **Market overview**, **Product catalog**, and product-level **Pricing intelligence** to see recommended prices and apply them where it makes sense.

---

*Built for teams who want pricing that’s informed by the market, grounded in demand, and always under your control.*
