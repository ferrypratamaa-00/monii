import { drizzle } from "drizzle-orm/node-postgres";
import { Pool as NeonPool } from "@neondatabase/serverless";
import { Pool as PgPool } from "pg";
import * as schema from "./schema";

const isProduction = process.env.NODE_ENV === 'production';
const connectionString = isProduction ? process.env.DATABASE_URL : process.env.LOCAL_DATABASE_URL;

if (!connectionString) {
  throw new Error("Database connection string not found. Please set DATABASE_URL or LOCAL_DATABASE_URL.");
}

// Use Neon Pool for production, regular pg Pool for development
const pool = isProduction 
  ? new NeonPool({
      connectionString,
    })
  : new PgPool({
      connectionString,
    });

export const db = drizzle(pool, {
  schema,
  logger: process.env.NODE_ENV === "development",
});
