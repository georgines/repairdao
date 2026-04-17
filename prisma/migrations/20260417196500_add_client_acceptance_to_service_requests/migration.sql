-- AlterEnum
ALTER TYPE "ServiceRequestStatus" ADD VALUE 'ACEITO_CLIENTE';

-- AlterTable
ALTER TABLE "ServiceRequest" ADD COLUMN "clientAcceptedAt" DATETIME;
