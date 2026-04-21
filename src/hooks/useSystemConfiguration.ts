"use client";

import { useEffect, useMemo, useState } from "react";
import { useSystemConfigurationAccess } from "@/hooks/useSystemConfigurationAccess";
import {
	atualizarMinDepositNoContrato,
	atualizarTokensPerEthNoContrato,
} from "@/services/system/systemConfigurationClient";
import { obterEthereumProvider } from "@/services/wallet/provider";

type UseSystemConfigurationResult = ReturnType<typeof useSystemConfigurationAccess> & {
	minDeposit: string;
	editingMinDeposit: string;
	savingMinDeposit: boolean;
	minDepositError: string | null;
	tokensPerEth: string;
	editingTokensPerEth: string;
	savingTokensPerEth: boolean;
	tokensPerEthError: string | null;
	setEditingMinDeposit: (value: string) => void;
	setEditingTokensPerEth: (value: string) => void;
	submitMinDeposit: () => Promise<void>;
	submitTokensPerEth: () => Promise<void>;
};

export function useSystemConfiguration(): UseSystemConfigurationResult {
	const access = useSystemConfigurationAccess();
	const ethereum = useMemo(() => obterEthereumProvider(), []);
	const [editingMinDeposit, setEditingMinDeposit] = useState("");
	const [editingTokensPerEth, setEditingTokensPerEth] = useState("");
	const [savingMinDeposit, setSavingMinDeposit] = useState(false);
	const [savingTokensPerEth, setSavingTokensPerEth] = useState(false);
	const [minDepositError, setMinDepositError] = useState<string | null>(null);
	const [tokensPerEthError, setTokensPerEthError] = useState<string | null>(null);

	const minDeposit = access.configuracao?.minDeposit ?? "0";
	const tokensPerEth = access.configuracao?.tokensPerEth ?? "0";

	useEffect(() => {
		if (access.configuracao && editingMinDeposit === "") {
			setEditingMinDeposit(access.configuracao.minDeposit);
		}
	}, [access.configuracao, editingMinDeposit]);

	useEffect(() => {
		if (access.configuracao && editingTokensPerEth === "") {
			setEditingTokensPerEth(access.configuracao.tokensPerEth);
		}
	}, [access.configuracao, editingTokensPerEth]);

	async function submitMinDeposit() {
		if (!ethereum || !access.connected) {
			setMinDepositError("Conecte a carteira para criar a proposta do deposito minimo.");
			return;
		}

		if (!access.canCreateProposal) {
			setMinDepositError("Somente uma carteira com deposito ativo ou o dono do contrato pode criar a proposta do deposito minimo.");
			return;
		}

		const valor = editingMinDeposit.trim();

		if (!valor) {
			setMinDepositError("Informe o valor do deposito minimo.");
			return;
		}

		setSavingMinDeposit(true);
		setMinDepositError(null);

		try {
			await atualizarMinDepositNoContrato(ethereum, valor);
			const dadosAtualizados = await access.refresh();
			setEditingMinDeposit(dadosAtualizados?.minDeposit ?? valor);
		} catch (submitError) {
			setMinDepositError(submitError instanceof Error ? submitError.message : "Nao foi possivel criar a proposta do deposito minimo.");
		} finally {
			setSavingMinDeposit(false);
		}
	}

	async function submitTokensPerEth() {
		if (!ethereum || !access.connected) {
			setTokensPerEthError("Conecte a carteira para criar a proposta da taxa de cambio.");
			return;
		}

		if (!access.canCreateProposal) {
			setTokensPerEthError("Somente uma carteira com deposito ativo ou o dono do contrato pode criar a proposta da taxa de cambio.");
			return;
		}

		const valor = editingTokensPerEth.trim();

		if (!valor) {
			setTokensPerEthError("Informe a taxa de cambio em RPT por ETH.");
			return;
		}

		setSavingTokensPerEth(true);
		setTokensPerEthError(null);

		try {
			await atualizarTokensPerEthNoContrato(ethereum, valor);
			const dadosAtualizados = await access.refresh();
			setEditingTokensPerEth(dadosAtualizados?.tokensPerEth ?? valor);
		} catch (submitError) {
			setTokensPerEthError(submitError instanceof Error ? submitError.message : "Nao foi possivel criar a proposta da taxa de cambio.");
		} finally {
			setSavingTokensPerEth(false);
		}
	}

	return {
		...access,
		minDeposit,
		editingMinDeposit,
		savingMinDeposit,
		minDepositError,
		tokensPerEth,
		editingTokensPerEth,
		savingTokensPerEth,
		tokensPerEthError,
		setEditingMinDeposit,
		setEditingTokensPerEth,
		submitMinDeposit,
		submitTokensPerEth,
	};
}
