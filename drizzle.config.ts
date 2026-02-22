import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config();
dotenv.config({ path: ".env.local" });

const connectionString =
  process.env.DATABASE_URL ||
  process.env.DATABASE_PUBLIC_URL ||
  process.env.DATABASE_PRIVATE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL, DATABASE_PUBLIC_URL, or DATABASE_PRIVATE_URL is required");
}

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
