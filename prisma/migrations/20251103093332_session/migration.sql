/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Announcement` table. All the data in the column will be lost.
  - The `status` column on the `Leave` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `salary` on the `Staff` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to drop the `_NotificationToStudent` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[gradeCode]` on the table `Class` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdById` to the `Announcement` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "public"."Announcement" DROP CONSTRAINT "Announcement_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."_NotificationToStudent" DROP CONSTRAINT "_NotificationToStudent_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_NotificationToStudent" DROP CONSTRAINT "_NotificationToStudent_B_fkey";

-- AlterTable
ALTER TABLE "Announcement" DROP COLUMN "createdBy",
ADD COLUMN     "createdById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FeePayment" ADD COLUMN     "paymentMethod" "PaymentMethod";

-- AlterTable
ALTER TABLE "Leave" DROP COLUMN "status",
ADD COLUMN     "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Staff" ALTER COLUMN "salary" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "image" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."_NotificationToStudent";

-- CreateIndex
CREATE UNIQUE INDEX "Class_gradeCode_key" ON "Class"("gradeCode");

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
