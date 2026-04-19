"use client";

import { useAccountMetrics } from "@/hooks/useAccountMetrics";

export type ActiveAccountProfile = "cliente" | "tecnico" | null;

export function useAccountProfile() {
	const { connected, walletAddress, perfilAtivo } = useAccountMetrics();

	return {
		perfilAtivo: connected ? perfilAtivo : null,
		connected,
		walletAddress,
	};
}
