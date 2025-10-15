import { redirect } from "next/navigation";

export default function HomePage() {
  console.log("HomePage component rendered, redirecting to login...");
  redirect("/login");
}
