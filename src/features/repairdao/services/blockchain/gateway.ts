export { criarRepairTokenGateway } from "@/features/repairdao/services/blockchain/gateways/tokenGateway";
export { criarRepairBadgeGateway } from "@/features/repairdao/services/blockchain/gateways/badgeGateway";
export { criarRepairDepositGateway } from "@/features/repairdao/services/blockchain/gateways/depositGateway";
export { criarRepairReputationGateway } from "@/features/repairdao/services/blockchain/gateways/reputationGateway";
export { criarRepairEscrowGateway, criarEthersRepairDAOGateway } from "@/features/repairdao/services/blockchain/gateways/escrowGateway";
export { criarRepairGovernanceGateway } from "@/features/repairdao/services/blockchain/gateways/governanceGateway";

import { criarRepairTokenGateway } from "@/features/repairdao/services/blockchain/gateways/tokenGateway";
import { criarRepairBadgeGateway } from "@/features/repairdao/services/blockchain/gateways/badgeGateway";
import { criarRepairDepositGateway } from "@/features/repairdao/services/blockchain/gateways/depositGateway";
import { criarRepairReputationGateway } from "@/features/repairdao/services/blockchain/gateways/reputationGateway";
import { criarRepairEscrowGateway } from "@/features/repairdao/services/blockchain/gateways/escrowGateway";
import { criarRepairGovernanceGateway } from "@/features/repairdao/services/blockchain/gateways/governanceGateway";
import type { RepairDAOContractClient } from "@/features/repairdao/services/blockchain/contractClient";

export function criarGatewaysRepairDAO(contractClient: RepairDAOContractClient) {
  return {
    token: criarRepairTokenGateway(contractClient),
    badge: criarRepairBadgeGateway(contractClient),
    deposit: criarRepairDepositGateway(contractClient),
    reputation: criarRepairReputationGateway(contractClient),
    escrow: criarRepairEscrowGateway(contractClient),
    governance: criarRepairGovernanceGateway(contractClient),
  };
}
