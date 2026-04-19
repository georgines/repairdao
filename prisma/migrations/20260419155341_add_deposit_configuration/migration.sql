-- CreateTable
CREATE TABLE "DepositConfiguration" (
    "network" TEXT NOT NULL PRIMARY KEY,
    "contractAddress" TEXT NOT NULL,
    "ownerAddress" TEXT NOT NULL,
    "minDepositRaw" TEXT NOT NULL,
    "minDeposit" TEXT NOT NULL,
    "syncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
