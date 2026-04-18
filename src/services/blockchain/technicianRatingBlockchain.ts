"use client";

import { criarRepairDAOContractClient } from "@/services/blockchain/contractClient";
import { criarRepairReputationGateway } from "@/services/blockchain/gateways/reputationGateway";

type TechnicianRatingSummary = {
	averageRating: number;
	totalRatings: number;
};

type CachedSummaryEntry = {
	createdAt: number;
	promise: Promise<TechnicianRatingSummary | null>;
};

const RATING_SUMMARY_CACHE = new Map<string, CachedSummaryEntry>();
const RATING_SUMMARY_CACHE_TTL_MS = 10_000;

function obterRpcUrlPublica() {
	return process.env.NEXT_PUBLIC_RPC_URL?.trim() ?? "";
}

function normalizarEndereco(address: string) {
	return address.trim().toLowerCase();
}

function converterParaNumero(valor: unknown) {
	if (typeof valor === "bigint") {
		return Number(valor);
	}

	if (typeof valor === "number") {
		return valor;
	}

	if (typeof valor === "string" && valor.trim().length > 0) {
		const parsed = Number(valor);
		return Number.isFinite(parsed) ? parsed : null;
	}

	return null;
}

function lerValorNumerico(valor: unknown, chave: string, indice: number) {
	if (!valor || typeof valor !== "object") {
		return null;
	}

	const registro = valor as Record<string, unknown>;
	return converterParaNumero(registro[chave] ?? registro[String(indice)]);
}

export function invalidarResumoAvaliacaoDoTecnicoCache(address?: string | null) {
	if (!address) {
		RATING_SUMMARY_CACHE.clear();
		return;
	}

	RATING_SUMMARY_CACHE.delete(normalizarEndereco(address));
}

export async function carregarResumoAvaliacaoDoTecnicoNoContrato(address: string): Promise<TechnicianRatingSummary | null> {
	const normalizedAddress = normalizarEndereco(address);

	if (!normalizedAddress) {
		return null;
	}

	const cached = RATING_SUMMARY_CACHE.get(normalizedAddress);
	if (cached && Date.now() - cached.createdAt < RATING_SUMMARY_CACHE_TTL_MS) {
		return cached.promise;
	}

	const promise = (async () => {
		const rpcUrl = obterRpcUrlPublica();
		if (!rpcUrl) {
			return null;
		}

		const contractClient = criarRepairDAOContractClient({ rpcUrl });
		const gateway = criarRepairReputationGateway(contractClient);

		try {
			const reputation = await gateway.readContract<unknown>({
				functionName: "getReputation",
				args: [normalizedAddress],
			});

			const totalRatings = lerValorNumerico(reputation, "totalRatings", 4);
			const ratingSum = lerValorNumerico(reputation, "ratingSum", 5);

			if (totalRatings === null || ratingSum === null) {
				return null;
			}

			if (totalRatings <= 0) {
				return {
					averageRating: 0,
					totalRatings: 0,
				};
			}

			return {
				averageRating: ratingSum / totalRatings,
				totalRatings,
			};
		} catch {
			return null;
		}
	})();

	RATING_SUMMARY_CACHE.set(normalizedAddress, {
		createdAt: Date.now(),
		promise,
	});
	return promise;
}

export async function carregarMediaAvaliacaoDoTecnicoNoContrato(address: string): Promise<number | null> {
	const resumo = await carregarResumoAvaliacaoDoTecnicoNoContrato(address);
	return resumo?.averageRating ?? null;
}
