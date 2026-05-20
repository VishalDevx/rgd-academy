-- Add monthlyFee column to FeePayment model
ALTER TABLE "FeePayment" ADD COLUMN IF NOT EXISTS "monthlyFee" DECIMAL(12,2);
