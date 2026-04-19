"use client";

import { useEffect, useState } from "react";
import { NativeSelect } from "@mantine/core";
import {
  assinarMudancaDeRedeNoCliente,
  definirRedeSelecionadaNoCliente,
  normalizarRedeBlockchain,
  obterRedeSelecionadaNoCliente,
  type RedeBlockchain,
} from "@/services/blockchain/rpcConfig";

type OpcaoRede = {
  value: RedeBlockchain;
  label: string;
};

const opcoesRede: OpcaoRede[] = [
  { value: "local", label: "LOCAL" },
  { value: "sepolia", label: "SEPOLIA" },
];

export function NetworkSelector() {
  const [redeSelecionada, setRedeSelecionada] = useState<RedeBlockchain>(() => obterRedeSelecionadaNoCliente());

  useEffect(() => {
    const sincronizar = (rede: RedeBlockchain) => {
      setRedeSelecionada(rede);
    };

    sincronizar(obterRedeSelecionadaNoCliente());

    const limpar = assinarMudancaDeRedeNoCliente(sincronizar);

    return limpar;
  }, []);

  function alterarRede(valor: string | null) {
    const rede = normalizarRedeBlockchain(valor);

    if (rede === redeSelecionada) {
      return;
    }

    setRedeSelecionada(rede);
    definirRedeSelecionadaNoCliente(rede);
  }

  return (
    <NativeSelect
      aria-label="Selecionar rede RPC"
      data={opcoesRede}
      value={redeSelecionada}
      onChange={(event) => alterarRede(event.currentTarget.value)}
      size="xs"
      styles={{
        input: {
          minHeight: 28,
          height: 28,
          paddingInline: 10,
          borderRadius: 6,
          borderColor: "var(--mantine-color-teal-2)",
          backgroundColor: "var(--mantine-color-teal-0)",
          color: "var(--mantine-color-teal-8)",
          fontSize: "var(--mantine-font-size-xs)",
          fontWeight: 700,
          textTransform: "uppercase",
          width: 108,
        },
      }}
    />
  );
}
