import type { RepairDAOContractClient } from "@/features/repairdao/services/blockchain/contractClient";
import { criarGatewayContrato } from "@/features/repairdao/services/blockchain/gateways/shared";
import { REPAIRDAO_CONTRACTOS } from "@/features/repairdao/services/blockchain/gateways/contracts";

export function criarRepairTokenGateway(contractClient: RepairDAOContractClient) {
  return criarGatewayContrato(contractClient, REPAIRDAO_CONTRACTOS.token);
}
