import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import ProtectedLayoutClient from "@/components/app/ProtectedLayoutClient";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getCurrentUser();
  if (!userId) {
    redirect("/login");
  }

  return <ProtectedLayoutClient>{children}</ProtectedLayoutClient>;
}
