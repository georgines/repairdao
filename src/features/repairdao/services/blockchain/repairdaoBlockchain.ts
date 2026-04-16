import { RepairDAODominioError } from "@/features/repairdao/errors";
import { clientePodeCriarOrdem, papelPodeAbrirDisputa, tecnicoPodeEnviarOrcamento } from "@/features/repairdao/services/papeis";
import { garantirOrdemPodeSerCriada } from "@/features/repairdao/services/ordens";
import { garantirTextoNaoVazio, garantirNumeroMaiorQueZero } from "@/features/repairdao/services/validacoes";
import type { ContextoPapelRepairDAO } from "@/features/repairdao";
import { mapearDisputaDoContrato, mapearOrdemDoContrato, type DisputaContratoBruta, type DisputaContratoDominio, type OrdemContratoBruta, type OrdemContratoDominio } from "@/features/repairdao/services/blockchain/adapters";

export interface RepairDAOBlockchainGateway {
  criarOrdem(input: { descricao: string; cliente: string }): Promise<unknown>;
  enviarOrcamento(input: { ordemId: bigint | number | string; tecnico: string; valor: number }): Promise<unknown>;
  abrirDisputa(input: { ordemId: bigint | number | string; autor: string; motivo: string }): Promise<unknown>;
  buscarOrdem(ordemId: bigint | number | string): Promise<OrdemContratoBruta | null>;
  buscarDisputa(disputaId: bigint | number | string): Promise<DisputaContratoBruta | null>;
}

export interface CriarOrdemBlockchainInput {
  contexto: ContextoPapelRepairDAO;
  descricao: string;
  cliente: string;
}

export interface EnviarOrcamentoBlockchainInput {
  contexto: ContextoPapelRepairDAO;
  ordemId: bigint | number | string;
  tecnico: string;
  valor: number;
}

export interface AbrirDisputaBlockchainInput {
  contexto: ContextoPapelRepairDAO;
  ordemId: bigint | number | string;
  autor: string;
  motivo: string;
}

export interface RepairDAOBlockchain {
  criarOrdem(input: CriarOrdemBlockchainInput): Promise<unknown>;
  enviarOrcamento(input: EnviarOrcamentoBlockchainInput): Promise<unknown>;
  abrirDisputa(input: AbrirDisputaBlockchainInput): Promise<unknown>;
  buscarOrdem(ordemId: bigint | number | string): Promise<OrdemContratoDominio | null>;
  buscarDisputa(disputaId: bigint | number | string): Promise<DisputaContratoDominio | null>;
}

function criarErroDePermissao(acao: string): RepairDAODominioError {
  return new RepairDAODominioError("acao_nao_permitida", `A acao ${acao} nao e permitida para o contexto informado.`);
}

export function criarRepairDAOBlockchain(gateway: RepairDAOBlockchainGateway): RepairDAOBlockchain {
  return {
    async criarOrdem(input) {
      if (!clientePodeCriarOrdem(input.contexto)) {
        throw criarErroDePermissao("criar ordem");
      }

      const descricao = garantirOrdemPodeSerCriada(input.descricao);
      return gateway.criarOrdem({ descricao, cliente: input.cliente });
    },

    async enviarOrcamento(input) {
      if (!tecnicoPodeEnviarOrcamento(input.contexto)) {
        throw criarErroDePermissao("enviar orcamento");
      }

      const valor = garantirNumeroMaiorQueZero(input.valor, "valor do orcamento");

      return gateway.enviarOrcamento({
        ordemId: input.ordemId,
        tecnico: input.tecnico,
        valor,
      });
    },

    async abrirDisputa(input) {
      if (!papelPodeAbrirDisputa(input.contexto)) {
        throw criarErroDePermissao("abrir disputa");
      }

      const motivo = garantirTextoNaoVazio(input.motivo, "motivo da disputa");
      return gateway.abrirDisputa({
        ordemId: input.ordemId,
        autor: input.autor,
        motivo,
      });
    },

    async buscarOrdem(ordemId) {
      const ordem = await gateway.buscarOrdem(ordemId);

      if (!ordem) {
        return null;
      }

      return mapearOrdemDoContrato(ordem);
    },

    async buscarDisputa(disputaId) {
      const disputa = await gateway.buscarDisputa(disputaId);

      if (!disputa) {
        return null;
      }

      return mapearDisputaDoContrato(disputa);
    },
  };
}