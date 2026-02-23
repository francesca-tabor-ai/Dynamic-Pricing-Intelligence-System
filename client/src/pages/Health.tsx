import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Loader2, Activity, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

const statusConfig = {
  healthy: {
    icon: CheckCircle2,
    label: "Healthy",
    variant: "default" as const,
    className: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
  },
  attention: {
    icon: AlertTriangle,
    label: "Needs attention",
    variant: "secondary" as const,
    className: "text-amber-600 bg-amber-500/10 border-amber-500/30",
  },
  critical: {
    icon: AlertTriangle,
    label: "Critical",
    variant: "destructive" as const,
    className: "text-red-600 bg-red-500/10 border-red-500/30",
  },
};

export default function Health() {
  const [, setLocation] = useLocation();
  const { data: healthList, isLoading } = trpc.optimization.getProductHealth.useQuery();

  const summary = healthList
    ? {
        healthy: healthList.filter((h) => h.status === "healthy").length,
        attention: healthList.filter((h) => h.status === "attention").length,
        critical: healthList.filter((h) => h.status === "critical").length,
      }
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Product Health</h1>
        <p className="text-muted-foreground mt-2">
          At-a-glance pricing health for all products. Prioritize what needs attention.
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : healthList && healthList.length > 0 ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setLocation("/dashboard/products")}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Healthy
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-3xl font-bold text-emerald-600">{summary?.healthy ?? 0}</p>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setLocation("/dashboard/recommendations")}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Needs attention
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-3xl font-bold text-amber-600">{summary?.attention ?? 0}</p>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setLocation("/dashboard/pipeline")}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Critical
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-3xl font-bold text-red-600">{summary?.critical ?? 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Health table */}
          <Card>
            <CardHeader>
              <CardTitle>All Products</CardTitle>
              <CardDescription>
                Health score based on margin, competitive position, and data readiness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Margin</TableHead>
                      <TableHead className="text-right">Competitors</TableHead>
                      <TableHead className="w-[280px]">Issues</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {healthList.map((h) => {
                      const config = statusConfig[h.status];
                      const Icon = config.icon;
                      return (
                        <TableRow
                          key={h.productId}
                          className="cursor-pointer hover:bg-muted/30"
                          onClick={() =>
                            setLocation(`/dashboard/pipeline?product=${h.productId}`)
                          }
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{h.name}</p>
                              <p className="text-xs text-muted-foreground">{h.sku}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${config.className} gap-1`}
                            >
                              <Icon className="w-3 h-3" />
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={
                                h.score >= 80
                                  ? "text-emerald-600 font-semibold"
                                  : h.score >= 50
                                    ? "text-amber-600 font-semibold"
                                    : "text-red-600 font-semibold"
                              }
                            >
                              {h.score}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            ${(h.currentPrice / 100).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">{h.marginPct}%</TableCell>
                          <TableCell className="text-right">
                            {h.competitorCount > 0 ? (
                              <span>
                                {h.competitorCount}{" "}
                                {h.avgCompetitorPrice != null
                                  ? `(avg $${(h.avgCompetitorPrice / 100).toFixed(2)})`
                                  : ""}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {h.issues.length > 0 ? (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {h.issues.join(" · ")}
                              </p>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-12">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Activity className="size-6" />
                </EmptyMedia>
                <EmptyTitle>No products yet</EmptyTitle>
                <EmptyDescription>
                  Add products to your catalog to see their pricing health and get recommendations.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
