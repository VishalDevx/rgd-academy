import { authOption } from "@/app/lib/auth";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function StaffResultsPage() {
  const session = await getServerSession(authOption);

  if (!session?.user || session.user.role !== "STAFF") {
    redirect("/login");
  }

  const staffUser = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      staff: true,
    },
  });

  if (!staffUser || !staffUser.staff) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
          No staff record found.
        </div>
      </div>
    );
  }
  const classes = await db.class.findMany({
    where: { teacherId: staffUser.id },
    include: {
      students: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
  });
 const safeClasses = Array.isArray(classes) ? classes : [];
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Results</h1>

      <div className="rounded-lg border p-4 space-y-1">
        <p className="text-sm text-muted-foreground">Staff Name</p>
        <p className="font-medium">{staffUser.name}</p>

        <p className="text-sm text-muted-foreground mt-2">Designation</p>
        <p className="font-medium">{staffUser.staff.designation}</p>
      </div>
    </div>
  );
}
