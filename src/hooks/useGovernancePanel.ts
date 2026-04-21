"use client";

import { useEffect, useMemo, useState } from "react";
import { useSystemConfigurationAccess } from "@/hooks/useSystemConfigurationAccess";
import { carregarMetricasElegibilidade } from "@/services/eligibility/eligibilityMetrics";
import {
	carregarGovernanceSnapshot,
	criarPropostaGovernanca,
	executarPropostaGovernanca,
	votarNaPropostaGovernanca,
} from "@/services/governance/governanceClient";
import type { GovernanceProposal, GovernanceProposalAction, GovernanceSnapshot } from "@/services/governance/governanceTypes";
import { obterEthereumProvider } from "@/services/wallet/provider";
import { useWalletStatus } from "@/hooks/useWalletStatus";

type GovernanceFormState = {
	action: GovernanceProposalAction;
	description: string;
	value: string;
};

type GovernancePanelResult = {
	connected: boolean;
	walletAddress: string | null;
	canCreateProposal: boolean;
	canVote: boolean;
	votingPowerRaw: bigint;
	votingPower: string;
	loading: boolean;
	error: string | null;
	formError: string | null;
	actionError: string | null;
	snapshot: GovernanceSnapshot | null;
	proposals: GovernanceProposal[];
	selectedProposal: GovernanceProposal | null;
	selectedProposalMode: "details" | "vote" | null;
	selectedProposalId: string | null;
	form: GovernanceFormState;
	savingProposal: boolean;
	votingProposalId: string | null;
	executingProposalId: string | null;
	refresh: () => Promise<void>;
	setFormAction: (value: GovernanceProposalAction) => void;
	setFormDescription: (value: string) => void;
	setFormValue: (value: string) => void;
	submitProposal: () => Promise<boolean>;
	openDetailsModal: (proposalId: string) => void;
	openVoteModal: (proposalId: string) => void;
	closeVoteModal: () => void;
	voteSelectedProposal: (support: boolean) => Promise<void>;
	executeProposal: (proposalId: string) => Promise<void>;
};

function ordenarPropostas(proposals: GovernanceProposal[]) {
	return [...proposals].sort((left, right) => Number(right.id) - Number(left.id));
}

export function useGovernancePanel(): GovernancePanelResult {
	const { state } = useWalletStatus();
	const access = useSystemConfigurationAccess();
	const ethereum = useMemo(() => obterEthereumProvider(), []);
	const [snapshot, setSnapshot] = useState<GovernanceSnapshot | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [formError, setFormError] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);
	const [votingPowerRaw, setVotingPowerRaw] = useState(0n);
	const [formAction, setFormActionState] = useState<GovernanceProposalAction>("min_deposit");
	const [formDescription, setFormDescriptionState] = useState("");
	const [formValue, setFormValueState] = useState("");
	const [savingProposal, setSavingProposal] = useState(false);
	const [votingProposalId, setVotingProposalId] = useState<string | null>(null);
	const [executingProposalId, setExecutingProposalId] = useState<string | null>(null);
	const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
	const [selectedProposalMode, setSelectedProposalMode] = useState<"details" | "vote" | null>(null);

	async function refresh() {
		setLoading(true);
		setError(null);

		try {
			const dados = await carregarGovernanceSnapshot(state.connected ? state.address : null);
			setSnapshot(dados);
		} catch (refreshError) {
			setSnapshot(null);
			setError(refreshError instanceof Error ? refreshError.message : "Nao foi possivel carregar as propostas de governanca.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		let ativo = true;

		async function carregar() {
			await refresh().catch(() => undefined);

			if (!ativo) {
				return;
			}
		}

		void carregar();

		const intervalo = window.setInterval(() => {
			void refresh().catch(() => undefined);
		}, 15_000);

		return () => {
			ativo = false;
			window.clearInterval(intervalo);
		};
	}, [state.address, state.connected]);

	useEffect(() => {
		let ativo = true;

		async function carregarMetricas() {
			if (!state.connected || !state.address) {
				if (ativo) {
					setVotingPowerRaw(0n);
				}

				return;
			}

			try {
				const metricas = await carregarMetricasElegibilidade(state.address);

				if (ativo) {
					setVotingPowerRaw(metricas.rptBalanceRaw);
				}
			} catch {
				if (ativo) {
					setVotingPowerRaw(0n);
				}
			}
		}

		void carregarMetricas();

		return () => {
			ativo = false;
		};
	}, [state.address, state.connected]);

	const proposals = snapshot ? ordenarPropostas(snapshot.proposals) : [];
	const selectedProposal = proposals.find((proposal) => proposal.id === selectedProposalId) ?? null;
	const canVote = state.connected && votingPowerRaw > 0n;

	async function submitProposal() {
		if (!ethereum || !state.connected) {
			setFormError("Conecte a carteira para criar a proposta.");
			return false;
		}

		if (!access.canCreateProposal) {
			setFormError("Somente carteira com deposito ativo ou owner pode criar proposta.");
			return false;
		}

		if (!formDescription.trim()) {
			setFormError("Descreva o motivo da proposta.");
			return false;
		}

		if (!formValue.trim()) {
			setFormError("Informe o novo valor da proposta.");
			return false;
		}

		setSavingProposal(true);
		setFormError(null);
		setActionError(null);

		try {
			await criarPropostaGovernanca(ethereum, {
				action: formAction,
				description: formDescription,
				value: formValue,
			});
			setFormDescription("");
			setFormValue("");
			await refresh();
			return true;
		} catch (submitError) {
			setFormError(submitError instanceof Error ? submitError.message : "Nao foi possivel criar a proposta.");
			return false;
		} finally {
			setSavingProposal(false);
		}
	}

	function setFormAction(value: GovernanceProposalAction) {
		setFormError(null);
		setFormActionState(value);
	}

	function setFormDescription(value: string) {
		setFormError(null);
		setFormDescriptionState(value);
	}

	function setFormValue(value: string) {
		setFormError(null);
		setFormValueState(value);
	}

	function openVoteModal(proposalId: string) {
		setSelectedProposalId(proposalId);
		setSelectedProposalMode("vote");
		setActionError(null);
	}

	function openDetailsModal(proposalId: string) {
		setSelectedProposalId(proposalId);
		setSelectedProposalMode("details");
		setActionError(null);
	}

	function closeVoteModal() {
		setSelectedProposalId(null);
		setSelectedProposalMode(null);
		setActionError(null);
	}

	async function voteSelectedProposal(support: boolean) {
		if (!ethereum || !state.connected) {
			setActionError("Conecte a carteira para votar.");
			return;
		}

		if (!selectedProposal) {
			setActionError("Selecione uma proposta para votar.");
			return;
		}

		if (!canVote) {
			setActionError("E necessario ter RPT para votar.");
			return;
		}

		if (selectedProposal.hasVoted) {
			setActionError("Voce ja votou nesta proposta.");
			return;
		}

		setVotingProposalId(selectedProposal.id);
		setActionError(null);

		try {
			await votarNaPropostaGovernanca(ethereum, selectedProposal.id, support);
			closeVoteModal();
			await refresh();
		} catch (voteError) {
			setActionError(voteError instanceof Error ? voteError.message : "Nao foi possivel registrar o voto.");
		} finally {
			setVotingProposalId(null);
		}
	}

	async function executeProposal(proposalId: string) {
		if (!ethereum || !state.connected) {
			setActionError("Conecte a carteira para executar a proposta.");
			return;
		}

		setExecutingProposalId(proposalId);
		setActionError(null);

		try {
			await executarPropostaGovernanca(ethereum, proposalId);
			await refresh();
		} catch (executeError) {
			setActionError(executeError instanceof Error ? executeError.message : "Nao foi possivel executar a proposta.");
		} finally {
			setExecutingProposalId(null);
		}
	}

	return {
		connected: state.connected,
		walletAddress: state.address,
		canCreateProposal: access.canCreateProposal,
		canVote,
		votingPowerRaw,
		votingPower: votingPowerRaw.toString(),
		loading,
		error,
		formError,
		actionError,
		snapshot,
		proposals,
		selectedProposal,
		selectedProposalMode,
		selectedProposalId,
		form: {
			action: formAction,
			description: formDescription,
			value: formValue,
		},
		savingProposal,
		votingProposalId,
		executingProposalId,
		refresh,
		setFormAction,
		setFormDescription,
		setFormValue,
		submitProposal,
		openDetailsModal,
		openVoteModal,
		closeVoteModal,
		voteSelectedProposal,
		executeProposal,
	};
}
