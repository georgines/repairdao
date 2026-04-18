-- AlterTable
ALTER TABLE "ServiceRequest" ADD COLUMN "disputedAt" DATETIME;

-- AlterTable
ALTER TABLE "ServiceRequest" ADD COLUMN "disputeReason" TEXT;
