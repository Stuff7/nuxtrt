/* eslint-disable no-console */
import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

(async () => {
  if (!process.env.DB) {
    throw new Error("Missing DB env");
  }

  const queryClient = postgres(process.env.DB, { max: 1 });
  const db = drizzle(queryClient);
  await migrate(db, { migrationsFolder: "drizzle" });
  await queryClient.end();
})().then(() => console.log("Done!"));
