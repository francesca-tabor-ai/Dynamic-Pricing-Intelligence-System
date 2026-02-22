import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { getLoginUrl } from "@/const";
import {
  ArrowRight,
  Zap,
  Check,
  Users,
  Building2,
  Sparkles,
} from "lucide-react";
import { useLocation } from "wouter";

type PlanTier = "individual" | "team" | "enterprise";

const PLANS = {
  individual: {
    name: "Individual",
    icon: Zap,
    description: "For solo pricing managers and small teams",
    baseMonthly: 49,
    baseAnnual: 39,
    productStep: 500,
    productPriceMonthly: 0.02,
    productPriceAnnual: 0.016,
    minProducts: 100,
    maxProducts: 5000,
    features: [
      "Up to 5,000 products",
      "Competitor tracking",
      "AI recommendations",
      "Demand forecasting",
      "Email support",
    ],
  },
  team: {
    name: "Team",
    icon: Users,
    description: "For growing teams collaborating on pricing",
    baseMonthly: 199,
    baseAnnual: 159,
    productStep: 1000,
    productPriceMonthly: 0.015,
    productPriceAnnual: 0.012,
    minProducts: 1000,
    maxProducts: 25000,
    features: [
      "Up to 25,000 products",
      "Everything in Individual",
      "5 team members included",
      "Role-based access",
      "API access",
      "Priority support",
    ],
  },
  enterprise: {
    name: "Enterprise",
    icon: Building2,
    description: "For large organizations with custom needs",
    baseMonthly: 999,
    baseAnnual: 799,
    productStep: 5000,
    productPriceMonthly: 0.008,
    productPriceAnnual: 0.006,
    minProducts: 5000,
    maxProducts: 100000,
    features: [
      "Up to 100,000+ products",
      "Everything in Team",
      "Unlimited team members",
      "SSO & advanced security",
      "Custom integrations",
      "Dedicated success manager",
      "SLA guarantee",
    ],
  },
} as const;

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function Pricing() {
  const [annual, setAnnual] = useState(true);
  const [products, setProducts] = useState<Record<PlanTier, number>>({
    individual: 1000,
    team: 5000,
    enterprise: 20000,
  });
  const [, setLocation] = useLocation();

  const computePrice = (tier: PlanTier) => {
    const plan = PLANS[tier];
    const count = products[tier];
    const base = annual ? plan.baseAnnual : plan.baseMonthly;
    const extra = Math.max(0, count - plan.minProducts);
    const extraPrice =
      Math.ceil(extra / plan.productStep) *
      plan.productStep *
      (annual ? plan.productPriceAnnual : plan.productPriceMonthly);
    return base + extraPrice;
  };

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
              onClick={() => setLocation("/case-studies")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Case Studies
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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-16">
        <section className="text-center space-y-6 max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground">
            Scale with your catalog. Pay only for what you need—with volume discounts built in.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <span className={!annual ? "font-medium" : "text-muted-foreground"}>Monthly</span>
            <Switch checked={annual} onCheckedChange={setAnnual} />
            <span className={annual ? "font-medium" : "text-muted-foreground"}>Annual</span>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Save 20%
            </span>
          </div>
        </section>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {(Object.entries(PLANS) as [PlanTier, (typeof PLANS)[PlanTier]][]).map(
            ([tier, plan]) => {
              const Icon = plan.icon;
              return (
                <div
                  key={tier}
                  className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-200 ${
                    tier === "team"
                      ? "border-primary shadow-lg shadow-primary/10 scale-[1.02] bg-card"
                      : "border-border/60 bg-card/50 hover:border-primary/30"
                  }`}
                >
                  {tier === "team" && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">{plan.name}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                  {/* Product Slider */}
                  <div className="mb-6 space-y-2">
                    <label className="text-sm font-medium">
                      Products:{" "}
                      <span className="text-primary">{products[tier].toLocaleString()}</span>
                    </label>
                    <Slider
                      value={[products[tier]]}
                      onValueChange={([v]) =>
                        setProducts((p) => ({ ...p, [tier]: v ?? plan.minProducts }))
                      }
                      min={plan.minProducts}
                      max={plan.maxProducts}
                      step={plan.productStep}
                    />
                    <p className="text-xs text-muted-foreground">
                      {plan.minProducts.toLocaleString()} – {plan.maxProducts.toLocaleString()}
                    </p>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">{formatPrice(computePrice(tier))}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>

                  <ul className="space-y-3 flex-1 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full gap-2"
                    variant={tier === "team" ? "default" : "outline"}
                    onClick={() => {
                      const url = getLoginUrl();
                      if (url) window.location.href = url;
                    }}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              );
            }
          )}
        </div>

        {/* FAQ or Trust */}
        <section className="text-center py-12 border-t border-border/40">
          <p className="text-muted-foreground text-sm">
            All plans include a 14-day free trial. No credit card required.
          </p>
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
