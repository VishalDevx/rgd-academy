import { db } from "@/lib/prisma";

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

export function getNextGrade(current: string): string | null {
  const idx = gradeOrder.indexOf(current);
  if (idx === -1 || idx === gradeOrder.length - 1) return null;
  return gradeOrder[idx + 1];
}

export async function promoteAllActiveStudents() {
  // Load classes by grade to map next grade target classes
  const classes = await db.class.findMany();
  const classByGrade: Record<string, { id: string; name: string }[]> = {};
  for (const cls of classes) {
    const key = String(cls.grade);
    if (!classByGrade[key]) classByGrade[key] = [];
    classByGrade[key].push({ id: cls.id, name: cls.name });
  }

  // For determinism, choose first class in next grade list if multiple
  const students = await db.student.findMany({ where: { active: true }, include: { class: true } } as any);

  const updates: Array<Promise<any>> = [];
  for (const s of students) {
    const currentGrade = s.class?.grade ? String(s.class.grade) : null;
    if (!currentGrade) continue;
    const next = getNextGrade(currentGrade);
    if (!next) continue; // Reached terminal grade
    const targetClass = classByGrade[next]?.[0];
    if (!targetClass) continue; // No class defined for next grade
    updates.push(db.student.update({ where: { id: s.id }, data: { classId: targetClass.id } }));
  }

  await Promise.all(updates);
  return { promotedCount: updates.length };
}


