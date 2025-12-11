-- AlterTable
ALTER TABLE "Subject" ALTER COLUMN "classId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ExamDateSheet" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "examDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "room" TEXT,

    CONSTRAINT "ExamDateSheet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExamDateSheet_examId_idx" ON "ExamDateSheet"("examId");

-- CreateIndex
CREATE INDEX "ExamDateSheet_classId_idx" ON "ExamDateSheet"("classId");

-- CreateIndex
CREATE INDEX "ExamDateSheet_subjectId_idx" ON "ExamDateSheet"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamDateSheet_examId_subjectId_key" ON "ExamDateSheet"("examId", "subjectId");

-- AddForeignKey
ALTER TABLE "ExamDateSheet" ADD CONSTRAINT "ExamDateSheet_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamDateSheet" ADD CONSTRAINT "ExamDateSheet_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamDateSheet" ADD CONSTRAINT "ExamDateSheet_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
