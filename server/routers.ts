import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getUserProducts,
  getProductById,
  getProductByIdForUser,
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
import { invokeLLM } from "./_core/llm";

const PLATFORM_CHAT_SYSTEM_PROMPT = `You are a helpful assistant for the Dynamic Pricing Intelligence System (DPIS). Your role is to answer questions about the platform and guide users.

DPIS is a dashboard that helps users:
- **Health**: At-a-glance product health scores. See which products need attention (margin, competitive position, data readiness). Click a row to run the pipeline for that product.
- **Products**: Manage products (name, SKU, base cost, current price, min margin, max price, inventory, demand elasticity). Add and edit products here.
- **Recommendations**: View AI-generated pricing recommendations. The system runs a pipeline (Scraper → Demand Forecast → Optimization → Strategy) to suggest optimal prices. Users can apply recommendations to update product prices.
- **Pipeline**: Run the optimization pipeline for a product. It fetches competitor prices, forecasts demand, computes optimal price, and applies business rules to produce a final recommended price.
- **Simulator**: What-if analysis tool. Users can adjust price, competitor price, and demand elasticity sliders to see predicted demand, revenue, and profit in real time—no pipeline run required.
- **Analytics**: View pricing history, demand data, and charts.

Be concise and practical. When users ask how to do something, point them to the right section (Products, Recommendations, Pipeline, Analytics) and give short step-by-step guidance. If you don't know something specific about their data, say so and suggest where to look in the app.`;

function extractAssistantText(content: string | Array<{ type: string; text?: string }>): string {
  if (typeof content === "string") return content;
  return content
    .map((part) => (part.type === "text" && part.text ? part.text : ""))
    .join("");
}

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
      .query(async ({ ctx, input }) => {
        const product = await getProductByIdForUser(input.id, ctx.user.id);
        if (!product) throw new Error("Product not found");
        return product;
      }),

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
      .mutation(async ({ ctx, input }) => {
        const product = await getProductByIdForUser(input.id, ctx.user.id);
        if (!product) throw new Error("Product not found");
        const { id, ...data } = input;
        return updateProductRecord(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const product = await getProductByIdForUser(input.id, ctx.user.id);
        if (!product) throw new Error("Product not found");
        return deleteProductRecord(input.id);
      }),
  }),

  competitors: router({
    getByProduct: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ ctx, input }) => {
        const product = await getProductByIdForUser(input.productId, ctx.user.id);
        if (!product) throw new Error("Product not found");
        return getCompetitorPricesByProduct(input.productId);
      }),

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
      .mutation(async ({ ctx, input }) => {
        const product = await getProductByIdForUser(input.productId, ctx.user.id);
        if (!product) throw new Error("Product not found");
        return addCompetitorPriceRecord(input);
      }),
  }),

  pricing: router({
    getHistory: protectedProcedure
      .input(z.object({ productId: z.number(), limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        const product = await getProductByIdForUser(input.productId, ctx.user.id);
        if (!product) throw new Error("Product not found");
        return getPricingHistoryRecords(input.productId, input.limit);
      }),

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
      .mutation(async ({ ctx, input }) => {
        const product = await getProductByIdForUser(input.productId, ctx.user.id);
        if (!product) throw new Error("Product not found");
        return createPricingHistoryRecord(input);
      }),
  }),

  demand: router({
    getHistory: protectedProcedure
      .input(z.object({ productId: z.number(), limit: z.number().default(100) }))
      .query(async ({ ctx, input }) => {
        const product = await getProductByIdForUser(input.productId, ctx.user.id);
        if (!product) throw new Error("Product not found");
        return getDemandDataRecords(input.productId, input.limit);
      }),

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
      .mutation(async ({ ctx, input }) => {
        const product = await getProductByIdForUser(input.productId, ctx.user.id);
        if (!product) throw new Error("Product not found");
        return addDemandDataRecord(input);
      }),
  }),

  optimization: router({
    /**
     * Product health: Aggregated score per product for quick triage
     */
    getProductHealth: protectedProcedure.query(async ({ ctx }) => {
      const products = await getUserProducts(ctx.user.id);
      const results: Array<{
        productId: number;
        name: string;
        sku: string;
        score: number;
        status: "healthy" | "attention" | "critical";
        issues: string[];
        currentPrice: number;
        marginPct: number;
        competitorCount: number;
        avgCompetitorPrice: number | null;
      }> = [];

      for (const p of products) {
        const marginPct =
          p.currentPrice > 0
            ? Math.round(((p.currentPrice - p.baseCost) / p.currentPrice) * 100)
            : 0;
        const minMargin = p.minMargin ?? 15;

        const [competitors, demandHistory] = await Promise.all([
          getCompetitorPricesByProduct(p.id),
          getDemandDataRecords(p.id, 10),
        ]);

        const latestCompetitorPrices = competitors
          .filter((c, i, arr) => {
            const firstForCompetitor = arr.findIndex((x) => x.competitorName === c.competitorName) === i;
            return firstForCompetitor;
          })
          .map((c) => c.price);
        const avgCompetitorPrice =
          latestCompetitorPrices.length > 0
            ? Math.round(
                latestCompetitorPrices.reduce((a, b) => a + b, 0) / latestCompetitorPrices.length
              )
            : null;

        const issues: string[] = [];
        let score = 100;

        // Margin check
        if (marginPct < minMargin) {
          issues.push(`Margin (${marginPct}%) below minimum (${minMargin}%)`);
          score -= 35;
        } else if (marginPct < minMargin + 5) {
          issues.push(`Margin close to minimum`);
          score -= 10;
        }

        // Competitor position
        if (avgCompetitorPrice && avgCompetitorPrice > 0) {
          const priceRatio = p.currentPrice / avgCompetitorPrice;
          if (priceRatio > 1.2) {
            issues.push(`${Math.round((priceRatio - 1) * 100)}% above average competitor price`);
            score -= 30;
          } else if (priceRatio > 1.05) {
            score -= 10;
          }
        } else if (competitors.length === 0) {
          issues.push("No competitor data");
          score -= 15;
        }

        // Data readiness
        if (demandHistory.length === 0 && competitors.length === 0) {
          issues.push("Add demand data and competitors for better recommendations");
          score -= 10;
        }

        // Low inventory
        const inv = p.inventory ?? 0;
        if (inv > 0 && inv < 5) {
          issues.push("Low inventory");
          score -= 5;
        }

        score = Math.max(0, Math.min(100, score));

        const status: "healthy" | "attention" | "critical" =
          score >= 80 ? "healthy" : score >= 50 ? "attention" : "critical";

        results.push({
          productId: p.id,
          name: p.name,
          sku: p.sku,
          score,
          status,
          issues,
          currentPrice: p.currentPrice,
          marginPct,
          competitorCount: competitors.length,
          avgCompetitorPrice,
        });
      }

      return results;
    }),

    /**
     * Multi-agent pipeline: Scraper → Demand Forecast → Optimization → Strategy
     * Simulates the complete pricing recommendation workflow
     */
    runPipeline: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const product = await getProductByIdForUser(input.productId, ctx.user.id);
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
      .mutation(async ({ ctx, input }) => {
        const product = await getProductByIdForUser(input.productId, ctx.user.id);
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

  ai: router({
    chat: protectedProcedure
      .input(
        z.object({
          messages: z.array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const apiMessages = [
          { role: "system" as const, content: PLATFORM_CHAT_SYSTEM_PROMPT },
          ...input.messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ];
        const result = await invokeLLM({ messages: apiMessages });
        const choice = result.choices?.[0];
        if (!choice?.message?.content) {
          throw new Error("No response from assistant");
        }
        const text = extractAssistantText(choice.message.content);
        return { content: text };
      }),
  }),
});

export type AppRouter = typeof appRouter;
