import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, TrendingUp, BarChart3, Workflow } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">DPIS</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button onClick={() => setLocation("/dashboard/products")} className="gap-2">
                Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button variant="default" className="gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center text-center space-y-8">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
              Dynamic Pricing Intelligence System
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Optimize your product pricing with AI-powered recommendations. Analyze competitor data, forecast demand, and maximize profit margins in real-time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {isAuthenticated ? (
              <Button size="lg" onClick={() => setLocation("/dashboard/products")} className="gap-2 h-12 px-8">
                Open Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button size="lg" className="gap-2 h-12 px-8">
                Sign In to Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            <Button size="lg" variant="outline" className="h-12 px-8">
              Learn More
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 py-20 w-full">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4 p-6 rounded-lg border border-border/40 bg-card/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Smart Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                Get AI-powered pricing suggestions based on competitor analysis and demand forecasting.
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-lg border border-border/40 bg-card/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Real-Time Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Monitor price trends, demand patterns, and profit projections with interactive visualizations.
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-lg border border-border/40 bg-card/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Workflow className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Multi-Agent Pipeline</h3>
              <p className="text-sm text-muted-foreground">
                Watch AI agents collaborate: scraping competitors, forecasting demand, optimizing prices, and applying strategy.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>Dynamic Pricing Intelligence System &copy; 2026. Powered by advanced AI optimization.</p>
        </div>
      </footer>
    </div>
  );
}
