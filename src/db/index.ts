import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.NODE_ENV === 'development' ? process.env.DATABASE_URL : process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error(`Database connection string not found. NODE_ENV: ${process.env.NODE_ENV}, DATABASE_URL: ${!!process.env.DATABASE_URL}, POSTGRES_URL: ${!!process.env.POSTGRES_URL}`);
}

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('POSTGRES_URL:', process.env.POSTGRES_URL);
console.log('Connection String:', connectionString);

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});
export const db = drizzle(pool, {
  schema,
  logger: process.env.NODE_ENV === "development",
});
