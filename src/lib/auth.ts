import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { useState, useEffect } from 'react';

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

export function useAuth() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, we'll assume user is logged in if there's a session cookie
    // In a real app, you'd validate the session on the client side
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { user, loading };
}
