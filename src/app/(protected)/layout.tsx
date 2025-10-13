import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getCurrentUser();
  if (!userId) {
    redirect("/login");
  }

  return <>{children}</>;
}
