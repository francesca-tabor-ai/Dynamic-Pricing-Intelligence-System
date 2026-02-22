/**
 * Shared pricing forecast logic - used by server optimization and client simulator.
 * Pure functions with no side effects.
 */

/**
 * Demand forecast based on price elasticity and competitor influence.
 * Demand = baseline * (1 + elasticity effect + competitor effect)
 */
export function forecastDemand(
  baselineDemand: number,
  currentPrice: number,
  newPrice: number,
  elasticity: number,
  competitorPrice: number,
  competitorWeight: number = 0.3
): number {
  const priceChangePercent = (newPrice - currentPrice) / currentPrice;
  const demandChangePercent = elasticity * priceChangePercent;
  const competitorInfluence =
    competitorPrice < newPrice ? competitorWeight * ((competitorPrice - newPrice) / newPrice) : 0;
  const forecastedDemand = baselineDemand * (1 + demandChangePercent + competitorInfluence);
  return Math.max(0, Math.round(forecastedDemand));
}

/**
 * Profit = (Price - Cost) * Demand(Price)
 */
export function calculateProfit(price: number, cost: number, demand: number): number {
  return (price - cost) * demand;
}

/**
 * Simulate a price scenario - returns demand, revenue, profit, and margin.
 */
export function simulateScenario(
  price: number,
  cost: number,
  baselineDemand: number,
  currentPrice: number,
  elasticity: number,
  competitorPrice: number,
  competitorWeight: number = 0.3
): { demand: number; revenue: number; profit: number; marginPercent: number } {
  const demand = forecastDemand(
    baselineDemand,
    currentPrice,
    price,
    elasticity,
    competitorPrice,
    competitorWeight
  );
  const profit = calculateProfit(price, cost, demand);
  const revenue = price * demand;
  const marginPercent = price > 0 ? ((price - cost) / price) * 100 : 0;
  return { demand, revenue, profit, marginPercent };
}
