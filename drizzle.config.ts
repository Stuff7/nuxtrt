import "dotenv/config";
import type { Config } from "drizzle-kit";

if (!process.env.DB) {
  throw new Error("Missing DB env");
}

export default {
  schema: "server/utils/schema.ts",
  out: "drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DB,
  },
} satisfies Config;
