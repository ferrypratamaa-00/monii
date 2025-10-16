import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: process.env.DB_DIALECT === "sqlite" ? "sqlite" : "postgresql",
  dbCredentials:
    process.env.DB_DIALECT === "sqlite"
      ? { url: "./.data/monii.db" }
      : {
          url: process.env.DATABASE_URL || "", // postgres connection url
        },
  strict: true,
  verbose: true,
});
