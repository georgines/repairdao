import type { RepairDAOContractClient } from "@/services/blockchain/contractClient";
import { criarGatewayContrato } from "@/services/blockchain/gateways/shared";
import { obterRepairDAOContractos } from "@/services/blockchain/gateways/contracts";
import type { RedeBlockchain } from "@/services/blockchain/rpcConfig";

export function criarRepairGovernanceGateway(contractClient: RepairDAOContractClient, rede?: RedeBlockchain) {
  return criarGatewayContrato(contractClient, obterRepairDAOContractos(rede).governance);
}
