import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { InsertUser, users, products, competitorPrices, pricingHistory, demandData, type InsertProduct, type InsertCompetitorPrice, type InsertPricingHistory, type InsertDemandData } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  const url = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
  if (!_db && url) {
    try {
      _db = drizzle(url);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}



/**
 * Product queries
 */
export async function getUserProducts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.userId, userId));
}

export async function getProductById(productId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/** Returns product only if it belongs to the user. Use for ownership checks. */
export async function getProductByIdForUser(productId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  const product = result[0];
  return product?.userId === userId ? product : undefined;
}

export async function createProductRecord(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(data);
  return result;
}

export async function updateProductRecord(productId: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(products).set(data).where(eq(products.id, productId));
}

export async function deleteProductRecord(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(products).where(eq(products.id, productId));
}

/**
 * Competitor price queries
 */
export async function getCompetitorPricesByProduct(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(competitorPrices).where(eq(competitorPrices.productId, productId)).orderBy(desc(competitorPrices.recordedAt));
}

export async function addCompetitorPriceRecord(data: InsertCompetitorPrice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(competitorPrices).values(data);
}

/**
 * Pricing history queries
 */
export async function getPricingHistoryRecords(productId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pricingHistory).where(eq(pricingHistory.productId, productId)).orderBy(desc(pricingHistory.createdAt)).limit(limit);
}

export async function createPricingHistoryRecord(data: InsertPricingHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(pricingHistory).values(data);
}

/**
 * Demand data queries
 */
export async function getDemandDataRecords(productId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(demandData).where(eq(demandData.productId, productId)).orderBy(desc(demandData.recordedAt)).limit(limit);
}

export async function addDemandDataRecord(data: InsertDemandData) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(demandData).values(data);
}
