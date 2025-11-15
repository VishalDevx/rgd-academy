import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/prisma";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";

export default async function StaffClassesPage() {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== "STAFF") {
    redirect("/login");
  }

  // fetch staff classes + subjects
  const classes = await db.class.findMany({
    where: { teacherId: session.user.id },
    include: {
      subjects: true,
      students: true,
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Classes</h1>
        <p className="text-sm text-muted-foreground">
          {session.user.name}
        </p>
      </div>

      {/* No Classes assigned */}
      {classes.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center text-muted-foreground">
            You are not assigned to any class yet.
          </CardContent>
        </Card>
      )}

      {/* Classes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <Card key={cls.id} className="hover:shadow-sm transition">
            <CardHeader>
              <CardTitle>
                {cls.name}{" "}
                <Badge variant="secondary" className="ml-2">
                  {cls.grade}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Section:</span>{" "}
                {cls.section || "N/A"}
              </p>

              <p className="text-sm">
                <span className="font-medium">Students:</span>{" "}
                {cls.students.length}
              </p>

              <div>
                <p className="font-medium text-sm mb-1">Subjects:</p>
                <div className="flex flex-wrap gap-1">
                  {cls.subjects.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      No subjects assigned
                    </span>
                  )}
                  {cls.subjects.map((subj) => (
                    <Badge key={subj.id} variant="outline">
                      {subj.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
