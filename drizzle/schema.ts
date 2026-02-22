import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const usersRoleEnum = pgEnum("users_role", ["user", "admin"]);

export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: usersRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Products table: Core product catalog with pricing and cost data
 */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  baseCost: integer("baseCost").notNull(), // Stored in cents
  currentPrice: integer("currentPrice").notNull(), // Stored in cents
  minMargin: integer("minMargin").default(15).notNull(), // Percentage (15%)
  maxPrice: integer("maxPrice"), // Optional ceiling in cents
  inventory: integer("inventory").default(0).notNull(),
  demandElasticity: varchar("demandElasticity", { length: 50 }).default("1.2"), // Price elasticity
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Competitor prices: Track competitor pricing for each product
 */
export const competitorPrices = pgTable("competitorPrices", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  competitorName: varchar("competitorName", { length: 255 }).notNull(),
  price: integer("price").notNull(), // Stored in cents
  url: text("url"),
  inStock: integer("inStock").default(1).notNull(), // 0 = out of stock, 1 = in stock
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CompetitorPrice = typeof competitorPrices.$inferSelect;
export type InsertCompetitorPrice = typeof competitorPrices.$inferInsert;

/**
 * Pricing history: Track price changes and recommendations over time
 */
export const pricingHistory = pgTable("pricingHistory", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  previousPrice: integer("previousPrice").notNull(), // Stored in cents
  newPrice: integer("newPrice").notNull(), // Stored in cents
  recommendedPrice: integer("recommendedPrice").notNull(), // Stored in cents
  reason: varchar("reason", { length: 255 }),
  expectedProfitChange: integer("expectedProfitChange"), // Percentage
  applied: integer("applied").default(0).notNull(), // 0 = not applied, 1 = applied
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PricingHistory = typeof pricingHistory.$inferSelect;
export type InsertPricingHistory = typeof pricingHistory.$inferInsert;

/**
 * Demand data: Historical demand and sales data for forecasting
 */
export const demandData = pgTable("demandData", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  price: integer("price").notNull(), // Stored in cents
  quantity: integer("quantity").notNull(), // Units sold
  revenue: integer("revenue").notNull(), // Stored in cents
  competitorPrice: integer("competitorPrice"), // Competitor price at time of sale
  seasonality: varchar("seasonality", { length: 50 }).default("normal"), // normal, peak, low
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

export type DemandData = typeof demandData.$inferSelect;
export type InsertDemandData = typeof demandData.$inferInsert;
