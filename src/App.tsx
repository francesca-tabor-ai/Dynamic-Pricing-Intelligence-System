import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Package, 
  TrendingUp, 
  Settings, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight,
  Search,
  ChevronRight,
  Database,
  BrainCircuit,
  Calculator,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Product {
  id: number;
  name: string;
  sku: string;
  cost: number;
  current_price: number;
  min_margin: number;
  max_price: number | null;
  stock: number;
  min_competitor_price: number;
  avg_competitor_price: number;
}

interface Intelligence {
  slope: number;
  intercept: number;
  optimalPrice: number;
  expectedProfitAtOptimal: number;
  currentProfit: number;
  elasticity: number;
}

interface ProductDetail extends Product {
  competitors: any[];
  salesHistory: any[];
  intelligence: Intelligence;
}

// --- Components ---

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
  <div className="glass-card p-8">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-slate-50 rounded-2xl">
        <Icon className="w-6 h-6 text-slate-600" />
      </div>
      {trend && (
        <div className={cn(
          "flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider",
          trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-1" />}
          {change}
        </div>
      )}
    </div>
    <div className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">{value}</div>
    <div className="text-sm font-medium text-slate-400">{title}</div>
  </div>
);

export default function App() {
  const [view, setView] = useState<"dashboard" | "products" | "detail">("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}/intelligence`);
      const data = await res.json();
      setProductDetail(data);
      setSelectedProductId(id);
      setView("detail");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async () => {
    setScraping(true);
    try {
      await fetch("/api/scrape", { method: "POST" });
      await fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setScraping(false);
    }
  };

  const updatePrice = async (id: number, price: number) => {
    try {
      await fetch(`/api/products/${id}/update-price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price })
      });
      if (view === "detail") fetchDetail(id);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-50 selection:text-indigo-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-slate-100 z-20">
        <div className="p-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 brand-gradient rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tighter brand-gradient-text">DPIS</span>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => setView("dashboard")}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-semibold transition-all duration-200",
                view === "dashboard" ? "nav-item-active" : "nav-item-inactive"
              )}
            >
              <BarChart3 className="w-5 h-5" />
              Market overview
            </button>
            <button 
              onClick={() => setView("products")}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-semibold transition-all duration-200",
                view === "products" ? "nav-item-active" : "nav-item-inactive"
              )}
            >
              <Package className="w-5 h-5" />
              Product catalog
            </button>
            <button className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-semibold nav-item-inactive transition-all duration-200">
              <Settings className="w-5 h-5" />
              Strategy engine
            </button>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-10">
          <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">System active</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Intelligence engine is monitoring 1.2k data points in real-time.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-72">
        {/* Header */}
        <header className="h-24 bg-white/40 backdrop-blur-xl border-b border-slate-50 flex items-center justify-between px-12 sticky top-0 z-10">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {view === "dashboard" && "Market overview"}
            {view === "products" && "Product catalog"}
            {view === "detail" && productDetail?.name}
          </h1>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="pl-11 pr-6 py-3 bg-slate-50 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all w-72"
              />
            </div>
            <button 
              onClick={handleScrape}
              disabled={scraping}
              className="flex items-center gap-2.5 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
            >
              <RefreshCw className={cn("w-4 h-4", scraping && "animate-spin")} />
              {scraping ? "Syncing..." : "Sync market"}
            </button>
          </div>
        </header>

        <div className="p-12 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {view === "dashboard" && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="space-y-12"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <StatCard title="Total revenue" value="£124,500" change="12.5%" icon={TrendingUp} trend="up" />
                  <StatCard title="Average margin" value="24.2%" change="3.1%" icon={BarChart3} trend="up" />
                  <StatCard title="Price reactions" value="48" change="Last 24h" icon={RefreshCw} />
                  <StatCard title="Inventory value" value="£450,200" change="2.4%" icon={Package} trend="down" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 glass-card p-10">
                    <div className="flex justify-between items-center mb-10">
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900 mb-1">Performance optimization</h3>
                        <p className="text-sm text-slate-400 font-medium">Revenue vs Profit analysis</p>
                      </div>
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200"></div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Revenue</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profit</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { name: "Mon", rev: 4000, prof: 2400 },
                          { name: "Tue", rev: 3000, prof: 1398 },
                          { name: "Wed", rev: 2000, prof: 9800 },
                          { name: "Thu", rev: 2780, prof: 3908 },
                          { name: "Fri", rev: 1890, prof: 4800 },
                          { name: "Sat", rev: 2390, prof: 3800 },
                          { name: "Sun", rev: 3490, prof: 4300 },
                        ]}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} dx={-10} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#fff", borderRadius: "20px", border: "none", boxShadow: "0 20px 50px -12px rgb(0 0 0 / 0.15)", padding: "16px" }}
                          />
                          <Area type="monotone" dataKey="rev" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                          <Area type="monotone" dataKey="prof" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProf)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="glass-card p-10">
                    <h3 className="text-xl font-extrabold text-slate-900 mb-8">Top opportunities</h3>
                    <div className="space-y-8">
                      {products.slice(0, 3).map((p) => (
                        <div key={p.id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all">
                              <Package className="w-6 h-6 text-slate-400" />
                            </div>
                            <div>
                              <div className="text-sm font-extrabold text-slate-900">{p.name}</div>
                              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{p.sku}</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => fetchDetail(p.id)}
                            className="p-2.5 hover:bg-slate-50 rounded-xl transition-all"
                          >
                            <ChevronRight className="w-5 h-5 text-slate-300" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => setView("products")}
                      className="w-full mt-12 py-4 text-sm font-bold text-slate-900 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all"
                    >
                      View all products
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {view === "products" && (
              <motion.div 
                key="products"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card overflow-hidden"
              >
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-50">
                      <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Product</th>
                      <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Current price</th>
                      <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Market avg</th>
                      <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Stock</th>
                      <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/30 transition-all group">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                              <Package className="w-6 h-6 text-slate-400" />
                            </div>
                            <div>
                              <div className="text-sm font-extrabold text-slate-900">{p.name}</div>
                              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{p.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="text-sm font-extrabold text-slate-900">£{p.current_price.toFixed(2)}</div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="text-sm font-bold text-slate-500">£{p.avg_competitor_price?.toFixed(2) || "N/A"}</div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="text-sm font-bold text-slate-500">{p.stock} units</div>
                        </td>
                        <td className="px-10 py-8">
                          <span className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest",
                            p.current_price < p.min_competitor_price ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                          )}>
                            {p.current_price < p.min_competitor_price ? "Competitive" : "Above market"}
                          </span>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <button 
                            onClick={() => fetchDetail(p.id)}
                            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                          >
                            Analyze
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {view === "detail" && productDetail && (
              <motion.div 
                key="detail"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
                  <button onClick={() => setView("products")} className="hover:text-slate-900 transition-colors">Products</button>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-slate-900">{productDetail.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* Left Column: Intelligence & Controls */}
                  <div className="lg:col-span-2 space-y-10">
                    {/* Intelligence Summary */}
                    <div className="glass-card p-12">
                      <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 brand-gradient rounded-2xl text-white shadow-lg shadow-indigo-100">
                          <BrainCircuit className="w-7 h-7" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pricing intelligence</h2>
                          <p className="text-sm font-medium text-slate-400">AI-driven demand elasticity analysis</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Optimal price</div>
                          <div className="text-3xl font-extrabold text-indigo-600 tracking-tight">£{productDetail.intelligence.optimalPrice.toFixed(2)}</div>
                          <div className="text-[11px] font-bold text-slate-500 mt-3 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5" />
                            +{((productDetail.intelligence.optimalPrice / productDetail.current_price - 1) * 100).toFixed(1)}% vs Current
                          </div>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Expected profit</div>
                          <div className="text-3xl font-extrabold text-emerald-600 tracking-tight">£{productDetail.intelligence.expectedProfitAtOptimal.toLocaleString()}</div>
                          <div className="text-[11px] font-bold text-slate-500 mt-3">At optimal price point</div>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Price elasticity</div>
                          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{productDetail.intelligence.elasticity.toFixed(2)}</div>
                          <div className="text-[11px] font-bold text-slate-500 mt-3">
                            {productDetail.intelligence.elasticity > 1 ? "Price sensitive" : "Inelastic"}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="flex items-center justify-between p-6 border border-slate-100 rounded-2xl">
                          <div className="flex items-center gap-4">
                            <Calculator className="w-6 h-6 text-slate-300" />
                            <span className="text-sm font-bold text-slate-600">Current price</span>
                          </div>
                          <span className="text-lg font-extrabold text-slate-900">£{productDetail.current_price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between p-6 bg-indigo-50/50 border border-indigo-100 rounded-3xl">
                          <div className="flex items-center gap-4">
                            <BrainCircuit className="w-6 h-6 text-indigo-600" />
                            <span className="text-sm font-extrabold text-indigo-900">Recommended price</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-lg font-extrabold text-indigo-900">£{productDetail.intelligence.optimalPrice.toFixed(2)}</span>
                            <button 
                              onClick={() => updatePrice(productDetail.id, productDetail.intelligence.optimalPrice)}
                              className="px-8 py-3 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                            >
                              Apply now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sales History Chart */}
                    <div className="glass-card p-12">
                      <h3 className="text-xl font-extrabold text-slate-900 mb-10">Sales performance history</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={productDetail.salesHistory.map(s => ({ 
                            date: new Date(s.timestamp).toLocaleDateString(), 
                            qty: s.quantity,
                            price: s.price 
                          })).reverse()}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} dx={-10} />
                            <Tooltip 
                              cursor={{ fill: '#f8fafc' }}
                              contentStyle={{ backgroundColor: "#fff", borderRadius: "20px", border: "none", boxShadow: "0 20px 50px -12px rgb(0 0 0 / 0.15)", padding: "16px" }}
                            />
                            <Bar dataKey="qty" radius={[6, 6, 0, 0]}>
                              {productDetail.salesHistory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.price > productDetail.cost * 1.5 ? "#6366f1" : "#e2e8f0"} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Competitors & Constraints */}
                  <div className="space-y-10">
                    {/* Competitor Landscape */}
                    <div className="glass-card p-8">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-extrabold text-slate-900">Competitors</h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Real-time</span>
                      </div>
                      <div className="space-y-4">
                        {productDetail.competitors.map((c: any) => (
                          <div key={c.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                                <Search className="w-5 h-5 text-slate-300" />
                              </div>
                              <span className="text-sm font-bold text-slate-700">{c.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-extrabold text-slate-900">£{c.price.toFixed(2)}</div>
                              <div className={cn(
                                "text-[10px] font-bold uppercase tracking-wider mt-0.5",
                                c.price < productDetail.current_price ? "text-rose-500" : "text-emerald-500"
                              )}>
                                {c.price < productDetail.current_price ? "Cheaper" : "Higher"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Business Constraints */}
                    <div className="glass-card p-8">
                      <div className="flex items-center gap-3 mb-8">
                        <ShieldCheck className="w-6 h-6 text-indigo-600" />
                        <h3 className="text-lg font-extrabold text-slate-900">Guardrails</h3>
                      </div>
                      <div className="space-y-5">
                        <div className="p-5 rounded-2xl border border-slate-50 bg-slate-50/30">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Min margin</div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-700">{(productDetail.min_margin * 100).toFixed(0)}%</span>
                            <span className="text-sm font-extrabold text-slate-900">£{(productDetail.cost * (1 + productDetail.min_margin)).toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="p-5 rounded-2xl border border-slate-50 bg-slate-50/30">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Inventory status</div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-700">{productDetail.stock} units</span>
                            <span className={cn(
                              "text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest",
                              productDetail.stock > 20 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            )}>
                              {productDetail.stock > 20 ? "Healthy" : "Low stock"}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {productDetail.stock < 10 && (
                        <div className="mt-8 p-5 bg-rose-50/50 rounded-3xl border border-rose-100 flex gap-4">
                          <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
                          <p className="text-xs font-bold text-rose-700 leading-relaxed uppercase tracking-wider">
                            Low stock detected. Strategy agent recommends price increase to preserve margin.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
