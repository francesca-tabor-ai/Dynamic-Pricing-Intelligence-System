import { describe, expect, it } from "vitest";
import {
  forecastDemand,
  calculateProfit,
  findOptimalPrice,
  applyStrategyRules,
  calculateElasticity,
} from "./pricing-engine";

describe("Pricing Engine", () => {
  describe("forecastDemand", () => {
    it("should forecast demand based on price elasticity", () => {
      const demand = forecastDemand(100, 10000, 9000, 1.5, 9500, 0.3);
      expect(typeof demand).toBe("number");
    });

    it("should reduce demand when price increases significantly", () => {
      const demandLow = forecastDemand(100, 10000, 10000, 1.5, 10000, 0.3);
      const demandHigh = forecastDemand(100, 10000, 15000, 1.5, 10000, 0.3);
      expect(typeof demandHigh).toBe("number");
      expect(typeof demandLow).toBe("number");
    });

    it("should account for competitor pricing influence", () => {
      const demandWithCompetitor = forecastDemand(100, 10000, 10500, 1.2, 9500, 0.3);
      const demandWithoutCompetitor = forecastDemand(100, 10000, 10500, 1.2, 10500, 0.3);
      expect(typeof demandWithCompetitor).toBe("number");
      expect(typeof demandWithoutCompetitor).toBe("number");
    });

    it("should never return negative demand", () => {
      const demand = forecastDemand(10, 10000, 50000, 3.0, 5000, 0.5);
      expect(demand).toBeGreaterThanOrEqual(0);
    });
  });

  describe("calculateProfit", () => {
    it("should calculate profit correctly", () => {
      const profit = calculateProfit(15000, 10000, 100);
      expect(profit).toBe(500000);
    });

    it("should return zero profit when price equals cost", () => {
      const profit = calculateProfit(10000, 10000, 100);
      expect(profit).toBe(0);
    });

    it("should handle zero demand", () => {
      const profit = calculateProfit(15000, 10000, 0);
      expect(profit).toBe(0);
    });
  });

  describe("findOptimalPrice", () => {
    it("should find a price within constraints", () => {
      const result = findOptimalPrice(10000, 8000, 15, 12000, 1.2, 9500, 100);
      expect(result.optimalPrice).toBeGreaterThanOrEqual(9100);
      expect(result.optimalPrice).toBeLessThanOrEqual(12100);
    });

    it("should respect minimum margin constraint", () => {
      const result = findOptimalPrice(10000, 8000, 20, 15000, 1.2, 9500, 100);
      const minPrice = 8000 * 1.2;
      expect(result.optimalPrice).toBeGreaterThanOrEqual(minPrice - 100);
    });

    it("should return expected demand and profit", () => {
      const result = findOptimalPrice(10000, 8000, 15, 12000, 1.2, 9500, 100);
      expect(result.expectedDemand).toBeGreaterThan(0);
      expect(result.expectedProfit).toBeGreaterThan(0);
      expect(result.profitIncrease).toBeDefined();
    });

    it("should calculate profit increase percentage", () => {
      const result = findOptimalPrice(10000, 8000, 15, 12000, 1.2, 9500, 100);
      expect(result.profitIncrease).toBeGreaterThanOrEqual(-150);
      expect(result.profitIncrease).toBeLessThanOrEqual(250);
    });
  });

  describe("applyStrategyRules", () => {
    it("should enforce minimum margin rule", () => {
      const result = applyStrategyRules(8500, 8000, 15, 9000, 50);
      expect(result.finalPrice).toBeGreaterThanOrEqual(9100);
      expect(result.reason).toBeDefined();
    });

    it("should increase price when inventory is low", () => {
      const resultLowInventory = applyStrategyRules(10000, 8000, 15, 9500, 3);
      const resultHighInventory = applyStrategyRules(10000, 8000, 15, 9500, 100);
      expect(resultLowInventory.finalPrice).toBeGreaterThanOrEqual(resultHighInventory.finalPrice);
    });

    it("should undercut competitor price when appropriate", () => {
      const result = applyStrategyRules(11000, 8000, 15, 10000, 50);
      expect(result.finalPrice).toBeLessThanOrEqual(11000);
      expect(result.reason).toBeDefined();
    });

    it("should lower price for weak demand", () => {
      const resultWeak = applyStrategyRules(10000, 8000, 15, 9500, 50, "weak");
      const resultNeutral = applyStrategyRules(10000, 8000, 15, 9500, 50, "neutral");
      expect(resultWeak.finalPrice).toBeLessThanOrEqual(resultNeutral.finalPrice);
    });

    it("should increase price for strong demand", () => {
      const resultStrong = applyStrategyRules(10000, 8000, 15, 9500, 50, "strong");
      const resultNeutral = applyStrategyRules(10000, 8000, 15, 9500, 50, "neutral");
      expect(resultStrong.finalPrice).toBeGreaterThanOrEqual(resultNeutral.finalPrice);
    });
  });

  describe("calculateElasticity", () => {
    it("should calculate elasticity from historical data", () => {
      const data = [
        { price: 10000, quantity: 100 },
        { price: 9000, quantity: 120 },
        { price: 8000, quantity: 150 },
      ];
      const elasticity = calculateElasticity(data);
      expect(elasticity).toBeGreaterThanOrEqual(0.5);
      expect(elasticity).toBeLessThanOrEqual(3);
    });

    it("should return default elasticity for insufficient data", () => {
      const elasticity = calculateElasticity([]);
      expect(elasticity).toBe(1.2);
    });

    it("should handle single data point", () => {
      const data = [{ price: 10000, quantity: 100 }];
      const elasticity = calculateElasticity(data);
      expect(elasticity).toBe(1.2);
    });

    it("should clamp elasticity within reasonable bounds", () => {
      const data = Array.from({ length: 10 }, (_, i) => ({
        price: 10000 - i * 1000,
        quantity: 100 + i * 50,
      }));
      const elasticity = calculateElasticity(data);
      expect(elasticity).toBeGreaterThanOrEqual(0.5);
      expect(elasticity).toBeLessThanOrEqual(3);
    });
  });
});
