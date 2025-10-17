import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: process.env.DB_DIALECT === "sqlite" ? "sqlite" : "postgresql",
  dbCredentials:
    process.env.DB_DIALECT === "sqlite"
      ? { url: "./.data/monii.db" }
      : process.env.NODE_ENV === "production"
      ? {
          host: "aws-1-ap-southeast-1.pooler.supabase.com",
          port: 5432,
          user: "postgres.krbflonlmzjhbewxdqdn",
          password: "6JOfkMYLL5XUUksD",
          database: "postgres",
          ssl: { rejectUnauthorized: false },
        }
      : {
          url: process.env.DATABASE_URL || "",
        },
  strict: true,
  verbose: true,
});
