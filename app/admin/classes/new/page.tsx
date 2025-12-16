// app/admin/classes/new/page.tsx
import { getServerSession } from "next-auth";
import { authOption } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import NewClassClient from "./neeClassPage";

export default async function Page() {
  const session = await getServerSession(authOption);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return <NewClassClient />;
}
