import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.NODE_ENV === "production"
        ? process.env.DATABASE_URL!
        : process.env.LOCAL_DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});
