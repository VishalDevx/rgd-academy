/*
  Warnings:

  - Added the required column `transaction` to the `Expense` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CREDIT', 'DEBIT');

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "transaction" "TransactionType" NOT NULL;
