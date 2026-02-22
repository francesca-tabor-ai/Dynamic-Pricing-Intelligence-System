import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Loader2 } from "lucide-react";

export default function Analytics() {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const { data: products } = trpc.products.list.useQuery();
  const { data: pricingHistory, isLoading: historyLoading } = trpc.pricing.getHistory.useQuery(
    { productId: parseInt(selectedProductId), limit: 30 },
    { enabled: !!selectedProductId }
  );
  const { data: demandHistory, isLoading: demandLoading } = trpc.demand.getHistory.useQuery(
    { productId: parseInt(selectedProductId), limit: 30 },
    { enabled: !!selectedProductId }
  );
  const { data: competitors, isLoading: competitorLoading } = trpc.competitors.getByProduct.useQuery(
    { productId: parseInt(selectedProductId) },
    { enabled: !!selectedProductId }
  );

  const selectedProduct = products?.find((p: any) => p.id === parseInt(selectedProductId));

  // Prepare pricing history data
  const pricingData = pricingHistory?.map((record: any, idx: number) => ({
    index: idx,
    previousPrice: record.previousPrice / 100,
    newPrice: record.newPrice / 100,
    recommendedPrice: record.recommendedPrice / 100,
  })) || [];

  // Prepare demand history data
  const demandData = demandHistory?.map((record: any, idx: number) => ({
    index: idx,
    price: record.price / 100,
    quantity: record.quantity,
    revenue: record.revenue / 100,
  })) || [];

  // Prepare competitor data
  const competitorData = competitors?.map((comp: any) => ({
    name: comp.competitorName,
    price: comp.price / 100,
  })) || [];

  const isLoading = historyLoading || demandLoading || competitorLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Insights</h1>
        <p className="text-muted-foreground mt-2">Visualize pricing trends and demand patterns</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Product</CardTitle>
          <CardDescription>Choose a product to view analytics</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : selectedProductId ? (
        <>
          {/* Pricing History Chart */}
          {pricingData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pricing History</CardTitle>
                <CardDescription>Previous, current, and recommended prices over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={pricingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `$${typeof value === 'number' ? value.toFixed(2) : value}`} />
                    <Legend />
                    <Line type="monotone" dataKey="previousPrice" stroke="#888" name="Previous Price" />
                    <Line type="monotone" dataKey="newPrice" stroke="#3b82f6" name="Applied Price" />
                    <Line type="monotone" dataKey="recommendedPrice" stroke="#10b981" name="Recommended" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Demand & Revenue Chart */}
          {demandData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Demand & Revenue Trends</CardTitle>
                <CardDescription>Historical demand quantity and revenue at different price points</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={demandData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value: any) => typeof value === 'number' ? value.toFixed(2) : value} />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="quantity" fill="#3b82f6" stroke="#3b82f6" name="Quantity Sold" />
                    <Area yAxisId="right" type="monotone" dataKey="revenue" fill="#10b981" stroke="#10b981" name="Revenue ($)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Competitor Pricing Comparison */}
          {competitorData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Competitor Pricing Comparison</CardTitle>
                <CardDescription>Your price vs. competitor prices</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: selectedProduct?.name || "Your Product", price: selectedProduct ? selectedProduct.currentPrice / 100 : 0 },
                      ...competitorData,
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `$${typeof value === 'number' ? value.toFixed(2) : value}`} />
                    <Bar dataKey="price" fill="#3b82f6" name="Price" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Product Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Current Price</p>
                  <p className="text-lg font-semibold">${selectedProduct ? (selectedProduct.currentPrice / 100).toFixed(2) : "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Base Cost</p>
                  <p className="text-lg font-semibold">${selectedProduct ? (selectedProduct.baseCost / 100).toFixed(2) : "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Margin</p>
                  <p className="text-lg font-semibold">
                    {selectedProduct ? (((selectedProduct.currentPrice - selectedProduct.baseCost) / selectedProduct.currentPrice) * 100).toFixed(1) : "—"}%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Inventory</p>
                  <p className="text-lg font-semibold">{selectedProduct?.inventory || 0} units</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Select a product to view analytics</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
