import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config();
dotenv.config({ path: ".env.local" });

// Prefer public URL - DATABASE_PRIVATE_URL (postgres.railway.internal) only resolves inside Railway
const connectionString =
  process.env.DATABASE_PUBLIC_URL ||
  process.env.DATABASE_URL ||
  process.env.DATABASE_PRIVATE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL, DATABASE_PUBLIC_URL, or DATABASE_PRIVATE_URL is required");
}
if (connectionString.includes("railway.internal") && !process.env.RAILWAY_ENVIRONMENT) {
  throw new Error(
    "DATABASE_PRIVATE_URL (postgres.railway.internal) is not reachable from your machine. " +
      "For local migrations, set DATABASE_PUBLIC_URL or DATABASE_URL in .env.local to the public connection string from Railway."
  );
}

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
