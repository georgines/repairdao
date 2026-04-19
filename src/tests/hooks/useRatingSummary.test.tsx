// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import type { ReactElement } from "react";
import { useRatingSummary } from "@/hooks/useRatingSummary";

const ratingMocks = vi.hoisted(() => ({
	carregarMetricasDaConta: vi.fn(),
}));

vi.mock("@/services/account/accountMetrics", () => ({
	carregarMetricasDaConta: ratingMocks.carregarMetricasDaConta,
}));

function Harness({ address }: { address?: string | null }) {
	const summary = useRatingSummary(address);

	useEffect(() => {
		window.document.body.dataset.loading = summary.loading ? "true" : "false";
		window.document.body.dataset.value = `${summary.averageRating}:${summary.totalRatings}`;
	}, [summary]);

	return <span data-testid="summary">{summary.loading ? "loading" : "ready"}</span>;
}

function AccountHarness({ address }: { address?: string | null }) {
	const summary = useRatingSummary(address, "account");

	useEffect(() => {
		window.document.body.dataset.loading = summary.loading ? "true" : "false";
		window.document.body.dataset.value = `${summary.averageRating}:${summary.totalRatings}`;
	}, [summary]);

	return <span data-testid="summary">{summary.loading ? "loading" : "ready"}</span>;
}

function renderHarness(node: ReactElement) {
	return render(node);
}

describe("hooks/useRatingSummary", () => {
	beforeEach(() => {
		Object.defineProperty(window, "matchMedia", {
			writable: true,
			value: vi.fn().mockImplementation((query: string) => ({
				matches: false,
				media: query,
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn(),
			})),
		});
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it("consulta o contrato e expoe o resumo", async () => {
		ratingMocks.carregarMetricasDaConta.mockResolvedValueOnce({
			depositRaw: 0n,
			deposit: "0",
			rewardsRaw: 0n,
			rewards: "0",
			isActive: true,
			perfilAtivo: "tecnico",
			badgeLevel: "Bronze",
			reputationLevel: 1,
			totalPointsRaw: 0n,
			totalPoints: "0",
			positiveRatingsRaw: 0n,
			positiveRatings: "0",
			negativeRatingsRaw: 0n,
			negativeRatings: "0",
			totalRatingsRaw: 2n,
			totalRatings: "2",
			ratingSumRaw: 8n,
			ratingSum: "8",
			averageRating: "4,0",
		});

		renderHarness(<Harness address="0xabc" />);

		expect(screen.getByTestId("summary").textContent).toBe("loading");

		await waitFor(() => {
			expect(window.document.body.dataset.loading).toBe("false");
			expect(window.document.body.dataset.value).toBe("4:2");
		});
		expect(ratingMocks.carregarMetricasDaConta).toHaveBeenCalledWith("0xabc");
	});

	it("consulta o resumo da conta quando a source e account", async () => {
		ratingMocks.carregarMetricasDaConta.mockResolvedValueOnce({
			depositRaw: 0n,
			deposit: "0",
			rewardsRaw: 0n,
			rewards: "0",
			isActive: true,
			perfilAtivo: "cliente",
			badgeLevel: "Bronze",
			reputationLevel: 1,
			totalPointsRaw: 0n,
			totalPoints: "0",
			positiveRatingsRaw: 0n,
			positiveRatings: "0",
			negativeRatingsRaw: 0n,
			negativeRatings: "0",
			totalRatingsRaw: 8n,
			totalRatings: "8",
			ratingSumRaw: 36n,
			ratingSum: "36",
			averageRating: "4,5",
		});

		renderHarness(<AccountHarness address="0xabc" />);

		expect(screen.getByTestId("summary").textContent).toBe("loading");

		await waitFor(() => {
			expect(window.document.body.dataset.loading).toBe("false");
			expect(window.document.body.dataset.value).toBe("4.5:8");
		});
		expect(ratingMocks.carregarMetricasDaConta).toHaveBeenCalledWith("0xabc");
	});

	it("reseta o estado quando nao ha address", async () => {
		ratingMocks.carregarMetricasDaConta.mockClear();
		renderHarness(<Harness address={null} />);

		await waitFor(() => {
			expect(window.document.body.dataset.loading).toBe("false");
			expect(window.document.body.dataset.value).toBe("0:0");
		});
		expect(ratingMocks.carregarMetricasDaConta).not.toHaveBeenCalled();
	});

	it("normaliza valores invalidos vindos do service", async () => {
		ratingMocks.carregarMetricasDaConta.mockResolvedValueOnce({
			depositRaw: 0n,
			deposit: "0",
			rewardsRaw: 0n,
			rewards: "0",
			isActive: true,
			perfilAtivo: "tecnico",
			badgeLevel: "Bronze",
			reputationLevel: 1,
			totalPointsRaw: 0n,
			totalPoints: "0",
			positiveRatingsRaw: 0n,
			positiveRatings: "0",
			negativeRatingsRaw: 0n,
			negativeRatings: "0",
			totalRatingsRaw: 0n,
			totalRatings: "abc",
			ratingSumRaw: 0n,
			ratingSum: "0",
			averageRating: "1,7",
		});

		renderHarness(<Harness address="0xdef" />);

		await waitFor(() => {
			expect(window.document.body.dataset.value).toBe("1.7:0");
		});
	});
});
