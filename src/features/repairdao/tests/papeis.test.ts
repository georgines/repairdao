import { describe, expect, it } from "vitest";
import {
  clientePodeAceitarOrcamento,
  clientePodeConfirmarConclusao,
  clientePodeCriarOrdem,
  ehPapelValido,
  garantirPapelValido,
  papelPodeAbrirDisputa,
  papelPodeAvaliarServico,
  papelPodeCriarProposta,
  papelPodeSacarRecompensa,
  papelPodeVotarEmDisputa,
  papelPodeVotarEmGovernanca,
  tecnicoPodeConcluirOrdem,
  tecnicoPodeEnviarOrcamento,
} from "@/features/repairdao/services/papeis";

describe("papeis", () => {
  it("reconhece papeis validos e invalidos", () => {
    expect(ehPapelValido("cliente")).toBe(true);
    expect(ehPapelValido("qualquer")).toBe(false);
  });

  it("lança erro para papel invalido", () => {
    expect(() => garantirPapelValido("qualquer")).toThrow(/Papel invalido/);
  });

  it("permite cliente criar ordem apenas com deposito ativo", () => {
    expect(clientePodeCriarOrdem({ papel: "cliente", depositoAtivo: true })).toBe(true);
    expect(clientePodeCriarOrdem({ papel: "cliente", depositoAtivo: false })).toBe(false);
    expect(clientePodeCriarOrdem({ papel: "tecnico", depositoAtivo: true })).toBe(false);
  });

  it("permite tecnico enviar orcamento apenas com deposito ativo", () => {
    expect(tecnicoPodeEnviarOrcamento({ papel: "tecnico", depositoAtivo: true })).toBe(true);
    expect(tecnicoPodeEnviarOrcamento({ papel: "tecnico", depositoAtivo: false })).toBe(false);
  });

  it("restringe aceite, confirmacao e conclusao por papel", () => {
    expect(clientePodeAceitarOrcamento({ papel: "cliente", depositoAtivo: true })).toBe(true);
    expect(clientePodeConfirmarConclusao({ papel: "cliente", depositoAtivo: true })).toBe(true);
    expect(tecnicoPodeConcluirOrdem({ papel: "tecnico", depositoAtivo: true })).toBe(true);
    expect(clientePodeAceitarOrcamento({ papel: "tecnico", depositoAtivo: true })).toBe(false);
  });

  it("exige deposito ativo para criar proposta, sacar recompensa e abrir disputa", () => {
    expect(papelPodeCriarProposta({ papel: "votante", depositoAtivo: true })).toBe(true);
    expect(papelPodeSacarRecompensa({ papel: "cliente", depositoAtivo: true })).toBe(true);
    expect(papelPodeAbrirDisputa({ papel: "cliente", depositoAtivo: true })).toBe(true);
    expect(papelPodeAbrirDisputa({ papel: "outsider", depositoAtivo: true })).toBe(false);
  });

  it("permite avaliacao apenas para cliente ou tecnico", () => {
    expect(papelPodeAvaliarServico({ papel: "cliente", depositoAtivo: true })).toBe(true);
    expect(papelPodeAvaliarServico({ papel: "tecnico", depositoAtivo: true })).toBe(true);
    expect(papelPodeAvaliarServico({ papel: "votante", depositoAtivo: true })).toBe(false);
  });

  it("permite votacao em governanca e disputa somente para votante com tokens e sem envolvimento", () => {
    expect(papelPodeVotarEmGovernanca({ papel: "votante", depositoAtivo: true, tokens: 1 })).toBe(true);
    expect(papelPodeVotarEmGovernanca({ papel: "votante", depositoAtivo: true, tokens: 0 })).toBe(false);
    expect(papelPodeVotarEmDisputa({ papel: "votante", depositoAtivo: true, tokens: 1, envolvidoEmDisputa: false })).toBe(true);
    expect(papelPodeVotarEmDisputa({ papel: "votante", depositoAtivo: true, tokens: 1, envolvidoEmDisputa: true })).toBe(false);
  });
});
