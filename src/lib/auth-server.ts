import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "secret"; // in production, use strong secret

export async function auth() {
  const c = await cookies();
  const token = c.get("session")?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    return { user: { id: payload.userId.toString() } };
  } catch {
    return null;
  }
}
