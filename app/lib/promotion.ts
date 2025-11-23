import { db } from "@/lib/prisma";
import type { Student, Class } from "@prisma/client";

const gradeOrder: string[] = [
  "NURSERY",
  "LKG",
  "UKG",
  "ONE",
  "TWO",
  "THREE",
  "FOUR",
  "FIVE",
  "SIX",
  "SEVEN",
  "EIGHT",
  "NINE",
  "TEN",
];

/**
 * Get next grade in sequence
 */
export function getNextGrade(current: string): string | null {
  const idx = gradeOrder.indexOf(current);
  if (idx === -1 || idx === gradeOrder.length - 1) return null;
  return gradeOrder[idx + 1];
}

/**
 * Promote all active students to the next grade
 */
export async function promoteAllActiveStudents() {
  // Load all classes
  const classes: Class[] = await db.class.findMany();

  // Map classes by grade for quick lookup
  const classByGrade: Record<string, Class[]> = {};
  for (const cls of classes) {
    const key = String(cls.grade);
    if (!classByGrade[key]) classByGrade[key] = [];
    classByGrade[key].push(cls);
  }

  // Fetch active students with their class
  const students: (Student & { class: Class | null })[] =
    await db.student.findMany({
      where: { active: true },
      include: { class: true },
    });

  const updates: Promise<Student>[] = [];

  for (const student of students) {
    const currentGrade = student.class?.grade ?? null;
    if (!currentGrade) continue;

    const nextGrade = getNextGrade(String(currentGrade));
    if (!nextGrade) continue; // Already at terminal grade

    const targetClass = classByGrade[nextGrade]?.[0];
    if (!targetClass) continue; // No class exists for next grade

    updates.push(
      db.student.update({
        where: { id: student.id },
        data: { classId: targetClass.id },
      })
    );
  }

  await Promise.all(updates);

  return { promotedCount: updates.length };
}
