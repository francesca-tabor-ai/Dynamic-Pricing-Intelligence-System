import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { ArrowRight, Zap, Quote } from "lucide-react";
import { useLocation } from "wouter";

const LOGOS = [
  "TechRetail",
  "CommerceFlow",
  "PriceSmart",
  "MarketPulse",
  "EdgeCommerce",
  "PivotPricing",
  "ScaleSell",
  "OptiMart",
  "DataDriven",
  "RevLogic",
  "MarginMax",
  "CartIQ",
];

const CASE_STUDIES = [
  {
    company: "TechRetail",
    role: "VP of Revenue",
    quote:
      "We were leaving 15% margin on the table with manual pricing. DPIS automated competitor tracking and demand forecasts—we saw a 12% revenue lift in the first quarter.",
    metric: "12% revenue lift",
    metricLabel: "in Q1",
  },
  {
    company: "CommerceFlow",
    role: "Pricing Manager",
    quote:
      "Managing 8,000 SKUs across three marketplaces was a nightmare. The AI pipeline runs daily—we get recommendations, approve in bulk, and our team spends time on strategy instead of spreadsheets.",
    metric: "8,000 SKUs",
    metricLabel: "automated",
  },
  {
    company: "PriceSmart",
    role: "Head of E‑commerce",
    quote:
      "Competitor price wars were killing our margins. DPIS gave us real-time visibility and elasticity modeling. We now respond in hours, not days, and protect margin without losing share.",
    metric: "3x faster",
    metricLabel: "price updates",
  },
];

function ScrollingLogos() {
  const doubled = [...LOGOS, ...LOGOS];
  return (
    <div className="relative w-full overflow-hidden py-8">
      <div className="flex animate-scroll-left">
        {doubled.map((name, i) => (
          <div
            key={`${name}-${i}`}
            className="flex-shrink-0 mx-8 px-6 py-3 rounded-xl border border-border/60 bg-card/50 text-muted-foreground font-semibold text-lg whitespace-nowrap"
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CaseStudies() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setLocation("/")}
          >
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
          </nav>
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
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 py-16 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Trusted by Teams Who Price Smarter
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how retailers and e‑commerce teams use DPIS to increase revenue, protect margins, and automate pricing at scale.
          </p>
        </section>

        {/* Scrolling Logos */}
        <section className="border-y border-border/40 bg-muted/20">
          <p className="text-center text-sm font-medium text-muted-foreground pt-6 pb-2">
            Companies using DPIS
          </p>
          <ScrollingLogos />
        </section>

        {/* Case Studies */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="space-y-16">
            {CASE_STUDIES.map((study, i) => (
              <div
                key={study.company}
                className="flex flex-col md:flex-row gap-10 items-start"
              >
                <div
                  className={`md:w-1/2 ${i % 2 === 1 ? "md:order-2" : ""}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {study.company[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{study.company}</h2>
                      <p className="text-sm text-muted-foreground">{study.role}</p>
                    </div>
                  </div>
                  <blockquote className="text-lg text-muted-foreground leading-relaxed">
                    <Quote className="w-8 h-8 text-primary/40 mb-2" />
                    {study.quote}
                  </blockquote>
                </div>
                <div
                  className={`md:w-1/2 flex items-center justify-center ${i % 2 === 1 ? "md:order-1" : ""}`}
                >
                  <div className="text-center p-8 rounded-2xl border border-primary/20 bg-primary/5">
                    <div className="text-4xl font-bold text-primary">
                      {study.metric}
                    </div>
                    <div className="text-muted-foreground mt-1">{study.metricLabel}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/40 bg-primary/5 py-16">
          <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Ready to Join Them?
            </h2>
            <p className="text-muted-foreground">
              Start your free trial and see the impact in two weeks.
            </p>
            <Button
              size="lg"
              className="gap-2"
              onClick={() => {
                const url = getLoginUrl();
                if (url) window.location.href = url;
              }}
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 bg-muted/30 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Dynamic Pricing Intelligence System © 2026.</p>
        </div>
      </footer>
    </div>
  );
}
