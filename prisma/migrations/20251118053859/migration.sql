/*
  Warnings:

  - A unique constraint covering the columns `[udiseCode]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `caste` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactNo` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `occupation` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `religion` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `udiseCode` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "caste" TEXT NOT NULL,
ADD COLUMN     "contactNo" TEXT NOT NULL,
ADD COLUMN     "fatherName" TEXT,
ADD COLUMN     "motherName" TEXT,
ADD COLUMN     "occupation" TEXT NOT NULL,
ADD COLUMN     "religion" TEXT NOT NULL,
ADD COLUMN     "udiseCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Student_udiseCode_key" ON "Student"("udiseCode");
