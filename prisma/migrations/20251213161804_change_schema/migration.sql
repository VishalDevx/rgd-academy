/*
  Warnings:

  - A unique constraint covering the columns `[classId,category,sequence]` on the table `Exam` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId,examId,subjectId]` on the table `Result` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `academicSessionId` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Exam` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExamCategory" AS ENUM ('UNIT_TEST', 'HALF_YEARLY', 'ANNUAL');

-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_uploadedBy_fkey";

-- DropIndex
DROP INDEX "Exam_createdById_idx";

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "academicSessionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "category" "ExamCategory" NOT NULL,
ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sequence" INTEGER;

-- CreateTable
CREATE TABLE "AcademicSession" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademicSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Exam_category_idx" ON "Exam"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_classId_category_sequence_key" ON "Exam"("classId", "category", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "Result_studentId_examId_subjectId_key" ON "Result"("studentId", "examId", "subjectId");

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
