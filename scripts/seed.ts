/**
 * Seed script: populates all tables with sample data for development/demo.
 * Run: npx tsx scripts/seed.ts
 */
import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/node-postgres";
import {
  users,
  products,
  competitorPrices,
  pricingHistory,
  demandData,
} from "../drizzle/schema";

// Prefer public URL - DATABASE_PRIVATE_URL only resolves inside Railway
const url =
  process.env.DATABASE_PUBLIC_URL ||
  process.env.DATABASE_URL ||
  process.env.DATABASE_PRIVATE_URL;

if (!url) {
  console.error("DATABASE_URL, DATABASE_PUBLIC_URL, or DATABASE_PRIVATE_URL required");
  process.exit(1);
}
if (url.includes("railway.internal") && !process.env.RAILWAY_ENVIRONMENT) {
  console.error(
    "DATABASE_PRIVATE_URL (postgres.railway.internal) is not reachable from your machine.",
    "Set DATABASE_PUBLIC_URL or DATABASE_URL in .env.local to the public connection string from Railway."
  );
  process.exit(1);
}

const db = drizzle(url);

async function seed() {
  console.log("Seeding database...");

  // 1. Users (upsert so seed can be re-run)
  const [user] = await db
    .insert(users)
    .values({
      openId: "seed-admin-001",
      name: "Demo Admin",
      email: "admin@dpis.demo",
      loginMethod: "seed",
      role: "admin",
    })
    .onConflictDoUpdate({
      target: users.openId,
      set: { name: "Demo Admin", email: "admin@dpis.demo", lastSignedIn: new Date() },
    })
    .returning({ id: users.id });

  if (!user) {
    console.error("Failed to insert/update user");
    process.exit(1);
  }
  const userId = user.id;
  console.log("  ✓ users (1 admin)");

  // 2. Products (prices in cents)
  const productRows = await db
    .insert(products)
    .values([
      {
        userId,
        name: "Wireless Headphones Pro",
        sku: "WH-001",
        baseCost: 4500, // $45
        currentPrice: 7999, // $79.99
        minMargin: 20,
        maxPrice: 9999,
        inventory: 150,
        demandElasticity: "1.3",
      },
      {
        userId,
        name: "USB-C Hub 7-in-1",
        sku: "HUB-002",
        baseCost: 2800,
        currentPrice: 4999,
        minMargin: 15,
        maxPrice: 6999,
        inventory: 200,
        demandElasticity: "1.2",
      },
      {
        userId,
        name: "Mechanical Keyboard",
        sku: "KB-003",
        baseCost: 3500,
        currentPrice: 8999,
        minMargin: 25,
        maxPrice: 12000,
        inventory: 75,
        demandElasticity: "1.1",
      },
    ])
    .returning({ id: products.id });

  const productIds = productRows.map((r) => r.id);
  console.log(`  ✓ products (${productIds.length})`);

  // 3. Competitor prices
  await db.insert(competitorPrices).values([
    { productId: productIds[0], competitorName: "Competitor A", price: 7499, inStock: 1 },
    { productId: productIds[0], competitorName: "Competitor B", price: 8299, inStock: 1 },
    { productId: productIds[1], competitorName: "Competitor A", price: 4599, inStock: 1 },
    { productId: productIds[1], competitorName: "Competitor C", price: 5299, inStock: 1 },
    { productId: productIds[2], competitorName: "Competitor B", price: 8499, inStock: 1 },
  ]);
  console.log("  ✓ competitorPrices");

  // 4. Pricing history
  await db.insert(pricingHistory).values([
    {
      productId: productIds[0],
      previousPrice: 8499,
      newPrice: 7999,
      recommendedPrice: 7999,
      reason: "Competitor price drop",
      expectedProfitChange: 5,
      applied: 1,
    },
    {
      productId: productIds[1],
      previousPrice: 5499,
      newPrice: 4999,
      recommendedPrice: 4999,
      reason: "Seasonal promotion",
      expectedProfitChange: -3,
      applied: 1,
    },
  ]);
  console.log("  ✓ pricingHistory");

  // 5. Demand data (historical sales)
  const demandRecords = [
    { productId: productIds[0], price: 7999, quantity: 12, revenue: 95988, competitorPrice: 7499, seasonality: "normal" },
    { productId: productIds[0], price: 8499, quantity: 8, revenue: 67992, competitorPrice: 8299, seasonality: "normal" },
    { productId: productIds[1], price: 4999, quantity: 25, revenue: 124975, competitorPrice: 4599, seasonality: "peak" },
    { productId: productIds[1], price: 5499, quantity: 18, revenue: 98982, competitorPrice: 5299, seasonality: "normal" },
    { productId: productIds[2], price: 8999, quantity: 5, revenue: 44995, competitorPrice: 8499, seasonality: "low" },
  ];
  await db.insert(demandData).values(demandRecords);
  console.log("  ✓ demandData");

  console.log("\nSeed complete.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
