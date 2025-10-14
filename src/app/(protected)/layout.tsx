import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getCurrentUser();
  if (!userId) {
    redirect("/login");
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
}
