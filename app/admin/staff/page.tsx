// app/admin/staff/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { db } from "@/lib/prisma";
import { authOption } from "@/app/lib/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import StaffTable from "@/app/components/StaffTable";

export const dynamic = "force-dynamic";

export default async function AdminStaffPage() {
  const session = await getServerSession(authOption);
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const staff = await db.staff.findMany({
    include: { user: true },
    orderBy: { joinDate: "desc" },
  });

  return (
    <div className="p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <Card className="shadow-xl rounded-xl border border-gray-200">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-800">Staff</CardTitle>
          <Button asChild className="mt-2 md:mt-0 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md hover:shadow-lg">
            <Link href="/admin/staff/new">+ New Staff</Link>
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto rounded-lg border border-gray-200">
          <StaffTable staff={staff} />
        </CardContent>
      </Card>
    </div>
  );
}
