import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getUserProducts,
  getProductById,
  createProductRecord,
  updateProductRecord,
  deleteProductRecord,
  getCompetitorPricesByProduct,
  addCompetitorPriceRecord,
  getPricingHistoryRecords,
  createPricingHistoryRecord,
  getDemandDataRecords,
  addDemandDataRecord,
} from "./db";
import { findOptimalPrice, applyStrategyRules, calculateElasticity } from "./pricing-engine";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  products: router({
    list: protectedProcedure.query(({ ctx }) => getUserProducts(ctx.user.id)),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getProductById(input.id)),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          sku: z.string().min(1),
          baseCost: z.number().int().positive(),
          currentPrice: z.number().int().positive(),
          minMargin: z.number().int().default(15),
          maxPrice: z.number().int().optional(),
          inventory: z.number().int().default(0),
          demandElasticity: z.string().default("1.2"),
        })
      )
      .mutation(({ ctx, input }) =>
        createProductRecord({ ...input, userId: ctx.user.id })
      ),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          currentPrice: z.number().int().optional(),
          minMargin: z.number().int().optional(),
          maxPrice: z.number().int().optional(),
          inventory: z.number().int().optional(),
          demandElasticity: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updateProductRecord(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteProductRecord(input.id)),
  }),

  competitors: router({
    getByProduct: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(({ input }) => getCompetitorPricesByProduct(input.productId)),

    add: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          competitorName: z.string().min(1),
          price: z.number().int().positive(),
          url: z.string().optional(),
          inStock: z.number().int().default(1),
        })
      )
      .mutation(({ input }) => addCompetitorPriceRecord(input)),
  }),

  pricing: router({
    getHistory: protectedProcedure
      .input(z.object({ productId: z.number(), limit: z.number().default(50) }))
      .query(({ input }) => getPricingHistoryRecords(input.productId, input.limit)),

    createRecord: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          previousPrice: z.number().int().positive(),
          newPrice: z.number().int().positive(),
          recommendedPrice: z.number().int().positive(),
          reason: z.string().optional(),
          expectedProfitChange: z.number().int().optional(),
          applied: z.number().int().default(0),
        })
      )
      .mutation(({ input }) => createPricingHistoryRecord(input)),
  }),

  demand: router({
    getHistory: protectedProcedure
      .input(z.object({ productId: z.number(), limit: z.number().default(100) }))
      .query(({ input }) => getDemandDataRecords(input.productId, input.limit)),

    add: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          price: z.number().int().positive(),
          quantity: z.number().int().positive(),
          revenue: z.number().int().positive(),
          competitorPrice: z.number().int().optional(),
          seasonality: z.enum(["normal", "peak", "low"]).default("normal"),
        })
      )
      .mutation(({ input }) => addDemandDataRecord(input)),
  }),

  optimization: router({
    /**
     * Multi-agent pipeline: Scraper → Demand Forecast → Optimization → Strategy
     * Simulates the complete pricing recommendation workflow
     */
    runPipeline: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ input }) => {
        const product = await getProductById(input.productId);
        if (!product) {
          throw new Error("Product not found");
        }

        // Stage 1: Scraper Agent - Get latest competitor prices
        const competitorPrices = await getCompetitorPricesByProduct(input.productId);
        const latestCompetitor = competitorPrices[0];
        const competitorPrice = latestCompetitor?.price ?? product.currentPrice;

        // Stage 2: Demand Forecast Agent - Calculate elasticity and forecast demand
        const demandHistory = await getDemandDataRecords(input.productId, 30);
        const elasticity = demandHistory.length > 0
          ? calculateElasticity(
              demandHistory.map(d => ({ price: d.price, quantity: d.quantity }))
            )
          : parseFloat(product.demandElasticity || "1.2");

        // Estimate baseline demand from recent history
        const baselineDemand = demandHistory.length > 0
          ? Math.round(demandHistory.reduce((sum, d) => sum + d.quantity, 0) / demandHistory.length)
          : 50; // Default baseline

        // Stage 3: Optimization Agent - Calculate optimal price
        const optimization = findOptimalPrice(
          product.currentPrice,
          product.baseCost,
          product.minMargin,
          product.maxPrice || undefined,
          elasticity,
          competitorPrice,
          baselineDemand
        );

        // Stage 4: Strategy Agent - Apply business rules
        const demandTrend =
          demandHistory.length > 5
            ? demandHistory[0].quantity > demandHistory[5].quantity
              ? "strong"
              : "weak"
            : "neutral";

        const strategy = applyStrategyRules(
          optimization.optimalPrice,
          product.baseCost,
          product.minMargin,
          competitorPrice,
          product.inventory,
          demandTrend as "strong" | "weak" | "neutral"
        );

        return {
          stages: {
            scraper: {
              status: "completed",
              competitorCount: competitorPrices.length,
              latestCompetitorPrice: competitorPrice,
              timestamp: new Date(),
            },
            forecast: {
              status: "completed",
              elasticity,
              baselineDemand,
              demandTrend,
              timestamp: new Date(),
            },
            optimization: {
              status: "completed",
              optimalPrice: optimization.optimalPrice,
              expectedDemand: optimization.expectedDemand,
              expectedProfit: optimization.expectedProfit,
              profitIncrease: optimization.profitIncrease,
              timestamp: new Date(),
            },
            strategy: {
              status: "completed",
              finalPrice: strategy.finalPrice,
              reason: strategy.reason,
              timestamp: new Date(),
            },
          },
          recommendation: {
            currentPrice: product.currentPrice,
            recommendedPrice: strategy.finalPrice,
            expectedProfitChange: optimization.profitIncrease,
            reason: strategy.reason,
            confidence: Math.min(95, 70 + Math.min(25, demandHistory.length / 2)),
          },
        };
      }),

    /**
     * Apply recommended price to product
     */
    applyRecommendation: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          recommendedPrice: z.number().int().positive(),
          reason: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const product = await getProductById(input.productId);
        if (!product) {
          throw new Error("Product not found");
        }

        // Update product price
        await updateProductRecord(input.productId, {
          currentPrice: input.recommendedPrice,
        });

        // Record in pricing history
        const profitBefore = (product.currentPrice - product.baseCost) * 50; // Estimate
        const profitAfter = (input.recommendedPrice - product.baseCost) * 50;
        const profitChange = profitBefore > 0 ? ((profitAfter - profitBefore) / profitBefore) * 100 : 0;

        await createPricingHistoryRecord({
          productId: input.productId,
          previousPrice: product.currentPrice,
          newPrice: input.recommendedPrice,
          recommendedPrice: input.recommendedPrice,
          reason: input.reason || "Price optimization",
          expectedProfitChange: Math.round(profitChange) || 0,
          applied: 1,
        });

        return {
          success: true,
          message: "Price updated successfully",
          newPrice: input.recommendedPrice,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
