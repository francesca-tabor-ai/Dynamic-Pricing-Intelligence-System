import { useState, useEffect } from "react";
import { useSearch } from "wouter";
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
import { CheckCircle2, Clock, AlertCircle, Loader2, ArrowRight } from "lucide-react";

export default function Pipeline() {
  const search = useSearch();
  const productFromUrl = new URLSearchParams(search || "").get("product");
  const [selectedProductId, setSelectedProductId] = useState<string>(productFromUrl || "");
  const [pipelineResult, setPipelineResult] = useState<any>(null);

  const { data: products } = trpc.products.list.useQuery();

  useEffect(() => {
    if (productFromUrl) setSelectedProductId(productFromUrl);
  }, [productFromUrl]);
  const pipelineMutation = trpc.optimization.runPipeline.useMutation();

  const handleRunPipeline = async () => {
    if (!selectedProductId) return;
    try {
      const result = await pipelineMutation.mutateAsync({ productId: parseInt(selectedProductId) });
      setPipelineResult(result);
    } catch (error) {
      console.error("Pipeline error:", error);
    }
  };

  const selectedProduct = products?.find((p: any) => p.id === parseInt(selectedProductId));

  const stages = [
    {
      id: "scraper",
      name: "Scraper Agent",
      description: "Collect competitor pricing data",
      icon: "🔍",
    },
    {
      id: "forecast",
      name: "Demand Forecast Agent",
      description: "Analyze demand patterns & elasticity",
      icon: "📊",
    },
    {
      id: "optimization",
      name: "Optimization Agent",
      description: "Calculate optimal pricing",
      icon: "⚙️",
    },
    {
      id: "strategy",
      name: "Strategy Agent",
      description: "Apply business rules",
      icon: "🎯",
    },
  ];

  const getStageStatus = (stageId: string) => {
    if (!pipelineResult) return "pending";
    const stage = pipelineResult.stages[stageId];
    return stage?.status || "pending";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "running":
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case "pending":
        return <Clock className="w-5 h-5 text-gray-400" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Multi-Agent Pipeline</h1>
        <p className="text-muted-foreground mt-2">
          Watch the AI agents work together to optimize pricing
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Product</CardTitle>
          <CardDescription>Choose a product to run the optimization pipeline</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <Button
            onClick={handleRunPipeline}
            disabled={!selectedProductId || pipelineMutation.isPending}
            className="w-full"
            size="lg"
          >
            {pipelineMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Pipeline...
              </>
            ) : (
              "Run Optimization Pipeline"
            )}
          </Button>
        </CardContent>
      </Card>

      {pipelineResult && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Execution Flow</CardTitle>
              <CardDescription>
                Real-time visualization of the multi-agent optimization system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stages.map((stage, index) => {
                  const status = getStageStatus(stage.id);
                  const stageData = pipelineResult.stages[stage.id];

                  return (
                    <div key={stage.id}>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 pt-1">
                          {getStatusIcon(status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{stage.name}</h3>
                              <p className="text-sm text-muted-foreground">{stage.description}</p>
                            </div>
                            <Badge
                              variant={
                                status === "completed"
                                  ? "default"
                                  : status === "running"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {status}
                            </Badge>
                          </div>

                          {stageData && (
                            <div className="mt-3 p-3 bg-muted rounded-lg space-y-2 text-sm">
                              {stage.id === "scraper" && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Competitors Found:</span>
                                    <span className="font-medium">{stageData.competitorCount}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Latest Price:</span>
                                    <span className="font-medium">${(stageData.latestPrice / 100).toFixed(2)}</span>
                                  </div>
                                </>
                              )}
                              {stage.id === "forecast" && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Elasticity:</span>
                                    <span className="font-medium">{stageData.elasticity.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Baseline Demand:</span>
                                    <span className="font-medium">{stageData.baselineDemand} units</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Demand History:</span>
                                    <span className="font-medium">{stageData.historyPoints} data points</span>
                                  </div>
                                </>
                              )}
                              {stage.id === "optimization" && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Optimal Price:</span>
                                    <span className="font-medium text-primary">
                                      ${(stageData.optimalPrice / 100).toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Expected Demand:</span>
                                    <span className="font-medium">{Math.round(stageData.expectedDemand)} units</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Profit Impact:</span>
                                    <span className={`font-medium ${stageData.profitIncrease >= 0 ? "text-green-600" : "text-red-600"}`}>
                                      {stageData.profitIncrease >= 0 ? "+" : ""}{stageData.profitIncrease.toFixed(1)}%
                                    </span>
                                  </div>
                                </>
                              )}
                              {stage.id === "strategy" && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Final Price:</span>
                                    <span className="font-medium text-primary">
                                      ${(stageData.finalPrice / 100).toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Strategy:</span>
                                    <span className="font-medium">{stageData.reason}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {index < stages.length - 1 && (
                        <div className="flex justify-center py-2">
                          <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Current Price</p>
                  <p className="text-lg font-semibold">
                    ${selectedProduct ? (selectedProduct.currentPrice / 100).toFixed(2) : "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Recommended Price</p>
                  <p className="text-lg font-semibold text-primary">
                    ${(pipelineResult.stages.strategy.finalPrice / 100).toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Profit Impact</p>
                  <p className={`text-lg font-semibold ${pipelineResult.stages.optimization.profitIncrease >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {pipelineResult.stages.optimization.profitIncrease >= 0 ? "+" : ""}
                    {pipelineResult.stages.optimization.profitIncrease.toFixed(1)}%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Expected Demand</p>
                  <p className="text-lg font-semibold">
                    {Math.round(pipelineResult.stages.optimization.expectedDemand)} units
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
