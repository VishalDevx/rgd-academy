import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import StudentForm from "@/app/components/StudentForm";

export default async function EditStudentPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const student = await db.student.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!student) return notFound();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Student: {student.user.name}</h1>
      <StudentForm student={student} />
    </div>
  );
}
