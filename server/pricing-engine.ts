/**
 * Pricing Optimization Engine
 * Implements mathematical models for demand forecasting and profit maximization
 */

/**
 * Demand forecast based on price elasticity and historical data
 * Demand = β0 + β1 * Price + β2 * CompetitorPrice
 */
export function forecastDemand(
  baselineDemand: number,
  currentPrice: number,
  newPrice: number,
  elasticity: number,
  competitorPrice: number,
  competitorWeight: number = 0.3
): number {
  // Calculate price change percentage
  const priceChangePercent = (newPrice - currentPrice) / currentPrice;

  // Calculate demand change based on elasticity
  const demandChangePercent = elasticity * priceChangePercent;

  // Competitor influence: if competitor price is lower, reduce demand
  const competitorInfluence =
    competitorPrice < newPrice ? competitorWeight * ((competitorPrice - newPrice) / newPrice) : 0;

  // Final demand = baseline * (1 + elasticity effect + competitor effect)
  const forecastedDemand = baselineDemand * (1 + demandChangePercent + competitorInfluence);

  return Math.max(0, Math.round(forecastedDemand));
}

/**
 * Calculate profit for a given price
 * Profit = (Price - Cost) * Demand(Price)
 */
export function calculateProfit(
  price: number,
  cost: number,
  demand: number
): number {
  return (price - cost) * demand;
}

/**
 * Find optimal price using gradient descent
 * Maximizes: Profit(P) = (P - Cost) * Demand(P)
 */
export function findOptimalPrice(
  currentPrice: number,
  cost: number,
  minMargin: number,
  maxPrice: number | undefined,
  elasticity: number,
  competitorPrice: number,
  baselineDemand: number,
  competitorWeight: number = 0.3
): {
  optimalPrice: number;
  expectedDemand: number;
  expectedProfit: number;
  profitIncrease: number;
} {
  // Constraints
  const minPrice = Math.ceil(cost * (1 + minMargin / 100));
  const maxPriceConstraint = maxPrice || currentPrice * 1.5;

  let bestPrice = currentPrice;
  let bestProfit = calculateProfit(
    currentPrice,
    cost,
    forecastDemand(baselineDemand, currentPrice, currentPrice, elasticity, competitorPrice, competitorWeight)
  );

  // Grid search with step size
  const stepSize = Math.max(1, Math.floor((maxPriceConstraint - minPrice) / 50));

  for (let price = minPrice; price <= maxPriceConstraint; price += stepSize) {
    const demand = forecastDemand(
      baselineDemand,
      currentPrice,
      price,
      elasticity,
      competitorPrice,
      competitorWeight
    );
    const profit = calculateProfit(price, cost, demand);

    if (profit > bestProfit) {
      bestProfit = profit;
      bestPrice = price;
    }
  }

  // Fine-tune around best price
  const fineStepSize = Math.max(1, Math.floor(stepSize / 5));
  const searchRange = stepSize * 2;

  for (let price = Math.max(minPrice, bestPrice - searchRange); price <= Math.min(maxPriceConstraint, bestPrice + searchRange); price += fineStepSize) {
    const demand = forecastDemand(
      baselineDemand,
      currentPrice,
      price,
      elasticity,
      competitorPrice,
      competitorWeight
    );
    const profit = calculateProfit(price, cost, demand);

    if (profit > bestProfit) {
      bestProfit = profit;
      bestPrice = price;
    }
  }

  const expectedDemand = forecastDemand(
    baselineDemand,
    currentPrice,
    bestPrice,
    elasticity,
    competitorPrice,
    competitorWeight
  );
  const currentProfit = calculateProfit(
    currentPrice,
    cost,
    forecastDemand(baselineDemand, currentPrice, currentPrice, elasticity, competitorPrice, competitorWeight)
  );
  const profitIncrease = currentProfit > 0 ? ((bestProfit - currentProfit) / currentProfit) * 100 : 0;

  return {
    optimalPrice: bestPrice,
    expectedDemand,
    expectedProfit: bestProfit,
    profitIncrease: Math.round(profitIncrease),
  };
}

/**
 * Apply business strategy rules to recommended price
 */
export function applyStrategyRules(
  recommendedPrice: number,
  cost: number,
  minMargin: number,
  competitorPrice: number,
  inventory: number,
  demandTrend: "strong" | "weak" | "neutral" = "neutral"
): {
  finalPrice: number;
  reason: string;
} {
  let finalPrice = recommendedPrice;
  let reason = "Optimization recommended";

  // Minimum margin rule
  const minPrice = Math.ceil(cost * (1 + minMargin / 100));
  if (finalPrice < minPrice) {
    finalPrice = minPrice;
    reason = "Adjusted to meet minimum margin requirement";
  }

  // Inventory rule: if low inventory, increase price
  if (inventory < 5) {
    finalPrice = Math.ceil(finalPrice * 1.1);
    reason = "Increased due to low inventory";
  }

  // Competitor undercut rule: if competitor is significantly cheaper, undercut slightly
  if (competitorPrice > 0 && recommendedPrice > competitorPrice) {
    const undercutPrice = competitorPrice - 50; // Undercut by $0.50
    if (undercutPrice >= minPrice) {
      finalPrice = undercutPrice;
      reason = "Undercut competitor price";
    }
  }

  // Demand trend rule: weak demand suggests lower price
  if (demandTrend === "weak" && finalPrice > minPrice) {
    finalPrice = Math.max(minPrice, Math.floor(finalPrice * 0.95));
    reason = "Reduced due to weak demand";
  }

  // Strong demand: can sustain higher price
  if (demandTrend === "strong") {
    finalPrice = Math.ceil(finalPrice * 1.05);
    reason = "Increased due to strong demand";
  }

  return { finalPrice, reason };
}

/**
 * Calculate price elasticity from historical data
 * Elasticity = (% Change in Quantity) / (% Change in Price)
 */
export function calculateElasticity(
  historicalData: Array<{ price: number; quantity: number }>
): number {
  if (historicalData.length < 2) {
    return 1.2; // Default elasticity
  }

  let totalElasticity = 0;
  let count = 0;

  for (let i = 1; i < historicalData.length; i++) {
    const prev = historicalData[i - 1];
    const curr = historicalData[i];

    if (prev.price > 0 && prev.quantity > 0) {
      const priceChange = (curr.price - prev.price) / prev.price;
      const quantityChange = (curr.quantity - prev.quantity) / prev.quantity;

      if (priceChange !== 0) {
        const elasticity = quantityChange / priceChange;
        totalElasticity += Math.abs(elasticity);
        count++;
      }
    }
  }

  return count > 0 ? Math.min(3, Math.max(0.5, totalElasticity / count)) : 1.2;
}
