ALTER TABLE "DepositConfiguration" ADD COLUMN "tokenContractAddress" TEXT NOT NULL DEFAULT '';
ALTER TABLE "DepositConfiguration" ADD COLUMN "tokenOwnerAddress" TEXT NOT NULL DEFAULT '';
ALTER TABLE "DepositConfiguration" ADD COLUMN "tokensPerEthRaw" TEXT NOT NULL DEFAULT '0';
ALTER TABLE "DepositConfiguration" ADD COLUMN "tokensPerEth" TEXT NOT NULL DEFAULT '0';
