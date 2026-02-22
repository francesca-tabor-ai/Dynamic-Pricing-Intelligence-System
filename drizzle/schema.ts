import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Products table: Core product catalog with pricing and cost data
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  baseCost: int("baseCost").notNull(), // Stored in cents
  currentPrice: int("currentPrice").notNull(), // Stored in cents
  minMargin: int("minMargin").default(15).notNull(), // Percentage (15%)
  maxPrice: int("maxPrice"), // Optional ceiling in cents
  inventory: int("inventory").default(0).notNull(),
  demandElasticity: varchar("demandElasticity", { length: 50 }).default("1.2"), // Price elasticity
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Competitor prices: Track competitor pricing for each product
 */
export const competitorPrices = mysqlTable("competitorPrices", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  competitorName: varchar("competitorName", { length: 255 }).notNull(),
  price: int("price").notNull(), // Stored in cents
  url: text("url"),
  inStock: int("inStock").default(1).notNull(), // 0 = out of stock, 1 = in stock
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CompetitorPrice = typeof competitorPrices.$inferSelect;
export type InsertCompetitorPrice = typeof competitorPrices.$inferInsert;

/**
 * Pricing history: Track price changes and recommendations over time
 */
export const pricingHistory = mysqlTable("pricingHistory", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  previousPrice: int("previousPrice").notNull(), // Stored in cents
  newPrice: int("newPrice").notNull(), // Stored in cents
  recommendedPrice: int("recommendedPrice").notNull(), // Stored in cents
  reason: varchar("reason", { length: 255 }),
  expectedProfitChange: int("expectedProfitChange"), // Percentage
  applied: int("applied").default(0).notNull(), // 0 = not applied, 1 = applied
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PricingHistory = typeof pricingHistory.$inferSelect;
export type InsertPricingHistory = typeof pricingHistory.$inferInsert;

/**
 * Demand data: Historical demand and sales data for forecasting
 */
export const demandData = mysqlTable("demandData", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  price: int("price").notNull(), // Stored in cents
  quantity: int("quantity").notNull(), // Units sold
  revenue: int("revenue").notNull(), // Stored in cents
  competitorPrice: int("competitorPrice"), // Competitor price at time of sale
  seasonality: varchar("seasonality", { length: 50 }).default("normal"), // normal, peak, low
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

export type DemandData = typeof demandData.$inferSelect;
export type InsertDemandData = typeof demandData.$inferInsert;