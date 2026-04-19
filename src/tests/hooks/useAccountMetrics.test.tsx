// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const serviceMocks = vi.hoisted(() => ({
	carregarMetricasDaConta: vi.fn(),
	useWalletStatus: vi.fn(),
}));

vi.mock("@/services/account/accountMetrics", () => ({
	carregarMetricasDaConta: serviceMocks.carregarMetricasDaConta,
}));

vi.mock("@/hooks/useWalletStatus", () => ({
	useWalletStatus: serviceMocks.useWalletStatus,
}));

import { useAccountMetrics } from "@/hooks/useAccountMetrics";

async function flush() {
	await Promise.resolve();
	await Promise.resolve();
}

describe("useAccountMetrics", () => {
	let container: HTMLDivElement;
	let root: ReturnType<typeof createRoot>;
	const capture = vi.fn<(value: ReturnType<typeof useAccountMetrics>) => void>();

	function Probe(props: { refreshKey?: number } = {}) {
		capture(useAccountMetrics({ refreshKey: props.refreshKey }));
		return null;
	}

	function getLatest() {
		return capture.mock.calls.at(-1)?.[0];
	}

	beforeEach(() => {
		(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
		vi.clearAllMocks();
		vi.useRealTimers();

		serviceMocks.useWalletStatus.mockReturnValue({
			state: {
				connected: true,
				loading: false,
				address: "0x1234567890abcdef1234567890abcdef12345678",
				chainLabel: "Local",
				ethBalance: "0.5",
				usdBalance: "1000",
				ethUsdPrice: "2000",
			},
		});
		serviceMocks.carregarMetricasDaConta.mockResolvedValue({
			depositRaw: 150000000000000000000n,
			deposit: "150",
			rewardsRaw: 5000000000000000000n,
			rewards: "5",
			isActive: true,
			perfilAtivo: "tecnico",
			badgeLevel: "Ouro",
			reputationLevel: 4,
			reputationLevelName: "Platinum",
			totalPointsRaw: 32n,
			totalPoints: "32",
			positiveRatingsRaw: 8n,
			positiveRatings: "8",
			negativeRatingsRaw: 1n,
			negativeRatings: "1",
			totalRatingsRaw: 9n,
			totalRatings: "9",
			ratingSumRaw: 41n,
			ratingSum: "41",
			averageRating: "4,6",
		});
	});

	afterEach(async () => {
		await act(async () => {
			root.unmount();
			await flush();
		});
		container.remove();
		vi.useRealTimers();
	});

	it("carrega os niveis e expõe a carteira conectada", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(serviceMocks.carregarMetricasDaConta).toHaveBeenCalledWith("0x1234567890abcdef1234567890abcdef12345678");
		expect(getLatest()?.connected).toBe(true);
		expect(getLatest()?.walletAddress).toBe("0x1234567890abcdef1234567890abcdef12345678");
		expect(getLatest()?.walletNotice).toBeNull();
		expect(getLatest()?.badgeLevel).toBe("Ouro");
		expect(getLatest()?.reputationLevelName).toBe("Platinum");
		expect(getLatest()?.perfilAtivo).toBe("tecnico");
	});

	it("usa valores padrao quando a leitura falha", async () => {
		serviceMocks.carregarMetricasDaConta.mockRejectedValue(new Error("falha"));

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.badgeLevel).toBe("Sem carteira");
		expect(getLatest()?.reputationLevelName).toBe("None");
		expect(getLatest()?.perfilAtivo).toBeNull();
	});

	it("atualiza os niveis quando a chave de refresh muda", async () => {
		serviceMocks.carregarMetricasDaConta
			.mockResolvedValueOnce({
				depositRaw: 150000000000000000000n,
				deposit: "150",
				rewardsRaw: 5000000000000000000n,
				rewards: "5",
				isActive: true,
				perfilAtivo: "tecnico",
				badgeLevel: "Bronze",
				reputationLevel: 2,
				reputationLevelName: "Silver",
				totalPointsRaw: 12n,
				totalPoints: "12",
				positiveRatingsRaw: 4n,
				positiveRatings: "4",
				negativeRatingsRaw: 1n,
				negativeRatings: "1",
				totalRatingsRaw: 5n,
				totalRatings: "5",
				ratingSumRaw: 21n,
				ratingSum: "21",
				averageRating: "4,2",
			})
			.mockResolvedValueOnce({
				depositRaw: 150000000000000000000n,
				deposit: "150",
				rewardsRaw: 5000000000000000000n,
				rewards: "5",
				isActive: true,
				perfilAtivo: "tecnico",
				badgeLevel: "Prata",
				reputationLevel: 3,
				reputationLevelName: "Gold",
				totalPointsRaw: 18n,
				totalPoints: "18",
				positiveRatingsRaw: 6n,
				positiveRatings: "6",
				negativeRatingsRaw: 1n,
				negativeRatings: "1",
				totalRatingsRaw: 7n,
				totalRatings: "7",
				ratingSumRaw: 27n,
				ratingSum: "27",
				averageRating: "3,9",
			});

		await act(async () => {
			root.render(<Probe refreshKey={0} />);
			await flush();
		});

		expect(getLatest()?.badgeLevel).toBe("Bronze");
		expect(serviceMocks.carregarMetricasDaConta).toHaveBeenCalledTimes(1);

		await act(async () => {
			root.render(<Probe refreshKey={1} />);
			await flush();
		});

		expect(getLatest()?.badgeLevel).toBe("Prata");
		expect(getLatest()?.reputationLevelName).toBe("Gold");
		expect(serviceMocks.carregarMetricasDaConta).toHaveBeenCalledTimes(2);
	});

	it("recarrega no intervalo", async () => {
		vi.useFakeTimers();
		serviceMocks.carregarMetricasDaConta
			.mockResolvedValueOnce({
				depositRaw: 150000000000000000000n,
				deposit: "150",
				rewardsRaw: 5000000000000000000n,
				rewards: "5",
				isActive: true,
				perfilAtivo: "tecnico",
				badgeLevel: "Bronze",
				reputationLevel: 2,
				reputationLevelName: "Silver",
				totalPointsRaw: 12n,
				totalPoints: "12",
				positiveRatingsRaw: 4n,
				positiveRatings: "4",
				negativeRatingsRaw: 1n,
				negativeRatings: "1",
				totalRatingsRaw: 5n,
				totalRatings: "5",
				ratingSumRaw: 21n,
				ratingSum: "21",
				averageRating: "4,2",
			})
			.mockResolvedValueOnce({
				depositRaw: 150000000000000000000n,
				deposit: "150",
				rewardsRaw: 5000000000000000000n,
				rewards: "5",
				isActive: true,
				perfilAtivo: "tecnico",
				badgeLevel: "Prata",
				reputationLevel: 3,
				reputationLevelName: "Gold",
				totalPointsRaw: 18n,
				totalPoints: "18",
				positiveRatingsRaw: 6n,
				positiveRatings: "6",
				negativeRatingsRaw: 1n,
				negativeRatings: "1",
				totalRatingsRaw: 7n,
				totalRatings: "7",
				ratingSumRaw: 27n,
				ratingSum: "27",
				averageRating: "3,9",
			});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(serviceMocks.carregarMetricasDaConta).toHaveBeenCalledTimes(1);

		await act(async () => {
			vi.advanceTimersByTime(15000);
			await flush();
		});

		expect(serviceMocks.carregarMetricasDaConta).toHaveBeenCalledTimes(2);
		expect(getLatest()?.badgeLevel).toBe("Prata");
	});
});
