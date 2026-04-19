"use client";

import { useEffect, useMemo, useState } from "react";
import { useDepositConfigurationAccess } from "@/hooks/useDepositConfigurationAccess";
import { atualizarMinDepositNoContrato } from "@/services/deposit/depositConfigurationClient";
import { obterEthereumProvider } from "@/services/wallet/provider";

type UseDepositConfigurationResult = ReturnType<typeof useDepositConfigurationAccess> & {
	minDeposit: string;
	editingMinDeposit: string;
	saving: boolean;
	formError: string | null;
	setEditingMinDeposit: (value: string) => void;
	submit: () => Promise<void>;
};

export function useDepositConfiguration(): UseDepositConfigurationResult {
	const access = useDepositConfigurationAccess();
	const ethereum = useMemo(() => obterEthereumProvider(), []);
	const [editingMinDeposit, setEditingMinDeposit] = useState("");
	const [saving, setSaving] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const minDeposit = access.configuracao?.minDeposit ?? "0";

	useEffect(() => {
		if (access.configuracao && editingMinDeposit === "") {
			setEditingMinDeposit(access.configuracao.minDeposit);
		}
	}, [access.configuracao, editingMinDeposit]);

	async function submit() {
		if (!ethereum || !access.connected) {
			setFormError("Conecte a carteira para alterar o deposito minimo.");
			return;
		}

		if (!access.isOwner) {
			setFormError("Somente o dono do contrato pode alterar o deposito minimo.");
			return;
		}

		const valor = editingMinDeposit.trim();

		if (!valor) {
			setFormError("Informe o valor do deposito minimo.");
			return;
		}

		setSaving(true);
		setFormError(null);

		try {
			await atualizarMinDepositNoContrato(ethereum, valor);
			const dadosAtualizados = await access.refresh();
			setEditingMinDeposit(dadosAtualizados?.minDeposit ?? valor);
		} catch (submitError) {
			setFormError(submitError instanceof Error ? submitError.message : "Nao foi possivel atualizar o deposito minimo.");
		} finally {
			setSaving(false);
		}
	}

	return {
		...access,
		minDeposit,
		editingMinDeposit,
		saving,
		formError,
		setEditingMinDeposit,
		submit,
	};
}
