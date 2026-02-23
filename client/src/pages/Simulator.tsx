import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { simulateScenario } from "@shared/pricing-forecast";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Sliders, TrendingUp, Package, Loader2 } from "lucide-react";

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function Simulator() {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery();
  const { data: demandHistory } = trpc.demand.getHistory.useQuery(
    { productId: parseInt(selectedProductId), limit: 30 },
    { enabled: !!selectedProductId }
  );
  const { data: competitorPrices } = trpc.competitors.getByProduct.useQuery(
    { productId: parseInt(selectedProductId) },
    { enabled: !!selectedProductId }
  );

  const selectedProduct = products?.find((p: { id: number }) => p.id === parseInt(selectedProductId));

  const baselineDemand = useMemo(() => {
    if (!demandHistory?.length) return 50;
    const sum = demandHistory.reduce((acc: number, d: { quantity: number }) => acc + d.quantity, 0);
    return Math.round(sum / demandHistory.length);
  }, [demandHistory]);

  const competitorPrice = useMemo(() => {
    return competitorPrices?.[0]?.price ?? selectedProduct?.currentPrice ?? 0;
  }, [competitorPrices, selectedProduct]);

  const elasticity = useMemo(() => {
    return parseFloat(selectedProduct?.demandElasticity ?? "1.2");
  }, [selectedProduct]);

  const minPrice = useMemo(() => {
    if (!selectedProduct) return 0;
    return Math.ceil(selectedProduct.baseCost * (1 + (selectedProduct.minMargin ?? 15) / 100));
  }, [selectedProduct]);

  const maxPrice = useMemo(() => {
    if (!selectedProduct) return 10000;
    const ceiling = selectedProduct.maxPrice ?? selectedProduct.currentPrice * 1.5;
    return Math.max(minPrice + 100, Math.ceil(ceiling));
  }, [selectedProduct, minPrice]);

  const [simulatedPrice, setSimulatedPrice] = useState<number>(0);
  const [simulatedCompetitor, setSimulatedCompetitor] = useState<number>(0);
  const [simulatedElasticity, setSimulatedElasticity] = useState<number>(1.2);

  const currentPrice = selectedProduct?.currentPrice ?? 0;
  const cost = selectedProduct?.baseCost ?? 0;

  const priceValue = simulatedPrice || currentPrice;
  const compValue = simulatedCompetitor || competitorPrice;
  const elastValue = simulatedElasticity || elasticity;

  const scenario = useMemo(() => {
    if (!selectedProduct || currentPrice <= 0) return null;
    return simulateScenario(
      priceValue,
      cost,
      baselineDemand,
      currentPrice,
      elastValue,
      compValue,
      0.3
    );
  }, [selectedProduct, priceValue, cost, baselineDemand, currentPrice, elastValue, compValue]);

  const currentScenario = useMemo(() => {
    if (!selectedProduct || currentPrice <= 0) return null;
    return simulateScenario(
      currentPrice,
      cost,
      baselineDemand,
      currentPrice,
      elastValue,
      compValue,
      0.3
    );
  }, [selectedProduct, currentPrice, cost, baselineDemand, elastValue, compValue]);

  const profitDiff =
    scenario && currentScenario
      ? scenario.profit - currentScenario.profit
      : 0;
  const profitDiffPercent =
    currentScenario && currentScenario.profit > 0
      ? (profitDiff / currentScenario.profit) * 100
      : 0;

  const resetSliders = () => {
    setSimulatedPrice(0);
    setSimulatedCompetitor(0);
    setSimulatedElasticity(1.2);
  };

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[280px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Price Simulator</h1>
          <p className="text-muted-foreground mt-2">
            What-if analysis for pricing decisions
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Package className="size-6" />
                </EmptyMedia>
                <EmptyTitle>No products yet</EmptyTitle>
                <EmptyDescription>
                  Add products in the Products section to run price simulations.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Price Simulator</h1>
        <p className="text-muted-foreground mt-2">
          What-if analysis — adjust sliders to see predicted demand and profit
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sliders className="size-5" />
            Select Product
          </CardTitle>
          <CardDescription>
            Choose a product to simulate different price scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedProductId}
            onValueChange={(v) => {
              setSelectedProductId(v);
              resetSliders();
            }}
          >
            <SelectTrigger className="max-w-sm">
              <SelectValue placeholder="Select a product..." />
            </SelectTrigger>
            <SelectContent>
              {products?.map((product: { id: number; name: string }) => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedProduct && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Scenario Parameters</CardTitle>
                <CardDescription>
                  Drag sliders to explore how price changes affect demand and
                  profit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <Label>Your Price</Label>
                    <span className="font-mono text-muted-foreground">
                      {formatCents(priceValue)}
                    </span>
                  </div>
                  <Slider
                    value={[priceValue]}
                    onValueChange={([v]) => setSimulatedPrice(v)}
                    min={minPrice}
                    max={maxPrice}
                    step={50}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <Label>Competitor Price</Label>
                    <span className="font-mono text-muted-foreground">
                      {formatCents(compValue)}
                    </span>
                  </div>
                  <Slider
                    value={[compValue]}
                    onValueChange={([v]) => setSimulatedCompetitor(v)}
                    min={Math.floor(cost / 2)}
                    max={maxPrice}
                    step={50}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <Label>Demand Elasticity</Label>
                    <span className="font-mono text-muted-foreground">
                      {elastValue.toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    value={[elastValue]}
                    onValueChange={([v]) => setSimulatedElasticity(v)}
                    min={0.5}
                    max={3}
                    step={0.1}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Predicted Results
                  {profitDiff !== 0 && (
                    <span
                      className={`text-sm font-normal ${
                        profitDiff >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {profitDiff >= 0 ? "+" : ""}
                      {profitDiffPercent.toFixed(1)}% vs current
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scenario ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Predicted Demand
                      </p>
                      <p className="text-2xl font-bold tabular-nums">
                        {scenario.demand} units
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="text-2xl font-bold tabular-nums">
                        {formatCents(scenario.revenue)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Profit</p>
                      <p className="text-2xl font-bold tabular-nums text-primary">
                        {formatCents(scenario.profit)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Margin</p>
                      <p className="text-2xl font-bold tabular-nums">
                        {scenario.marginPercent.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    Adjust sliders to see predictions
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5" />
                Current vs Simulated
              </CardTitle>
              <CardDescription>
                Compare your simulated scenario to current pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentScenario && scenario ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-2 text-left font-medium">Metric</th>
                        <th className="pb-2 text-right font-medium">
                          Current ({formatCents(currentPrice)})
                        </th>
                        <th className="pb-2 text-right font-medium">
                          Simulated ({formatCents(priceValue)})
                        </th>
                        <th className="pb-2 text-right font-medium">
                          Difference
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-2">Demand</td>
                        <td className="text-right tabular-nums">
                          {currentScenario.demand}
                        </td>
                        <td className="text-right tabular-nums">
                          {scenario.demand}
                        </td>
                        <td
                          className={`text-right tabular-nums ${
                            scenario.demand >= currentScenario.demand
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        >
                          {scenario.demand >= currentScenario.demand ? "+" : ""}
                          {scenario.demand - currentScenario.demand}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2">Revenue</td>
                        <td className="text-right tabular-nums">
                          {formatCents(currentScenario.revenue)}
                        </td>
                        <td className="text-right tabular-nums">
                          {formatCents(scenario.revenue)}
                        </td>
                        <td
                          className={`text-right tabular-nums ${
                            scenario.revenue >= currentScenario.revenue
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        >
                          {scenario.revenue >= currentScenario.revenue ? "+" : ""}
                          {formatCents(
                            scenario.revenue - currentScenario.revenue
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2">Profit</td>
                        <td className="text-right tabular-nums">
                          {formatCents(currentScenario.profit)}
                        </td>
                        <td className="text-right tabular-nums">
                          {formatCents(scenario.profit)}
                        </td>
                        <td
                          className={`text-right tabular-nums ${
                            profitDiff >= 0 ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {profitDiff >= 0 ? "+" : ""}
                          {formatCents(profitDiff)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Sliders className="size-6" />
                    </EmptyMedia>
                    <EmptyTitle>No comparison yet</EmptyTitle>
                    <EmptyDescription>
                      Adjust the sliders above to see how your simulated price
                      compares to the current price.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
