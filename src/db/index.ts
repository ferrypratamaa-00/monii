import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.NODE_ENV === 'development' ? process.env.DATABASE_URL : process.env.POSTGRES_URL;

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});
export const db = drizzle(pool, {
  schema,
  logger: process.env.NODE_ENV === "development",
});
