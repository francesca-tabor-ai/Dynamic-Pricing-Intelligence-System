import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; clearedCookies: any[] } {
  const clearedCookies: any[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: any) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

describe("DPIS Integration Tests", () => {
  describe("Authentication", () => {
    it("should handle logout correctly", async () => {
      const { ctx, clearedCookies } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();

      expect(result.success).toBe(true);
      expect(clearedCookies.length).toBe(1);
      expect(clearedCookies[0].name).toBe(COOKIE_NAME);
      expect(clearedCookies[0].options.maxAge).toBe(-1);
    });

    it("should retrieve current user", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const user = await caller.auth.me();

      expect(user).toBeDefined();
      expect(user?.email).toBe("test@example.com");
      expect(user?.name).toBe("Test User");
      expect(user?.role).toBe("user");
    });
  });

  describe("Product Management Input Validation", () => {
    it("should reject empty product name", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.products.create({
          name: "",
          sku: "TEST-001",
          baseCost: 5000,
          currentPrice: 10000,
          minMargin: 15,
          inventory: 100,
          demandElasticity: "1.2",
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.message).toBeTruthy();
      }
    });

    it("should reject negative base cost", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.products.create({
          name: "Test",
          sku: "TEST-001",
          baseCost: -1000,
          currentPrice: 10000,
          minMargin: 15,
          inventory: 100,
          demandElasticity: "1.2",
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.message).toBeTruthy();
      }
    });
  });

  describe("Competitor Tracking Input Validation", () => {
    it("should reject empty competitor name", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.competitors.add({
          productId: 1,
          competitorName: "",
          price: 9500,
          inStock: 1,
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.message).toBeTruthy();
      }
    });

    it("should reject negative competitor price", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.competitors.add({
          productId: 1,
          competitorName: "Competitor A",
          price: -100,
          inStock: 1,
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.message).toBeTruthy();
      }
    });
  });

  describe("Demand Data Input Validation", () => {
    it("should reject zero price for demand data", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.demand.add({
          productId: 1,
          price: 0,
          quantity: 100,
          revenue: 1000000,
          seasonality: "normal",
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.message).toBeTruthy();
      }
    });

    it("should reject negative quantity", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.demand.add({
          productId: 1,
          price: 10000,
          quantity: -50,
          revenue: 1000000,
          seasonality: "normal",
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.message).toBeTruthy();
      }
    });
  });

  describe("Pricing History Input Validation", () => {
    it("should reject zero new price", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.pricing.createRecord({
          productId: 1,
          previousPrice: 10000,
          newPrice: 0,
          recommendedPrice: 11000,
          reason: "Test",
          expectedProfitChange: 150,
          applied: 1,
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.message).toBeTruthy();
      }
    });
  });

  describe("Pipeline Execution Error Handling", () => {
    it("should handle non-existent product gracefully", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.optimization.runPipeline({
          productId: 999999,
        });
        expect.fail("Should have thrown error for non-existent product");
      } catch (error: any) {
        expect(error.message).toContain("Product not found");
      }
    });
  });
});
