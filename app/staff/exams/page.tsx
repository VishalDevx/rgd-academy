import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { authOption } from "@/app/lib/auth";    
export default async function StaffExamsPage() {

    const session = await getServerSession(authOption);

    if (!session?.user || session.user.role !== "STAFF") {
      redirect("/login");
    }

    // STAFF record
    const staff = await db.staff.findUnique({
      where: { userId: session.user.id },
    });

    if (!staff) {
      return (
        <div className="p-6">
          <div className="border p-6 text-center text-muted-foreground rounded">
            No staff record found.
          </div>
        </div>
      );
    }
    const classAssined = await db.class.findMany({
      where: { teacherId: staff.id },
      include: {
        students: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // ---FIX: Guarantee classes is always an array ---
    const safeClasses = Array.isArray(classAssined) ? classAssined : [];

    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Exams Management</h1>
        <p>Welcome, {session.user.name ?? "Staff"}!</p>
        <p>You are assigned to {safeClasses.length} classes.</p>
        {/* Further UI components for managing exams can be added here */}
      </div>
    );
}