import type { RepairDAOContractClient } from "@/services/blockchain/contractClient";
import { criarGatewayContrato } from "@/services/blockchain/gateways/shared";
import { REPAIRDAO_CONTRACTOS } from "@/services/blockchain/gateways/contracts";

export function criarRepairTokenGateway(contractClient: RepairDAOContractClient) {
  return criarGatewayContrato(contractClient, REPAIRDAO_CONTRACTOS.token);
}
