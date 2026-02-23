import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Recommendations() {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [competitorPrice, setCompetitorPrice] = useState<string>("");

  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery();
  const pipelineMutation = trpc.optimization.runPipeline.useMutation();
  const addCompetitorMutation = trpc.competitors.add.useMutation();
  const [recommendation, setRecommendation] = useState<any>(null);
  const [recLoading, setRecLoading] = useState(false);

  const handleGetRecommendation = async () => {
    if (!selectedProductId) return;
    setRecLoading(true);
    try {
      // If a competitor price is provided, save it to the DB first so
      // the pipeline can use it in the Scraper stage.
      const priceVal = parseFloat(competitorPrice);
      if (!isNaN(priceVal) && priceVal > 0) {
        const priceCents = Math.round(priceVal * 100);
        await addCompetitorMutation.mutateAsync({
          productId: parseInt(selectedProductId),
          competitorName: "Manual Entry",
          price: priceCents,
        });
      }
      const result = await pipelineMutation.mutateAsync({ productId: parseInt(selectedProductId) });
      setRecommendation(result);
    } catch (error) {
      toast.error("Failed to get recommendation");
    } finally {
      setRecLoading(false);
    }
  };

  const createHistoryMutation = trpc.pricing.createRecord.useMutation();

  const handleApply = async () => {
    if (!selectedProductId || !recommendation) return;
    try {
      const product = products?.find((p: any) => p.id === parseInt(selectedProductId));
      if (!product) return;

      await createHistoryMutation.mutateAsync({
        productId: parseInt(selectedProductId),
        previousPrice: product.currentPrice,
        newPrice: recommendation.strategy.finalPrice,
        recommendedPrice: recommendation.optimization.optimalPrice,
        reason: recommendation.strategy.reason,
        expectedProfitChange: Math.round(recommendation.optimization.profitIncrease * 100),
        applied: 1,
      });
      toast.success("Recommendation applied successfully");
      setRecommendation(null);
    } catch (error) {
      toast.error("Failed to apply recommendation");
    }
  };

  const selectedProduct = products?.find((p: any) => p.id === parseInt(selectedProductId));
  const profitIncrease = recommendation?.optimization?.profitIncrease || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pricing Recommendations</h1>
        <p className="text-muted-foreground mt-2">AI-powered optimal pricing suggestions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Product & Competitor Data</CardTitle>
          <CardDescription>Choose a product and enter competitor pricing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Product</label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product: any) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Competitor Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={competitorPrice}
                  onChange={(e) => setCompetitorPrice(e.target.value)}
                  placeholder="e.g. 29.99"
                />
              </div>
            </div>
            <Button onClick={handleGetRecommendation} disabled={!selectedProductId || recLoading} className="w-full">
              {recLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Get Recommendation"
              )}
            </Button>
          </CardContent>
        </Card>

      {recommendation && selectedProduct ? (
        <>
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Optimal Pricing Strategy</span>
                <Badge variant={profitIncrease >= 0 ? "default" : "secondary"}>
                  {profitIncrease >= 0 ? "Profit Increase" : "Profit Decrease"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="text-2xl font-bold">${(selectedProduct.currentPrice / 100).toFixed(2)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Recommended Price</p>
                  <p className="text-2xl font-bold text-primary">${(recommendation.strategy.finalPrice / 100).toFixed(2)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Expected Demand</p>
                  <p className="text-2xl font-bold">{Math.round(recommendation.optimization.expectedDemand)} units</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Profit Impact</p>
                  <div className="flex items-center gap-2">
                    {profitIncrease >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                    <p className={`text-2xl font-bold ${profitIncrease >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {profitIncrease >= 0 ? "+" : ""}{profitIncrease.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <Zap className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Strategy Rationale</p>
                    <p className="text-sm text-muted-foreground">{recommendation.strategy.reason}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Current Profit Margin</p>
                  <p className="font-medium">
                    {(((selectedProduct.currentPrice - selectedProduct.baseCost) / selectedProduct.currentPrice) * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Recommended Margin</p>
                  <p className="font-medium">
                    {(((recommendation.strategy.finalPrice - selectedProduct.baseCost) / recommendation.strategy.finalPrice) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <Button
                onClick={handleApply}
                disabled={createHistoryMutation.isPending}
                className="w-full"
                size="lg"
              >
                {createHistoryMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  "Apply Recommendation"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Base Cost</p>
                    <p className="text-lg font-semibold">${(selectedProduct.baseCost / 100).toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Demand Elasticity</p>
                    <p className="text-lg font-semibold">{parseFloat(selectedProduct.demandElasticity || "1.2").toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Current Inventory</p>
                    <p className="text-lg font-semibold">{selectedProduct.inventory || "—"} units</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Min Margin</p>
                    <p className="text-lg font-semibold">{selectedProduct.minMargin || 15}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Expected Revenue</p>
                    <p className="text-lg font-semibold">
                      ${((recommendation.strategy.finalPrice * recommendation.optimization.expectedDemand) / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Expected Profit</p>
                    <p className="text-lg font-semibold">
                      ${(recommendation.optimization.expectedProfit / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
