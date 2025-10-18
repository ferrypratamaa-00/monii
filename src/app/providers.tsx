"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { useState } from "react";
import { AuthProvider } from "@/components/AuthProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <ReactQueryStreamedHydration>
        <AuthProvider>{children}</AuthProvider>
      </ReactQueryStreamedHydration>
    </QueryClientProvider>
  );
}
