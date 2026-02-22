import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("pricing.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    cost REAL NOT NULL,
    current_price REAL NOT NULL,
    min_margin REAL DEFAULT 0.15,
    max_price REAL,
    stock INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS competitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS sales_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id)
  );
`);

// Seed Data if empty
const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  const insertProduct = db.prepare("INSERT INTO products (name, sku, cost, current_price, stock) VALUES (?, ?, ?, ?, ?)");
  const insertCompetitor = db.prepare("INSERT INTO competitors (product_id, name, price) VALUES (?, ?, ?)");
  const insertSale = db.prepare("INSERT INTO sales_history (product_id, price, quantity, timestamp) VALUES (?, ?, ?, ?)");

  const products = [
    { name: "UltraBook Pro 15", sku: "UB-PRO-15", cost: 800, current_price: 1200, stock: 45 },
    { name: "NoiseCancel Headphones", sku: "NC-HP-01", cost: 120, current_price: 250, stock: 120 },
    { name: "SmartWatch Series 5", sku: "SW-S5", cost: 150, current_price: 299, stock: 80 }
  ];

  products.forEach(p => {
    const result = insertProduct.run(p.name, p.sku, p.cost, p.current_price, p.stock);
    const productId = result.lastInsertRowid;

    // Seed competitors
    insertCompetitor.run(productId, "Amazon", p.current_price * 0.95);
    insertCompetitor.run(productId, "BestBuy", p.current_price * 1.02);

    // Seed sales history (simulating demand curve)
    // We'll seed a few points to allow "elasticity" calculation
    const basePrice = p.current_price;
    const variations = [
      { p: basePrice * 1.1, q: 10, daysAgo: 30 },
      { p: basePrice * 1.05, q: 15, daysAgo: 20 },
      { p: basePrice * 1.0, q: 25, daysAgo: 10 },
      { p: basePrice * 0.95, q: 40, daysAgo: 5 },
      { p: basePrice * 0.9, q: 60, daysAgo: 1 }
    ];

    variations.forEach(v => {
      const date = new Date();
      date.setDate(date.getDate() - v.daysAgo);
      insertSale.run(productId, v.p, v.q, date.toISOString());
    });
  });
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- API Routes ---

  // Get all products with their latest competitor data
  app.get("/api/products", (req, res) => {
    const products = db.prepare(`
      SELECT p.*, 
             (SELECT MIN(price) FROM competitors WHERE product_id = p.id) as min_competitor_price,
             (SELECT AVG(price) FROM competitors WHERE product_id = p.id) as avg_competitor_price
      FROM products p
    `).all();
    res.json(products);
  });

  // Get detailed product intelligence
  app.get("/api/products/:id/intelligence", (req, res) => {
    const productId = req.params.id;
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(productId) as any;
    
    if (!product) return res.status(404).json({ error: "Product not found" });

    const competitors = db.prepare("SELECT * FROM competitors WHERE product_id = ?").all(productId);
    const sales = db.prepare("SELECT * FROM sales_history WHERE product_id = ? ORDER BY timestamp DESC").all(productId);

    // --- Demand Forecast Agent Logic ---
    // Simple linear regression: Quantity = a * Price + b
    // We'll use the seeded sales history
    const dataPoints = sales.map((s: any) => ({ x: s.price, y: s.quantity }));
    
    let slope = 0;
    let intercept = 0;
    
    if (dataPoints.length > 1) {
      const n = dataPoints.length;
      const sumX = dataPoints.reduce((acc, p) => acc + p.x, 0);
      const sumY = dataPoints.reduce((acc, p) => acc + p.y, 0);
      const sumXY = dataPoints.reduce((acc, p) => acc + p.x * p.y, 0);
      const sumXX = dataPoints.reduce((acc, p) => acc + p.x * p.x, 0);
      
      slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      intercept = (sumY - slope * sumX) / n;
    }

    // --- Optimization Agent Logic ---
    // Profit(P) = (P - Cost) * (slope * P + intercept)
    // Profit(P) = slope*P^2 + (intercept - slope*Cost)*P - intercept*Cost
    // Maximize by finding vertex of parabola: P = -b / 2a
    // a = slope, b = intercept - slope * Cost
    
    let optimalPrice = product.current_price;
    if (slope < 0) { // Only if demand decreases with price
      optimalPrice = -(intercept - slope * product.cost) / (2 * slope);
    }

    // --- Strategy Agent Logic ---
    const minAllowed = product.cost * (1 + product.min_margin);
    if (optimalPrice < minAllowed) optimalPrice = minAllowed;
    if (product.max_price && optimalPrice > product.max_price) optimalPrice = product.max_price;

    // Competitor undercut rule (optional override)
    const minCompetitor = Math.min(...competitors.map((c: any) => c.price));
    if (optimalPrice > minCompetitor && minCompetitor > minAllowed) {
        // If our "optimal" is higher than cheapest competitor, maybe we should match or undercut slightly
        // but let's stick to the math for now and just flag it.
    }

    res.json({
      product,
      competitors,
      salesHistory: sales,
      intelligence: {
        slope,
        intercept,
        optimalPrice: Math.round(optimalPrice * 100) / 100,
        expectedProfitAtOptimal: Math.round((optimalPrice - product.cost) * (slope * optimalPrice + intercept)),
        currentProfit: Math.round((product.current_price - product.cost) * (slope * product.current_price + intercept)),
        elasticity: Math.abs(slope * (product.current_price / (slope * product.current_price + intercept)))
      }
    });
  });

  app.post("/api/products/:id/update-price", (req, res) => {
    const { price } = req.body;
    db.prepare("UPDATE products SET current_price = ? WHERE id = ?").run(price, req.params.id);
    res.json({ success: true });
  });

  // Simulate Scraper Agent
  app.post("/api/scrape", (req, res) => {
    const products = db.prepare("SELECT id, current_price FROM products").all() as any[];
    const names = ["Amazon", "eBay", "Walmart", "Target", "BestBuy"];
    
    products.forEach(p => {
      const competitorName = names[Math.floor(Math.random() * names.length)];
      // Random price variation +/- 10%
      const newPrice = p.current_price * (0.9 + Math.random() * 0.2);
      
      // Update or insert competitor price
      const existing = db.prepare("SELECT id FROM competitors WHERE product_id = ? AND name = ?").get(p.id, competitorName) as any;
      if (existing) {
        db.prepare("UPDATE competitors SET price = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?").run(newPrice, existing.id);
      } else {
        db.prepare("INSERT INTO competitors (product_id, name, price) VALUES (?, ?, ?)").run(p.id, competitorName, newPrice);
      }
    });
    
    res.json({ success: true, message: "Scrape completed" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
