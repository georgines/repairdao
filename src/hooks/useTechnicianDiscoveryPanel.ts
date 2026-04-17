"use client";

import { useMemo, useState } from "react";
import { useWalletStatus } from "@/hooks/useWalletStatus";
import { obterEthereumProvider } from "@/services/wallet/provider";
import type { UserSearchFilters, UserSummary } from "@/services/users";
import {
	filterUsersByReputation,
	findUserDetails,
	searchUsers,
	sortUsers,
} from "@/services/users";
import { createServiceRequest } from "@/services/serviceRequests/serviceRequestClient";
import { criarOrdemServicoNoContrato } from "@/services/serviceRequests/serviceRequestBlockchain";

type UseTechnicianDiscoveryPanelProps = {
	initialTechnicians: UserSummary[];
};

type UseTechnicianDiscoveryPanelResult = {
	query: string;
	minReputation: number;
	totalTechnicians: number;
	filteredTechnicians: UserSummary[];
	selectedTechnician: UserSummary | null;
	contractedTechnician: UserSummary | null;
	technicianModalMode: "details" | "hire" | null;
	technicianModalOpened: boolean;
	hasResults: boolean;
	serviceDescription: string;
	submittingRequest: boolean;
	requestError: string | null;
	onQueryChange: (value: string) => void;
	onMinReputationChange: (value: string | number) => void;
	onSelectTechnician: (address: string) => void;
	onHireTechnician: (address: string) => void;
	onCloseTechnicianModal: () => void;
	onServiceDescriptionChange: (value: string) => void;
	onConfirmTechnicianHire: () => Promise<void>;
	onClearFilters: () => void;
};

export function useTechnicianDiscoveryPanel({
	initialTechnicians,
}: UseTechnicianDiscoveryPanelProps): UseTechnicianDiscoveryPanelResult {
	const { state } = useWalletStatus();
	const ethereum = useMemo(() => obterEthereumProvider(), []);
	const [query, setQuery] = useState("");
	const [minReputation, setMinReputation] = useState(0);
	const [selectedAddress, setSelectedAddress] = useState<string | null>(initialTechnicians.at(0)?.address ?? null);
	const [contractedTechnicianAddress, setContractedTechnicianAddress] = useState<string | null>(null);
	const [technicianModalMode, setTechnicianModalMode] = useState<"details" | "hire" | null>(null);
	const [serviceDescription, setServiceDescription] = useState("");
	const [submittingRequest, setSubmittingRequest] = useState(false);
	const [requestError, setRequestError] = useState<string | null>(null);

	const filtros = useMemo<UserSearchFilters>(
		() => ({
			query,
			minReputation,
		}),
		[query, minReputation],
	);

	const filteredTechnicians = useMemo(() => {
		const porTexto = searchUsers(initialTechnicians, filtros.query);
		const porReputacao = filterUsersByReputation(porTexto, filtros.minReputation);

		return sortUsers(porReputacao);
	}, [filtros, initialTechnicians]);

	const selectedTechnician = useMemo(() => {
		if (!selectedAddress) {
			return null;
		}

		return findUserDetails(filteredTechnicians, selectedAddress) ?? findUserDetails(initialTechnicians, selectedAddress);
	}, [filteredTechnicians, initialTechnicians, selectedAddress]);

	function onQueryChange(value: string) {
		setQuery(value);
	}

	function onMinReputationChange(value: string | number) {
		const numericValue = typeof value === "number" ? value : Number(value);
		setMinReputation(Number.isFinite(numericValue) ? numericValue : 0);
	}

	function onSelectTechnician(address: string) {
		setSelectedAddress(address);
		setTechnicianModalMode("details");
	}

	function onHireTechnician(address: string) {
		setSelectedAddress(address);
		setTechnicianModalMode("hire");
		setRequestError(null);
	}

	function onCloseTechnicianModal() {
		setTechnicianModalMode(null);
		setServiceDescription("");
		setRequestError(null);
	}

	async function onConfirmTechnicianHire() {
		if (!selectedTechnician) {
			return;
		}

		if (!state.connected || !state.address) {
			setRequestError("Conecte a carteira para contratar o servico.");
			return;
		}

		setSubmittingRequest(true);
		setRequestError(null);

		try {
			await criarOrdemServicoNoContrato(ethereum, serviceDescription);
			await createServiceRequest({
				clientAddress: state.address,
				clientName: state.address,
				technicianAddress: selectedTechnician.address,
				technicianName: selectedTechnician.name,
				description: serviceDescription,
			});
			setContractedTechnicianAddress(selectedTechnician.address);
			setTechnicianModalMode(null);
			setServiceDescription("");
		} catch (error) {
			setRequestError(error instanceof Error ? error.message : "Nao foi possivel criar a ordem de servico.");
		} finally {
			setSubmittingRequest(false);
		}
	}

	function onClearFilters() {
		setQuery("");
		setMinReputation(0);
	}

	return {
		query,
		minReputation,
		totalTechnicians: initialTechnicians.length,
		filteredTechnicians,
		selectedTechnician,
		contractedTechnician: contractedTechnicianAddress
			? findUserDetails(initialTechnicians, contractedTechnicianAddress) ?? findUserDetails(filteredTechnicians, contractedTechnicianAddress)
			: null,
		technicianModalMode,
		technicianModalOpened: technicianModalMode !== null && selectedTechnician !== null,
		hasResults: filteredTechnicians.length > 0,
		serviceDescription,
		submittingRequest,
		requestError,
		onQueryChange,
		onMinReputationChange,
		onSelectTechnician,
		onHireTechnician,
		onCloseTechnicianModal,
		onConfirmTechnicianHire,
		onServiceDescriptionChange: setServiceDescription,
		onClearFilters,
	};
}
