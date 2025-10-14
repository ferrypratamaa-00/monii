import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import Navigation from "@/components/app/Navigation";
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

  return (
    <ErrorBoundary>
      <Navigation />
      {children}
    </ErrorBoundary>
  );
}
