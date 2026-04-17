-- CreateTable
CREATE TABLE "UserProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "address" TEXT NOT NULL,
    "searchName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "badgeLevel" TEXT NOT NULL,
    "reputation" INTEGER NOT NULL DEFAULT 0,
    "depositLevel" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isEligible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "syncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserAuditEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "address" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_address_key" ON "UserProfile"("address");

-- CreateIndex
CREATE INDEX "UserProfile_isEligible_reputation_idx" ON "UserProfile"("isEligible", "reputation");

-- CreateIndex
CREATE INDEX "UserProfile_searchName_idx" ON "UserProfile"("searchName");

-- CreateIndex
CREATE INDEX "UserProfile_role_isActive_idx" ON "UserProfile"("role", "isActive");

-- CreateIndex
CREATE INDEX "UserAuditEvent_address_eventType_idx" ON "UserAuditEvent"("address", "eventType");
