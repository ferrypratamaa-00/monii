import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

const connectionString = process.env.NODE_ENV === 'production' ? process.env.DATABASE_URL : process.env.LOCAL_DATABASE_URL;

if (!connectionString) {
  throw new Error("Database connection string not found. Please set DATABASE_URL or LOCAL_DATABASE_URL.");
}

const pool = new Pool({
  connectionString,
});
export const db = drizzle(pool, {
  schema,
  logger: process.env.NODE_ENV === "development",
});
