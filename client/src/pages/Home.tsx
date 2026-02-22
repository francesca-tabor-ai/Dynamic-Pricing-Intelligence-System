import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import {
  ArrowRight,
  Zap,
  TrendingUp,
  BarChart3,
  Workflow,
  Target,
  AlertTriangle,
  Sparkles,
  Link2,
} from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <Zap className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">DPIS</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => setLocation("/#solution")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Solution
            </button>
            <button
              onClick={() => setLocation("/pricing")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => setLocation("/case-studies")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Case Studies
            </button>
          </nav>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button onClick={() => setLocation("/dashboard/products")} className="gap-2">
                Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="default"
                className="gap-2"
                onClick={() => {
                  const url = getLoginUrl();
                  if (url) window.location.href = url;
                }}
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero — Customer, Pain, Solution */}
        <section className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Target className="w-4 h-4" />
            Built for e‑commerce & retail teams
          </div>
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
              Stop Guessing. Start{" "}
              <span className="text-primary">Optimizing.</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Retailers and e‑commerce teams lose millions to manual pricing, stale competitor data, and missed demand signals. DPIS turns your pricing into a profit engine—with AI that analyzes competitors, forecasts demand, and recommends optimal prices in real time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {isAuthenticated ? (
              <Button
                size="lg"
                onClick={() => setLocation("/dashboard/products")}
                className="gap-2 h-12 px-8"
              >
                Open Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                size="lg"
                className="gap-2 h-12 px-8"
                onClick={() => {
                  const url = getLoginUrl();
                  if (url) window.location.href = url;
                }}
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8"
              onClick={() => setLocation("/pricing")}
            >
              View Pricing
            </Button>
          </div>
        </section>

        {/* Who We Serve — Customer Persona */}
        <section className="max-w-7xl mx-auto px-4 py-16 w-full">
          <div className="text-center space-y-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Who We Built This For</h2>
            <p className="text-lg text-muted-foreground">
              Pricing Managers, Revenue Leads, and e‑commerce operators who manage hundreds or thousands of SKUs. You know pricing drives margin—but you&apos;re stuck in spreadsheets, stale data, and gut decisions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="px-4 py-2 rounded-full bg-muted text-sm font-medium">
                E‑commerce retailers
              </span>
              <span className="px-4 py-2 rounded-full bg-muted text-sm font-medium">
                Marketplace sellers
              </span>
              <span className="px-4 py-2 rounded-full bg-muted text-sm font-medium">
                D2C brands
              </span>
              <span className="px-4 py-2 rounded-full bg-muted text-sm font-medium">
                B2B distributors
              </span>
            </div>
          </div>
        </section>

        {/* Pain Points */}
        <section className="border-y border-border/40 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 py-20">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
              The Pricing Headaches You&apos;re Tired Of
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3 p-6 rounded-xl border border-border/60 bg-background">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="font-semibold">Manual, Static Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  Spending hours updating prices in spreadsheets. Missing windows when demand spikes—or leaving money on the table when competitors drop.
                </p>
              </div>
              <div className="space-y-3 p-6 rounded-xl border border-border/60 bg-background">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="font-semibold">Outdated Competitor Data</h3>
                <p className="text-sm text-muted-foreground">
                  Scraping competitor sites yourself or waiting on stale reports. You react too late—or not at all—when the market shifts.
                </p>
              </div>
              <div className="space-y-3 p-6 rounded-xl border border-border/60 bg-background">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="font-semibold">No Demand Visibility</h3>
                <p className="text-sm text-muted-foreground">
                  Pricing without understanding demand elasticity or seasonality. Over-discounting or underpricing when you could maximize margin.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How We Solve It — Solution */}
        <section id="solution" className="max-w-7xl mx-auto px-4 py-20 w-full scroll-mt-20">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Our Solution
            </div>
            <h2 className="text-3xl font-bold tracking-tight">AI-Powered Pricing That Works for You</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              DPIS replaces guesswork with data. One platform for competitor tracking, demand forecasting, and smart recommendations—so you can price with confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group space-y-4 p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Smart Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered pricing suggestions based on competitor analysis and demand forecasting. Get clear, actionable recommendations—not more data dumps.
              </p>
            </div>

            <div className="group space-y-4 p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Real-Time Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Monitor price trends, demand patterns, and profit projections with interactive dashboards. See what&apos;s happening and why.
              </p>
            </div>

            <div className="group space-y-4 p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                <Workflow className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Automated Pipeline</h3>
              <p className="text-sm text-muted-foreground">
                AI agents handle competitor scraping, demand forecasting, and optimization—so you focus on strategy, not spreadsheets.
              </p>
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={() => setLocation("/case-studies")}
            >
              <Link2 className="w-4 h-4" />
              See Who&apos;s Using DPIS
            </Button>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/40 bg-primary/5 py-20">
          <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to Optimize Your Pricing?
            </h2>
            <p className="text-muted-foreground">
              Join teams that turned pricing from a chore into a competitive advantage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              {!isAuthenticated && (
                <Button
                  size="lg"
                  className="gap-2 h-12 px-8"
                  onClick={() => {
                    const url = getLoginUrl();
                    if (url) window.location.href = url;
                  }}
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8"
                onClick={() => setLocation("/pricing")}
              >
                Compare Plans
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-bold tracking-tight">DPIS</span>
            </div>
            <nav className="flex items-center gap-8 text-sm">
              <button
                onClick={() => setLocation("/#solution")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Solution
              </button>
              <button
                onClick={() => setLocation("/pricing")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => setLocation("/case-studies")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Case Studies
              </button>
            </nav>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            Dynamic Pricing Intelligence System © 2026. Powered by advanced AI optimization.
          </p>
        </div>
      </footer>
    </div>
  );
}
