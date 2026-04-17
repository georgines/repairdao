-- CreateEnum
CREATE TYPE "ServiceRequestStatus" AS ENUM ('ABERTA', 'ACEITA', 'ORCADA');

-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientAddress" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "technicianAddress" TEXT NOT NULL,
    "technicianName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ServiceRequestStatus" NOT NULL DEFAULT 'ABERTA',
    "budgetAmount" INTEGER,
    "acceptedAt" DATETIME,
    "budgetSentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "ServiceRequest_clientAddress_status_idx" ON "ServiceRequest"("clientAddress", "status");

-- CreateIndex
CREATE INDEX "ServiceRequest_technicianAddress_status_idx" ON "ServiceRequest"("technicianAddress", "status");
