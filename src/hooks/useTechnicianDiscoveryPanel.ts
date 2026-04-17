"use client";

import { useMemo, useState } from "react";
import type { UserSearchFilters, UserSummary } from "@/services/users";
import {
	filterUsersByReputation,
	findUserDetails,
	searchUsers,
	sortUsers,
} from "@/services/users";

type UseTechnicianDiscoveryPanelProps = {
	initialTechnicians: UserSummary[];
};

type UseTechnicianDiscoveryPanelResult = {
	query: string;
	minReputation: number;
	totalTechnicians: number;
	filteredTechnicians: UserSummary[];
	selectedTechnician: UserSummary | null;
	hasResults: boolean;
	onQueryChange: (value: string) => void;
	onMinReputationChange: (value: string | number) => void;
	onSelectTechnician: (address: string) => void;
	onClearFilters: () => void;
};

export function useTechnicianDiscoveryPanel({
	initialTechnicians,
}: UseTechnicianDiscoveryPanelProps): UseTechnicianDiscoveryPanelResult {
	const [query, setQuery] = useState("");
	const [minReputation, setMinReputation] = useState(0);
	const [selectedAddress, setSelectedAddress] = useState<string | null>(initialTechnicians.at(0)?.address ?? null);

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
		hasResults: filteredTechnicians.length > 0,
		onQueryChange,
		onMinReputationChange,
		onSelectTechnician,
		onClearFilters,
	};
}
