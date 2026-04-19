export { criarRepairTokenGateway } from "@/services/blockchain/gateways/tokenGateway";
export { criarRepairBadgeGateway } from "@/services/blockchain/gateways/badgeGateway";
export { criarRepairDepositGateway } from "@/services/blockchain/gateways/depositGateway";
export { criarRepairReputationGateway } from "@/services/blockchain/gateways/reputationGateway";
export { criarRepairEscrowGateway, criarEthersRepairDAOGateway } from "@/services/blockchain/gateways/escrowGateway";
export { criarRepairGovernanceGateway } from "@/services/blockchain/gateways/governanceGateway";

import { criarRepairTokenGateway } from "@/services/blockchain/gateways/tokenGateway";
import { criarRepairBadgeGateway } from "@/services/blockchain/gateways/badgeGateway";
import { criarRepairDepositGateway } from "@/services/blockchain/gateways/depositGateway";
import { criarRepairReputationGateway } from "@/services/blockchain/gateways/reputationGateway";
import { criarRepairEscrowGateway } from "@/services/blockchain/gateways/escrowGateway";
import { criarRepairGovernanceGateway } from "@/services/blockchain/gateways/governanceGateway";
import type { RepairDAOContractClient } from "@/services/blockchain/contractClient";
import type { RedeBlockchain } from "@/services/blockchain/rpcConfig";

export function criarGatewaysRepairDAO(contractClient: RepairDAOContractClient, rede?: RedeBlockchain) {
  return {
    token: criarRepairTokenGateway(contractClient, rede),
    badge: criarRepairBadgeGateway(contractClient, rede),
    deposit: criarRepairDepositGateway(contractClient, rede),
    reputation: criarRepairReputationGateway(contractClient, rede),
    escrow: criarRepairEscrowGateway(contractClient, rede),
    governance: criarRepairGovernanceGateway(contractClient, rede),
  };
}
