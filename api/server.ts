import "dotenv/config";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Security headers
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// OAuth callback routes (/api/oauth/callback, logout via tRPC)
registerOAuthRoutes(app);

// tRPC API (/api/trpc/*)
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app;
