/*
  Warnings:

  - A unique constraint covering the columns `[examId,subjectId,classId]` on the table `ExamDateSheet` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ExamDateSheet_examId_subjectId_key";

-- CreateIndex
CREATE UNIQUE INDEX "ExamDateSheet_examId_subjectId_classId_key" ON "ExamDateSheet"("examId", "subjectId", "classId");
