/*
  Warnings:

  - Added the required column `adharNo` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dob` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adharNo" TEXT NOT NULL,
ADD COLUMN     "dob" TEXT NOT NULL;
