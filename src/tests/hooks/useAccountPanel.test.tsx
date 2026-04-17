// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const serviceMocks = vi.hoisted(() => ({
	carregarMetricasDaConta: vi.fn(),
	sacarDeposito: vi.fn(),
	sacarRendimento: vi.fn(),
	obterEthereumProvider: vi.fn(),
	useWalletStatus: vi.fn(),
}));

vi.mock("@/services/account/accountMetrics", () => ({
	carregarMetricasDaConta: serviceMocks.carregarMetricasDaConta,
}));

vi.mock("@/services/account/accountActions", () => ({
	sacarDeposito: serviceMocks.sacarDeposito,
	sacarRendimento: serviceMocks.sacarRendimento,
}));

vi.mock("@/services/wallet/provider", () => ({
	obterEthereumProvider: serviceMocks.obterEthereumProvider,
}));

vi.mock("@/hooks/useWalletStatus", () => ({
	useWalletStatus: serviceMocks.useWalletStatus,
}));

import { useAccountPanel } from "@/hooks/useAccountPanel";

async function flush() {
	await Promise.resolve();
	await Promise.resolve();
}

describe("useAccountPanel", () => {
	let container: HTMLDivElement;
	let root: ReturnType<typeof createRoot>;
	const capture = vi.fn<(value: ReturnType<typeof useAccountPanel>) => void>();

	function Probe() {
		capture(useAccountPanel());
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

		serviceMocks.obterEthereumProvider.mockReturnValue({ request: vi.fn() });
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

	it("expõe os dados da conta e os saques", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.connected).toBe(true);
		expect(getLatest()?.deposit).toBe("150");
		expect(getLatest()?.rewards).toBe("5");
		expect(getLatest()?.badgeLevel).toBe("Ouro");
		expect(getLatest()?.canWithdrawDeposit).toBe(true);
		expect(getLatest()?.canWithdrawRewards).toBe(true);

		serviceMocks.sacarDeposito.mockResolvedValue("ok");
		serviceMocks.sacarRendimento.mockResolvedValue("ok");

		await act(async () => {
			await getLatest()?.handleWithdrawDeposit();
			await flush();
		});

		await act(async () => {
			await getLatest()?.handleWithdrawRewards();
			await flush();
		});

		expect(serviceMocks.sacarDeposito).toHaveBeenCalledWith(expect.any(Object));
		expect(serviceMocks.sacarRendimento).toHaveBeenCalledWith(expect.any(Object));
		expect(serviceMocks.carregarMetricasDaConta).toHaveBeenCalledWith("0x1234567890abcdef1234567890abcdef12345678");
	});

	it("bloqueia os saques quando a carteira nao esta disponivel", async () => {
		serviceMocks.obterEthereumProvider.mockReturnValue(undefined);
		serviceMocks.useWalletStatus.mockReturnValue({
			state: {
				connected: false,
				loading: false,
				address: null,
				chainLabel: "Sem conexao",
				ethBalance: "0",
				usdBalance: "0",
				ethUsdPrice: "0",
			},
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			await getLatest()?.handleWithdrawDeposit();
			await flush();
		});

		expect(serviceMocks.sacarDeposito).not.toHaveBeenCalled();
		expect(getLatest()?.error).toBe("Conecte a carteira para sacar o deposito.");
		expect(getLatest()?.canWithdrawDeposit).toBe(false);
		expect(getLatest()?.canWithdrawRewards).toBe(false);
	});

	it("bloqueia os saques quando nao ha valores disponiveis", async () => {
		serviceMocks.carregarMetricasDaConta.mockResolvedValue({
			depositRaw: 0n,
			deposit: "0",
			rewardsRaw: 0n,
			rewards: "0",
			isActive: false,
			perfilAtivo: null,
			badgeLevel: "Sem carteira",
			reputationLevel: 0,
			totalPointsRaw: 0n,
			totalPoints: "0",
			positiveRatingsRaw: 0n,
			positiveRatings: "0",
			negativeRatingsRaw: 0n,
			negativeRatings: "0",
			totalRatingsRaw: 0n,
			totalRatings: "0",
			ratingSumRaw: 0n,
			ratingSum: "0",
			averageRating: "0,0",
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			await getLatest()?.handleWithdrawDeposit();
			await flush();
		});

		expect(getLatest()?.error).toBe("Nao ha deposito disponivel para saque.");

		await act(async () => {
			await getLatest()?.handleWithdrawRewards();
			await flush();
		});

		expect(getLatest()?.error).toBe("Nao ha rendimentos disponiveis para saque.");
		expect(serviceMocks.sacarDeposito).not.toHaveBeenCalled();
		expect(serviceMocks.sacarRendimento).not.toHaveBeenCalled();
	});

	it("bloqueia o saque quando a carteira nao esta conectada, mas o ethereum existe", async () => {
		serviceMocks.obterEthereumProvider.mockReturnValue({ request: vi.fn() });
		serviceMocks.useWalletStatus.mockReturnValue({
			state: {
				connected: false,
				loading: false,
				address: null,
				chainLabel: "Sem conexao",
				ethBalance: "0",
				usdBalance: "0",
				ethUsdPrice: "0",
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

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			await getLatest()?.handleWithdrawDeposit();
			await flush();
		});

		expect(getLatest()?.error).toBe("Conecte a carteira para sacar o deposito.");

		await act(async () => {
			await getLatest()?.handleWithdrawRewards();
			await flush();
		});

		expect(getLatest()?.error).toBe("Conecte a carteira para sacar os rendimentos.");
		expect(serviceMocks.sacarDeposito).not.toHaveBeenCalled();
		expect(serviceMocks.sacarRendimento).not.toHaveBeenCalled();
	});

	it("bloqueia o saque quando a carteira some antes da transacao", async () => {
		serviceMocks.obterEthereumProvider.mockReturnValue(undefined);
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

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			await getLatest()?.handleWithdrawDeposit();
			await flush();
		});

		expect(getLatest()?.error).toBe("Conecte a carteira para sacar o deposito.");

		await act(async () => {
			await getLatest()?.handleWithdrawRewards();
			await flush();
		});

		expect(getLatest()?.error).toBe("Conecte a carteira para sacar os rendimentos.");
		expect(serviceMocks.sacarDeposito).not.toHaveBeenCalled();
		expect(serviceMocks.sacarRendimento).not.toHaveBeenCalled();
	});

	it("usa mensagens especificas quando o saque falha", async () => {
		serviceMocks.sacarDeposito.mockRejectedValue("falha bruta");
		serviceMocks.sacarRendimento.mockRejectedValue(new Error("falha de rendimento"));

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			await getLatest()?.handleWithdrawDeposit();
			await flush();
		});

		expect(getLatest()?.error).toBe("Nao foi possivel concluir o saque do deposito.");

		await act(async () => {
			await getLatest()?.handleWithdrawRewards();
			await flush();
		});

		expect(getLatest()?.error).toBe("falha de rendimento");
	});

	it("usa metricas padrao quando a leitura falha", async () => {
		serviceMocks.carregarMetricasDaConta.mockRejectedValue(new Error("falha ao carregar"));

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.deposit).toBe("0");
		expect(getLatest()?.rewards).toBe("0");
		expect(getLatest()?.badgeLevel).toBe("Sem carteira");
		expect(getLatest()?.canWithdrawDeposit).toBe(false);
		expect(getLatest()?.canWithdrawRewards).toBe(false);
	});

	it("ignora atualizacoes quando o componente desmonta antes da resposta", async () => {
		let resolver: ((value: unknown) => void) | undefined;

		serviceMocks.carregarMetricasDaConta.mockImplementation(
			() =>
				new Promise((resolve) => {
					resolver = resolve;
				}),
		);

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			root.unmount();
			await flush();
		});

		resolver?.({
			depositRaw: 150000000000000000000n,
			deposit: "150",
			rewardsRaw: 5000000000000000000n,
			rewards: "5",
			isActive: true,
			perfilAtivo: "tecnico",
			badgeLevel: "Ouro",
			reputationLevel: 4,
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

		await act(async () => {
			await flush();
		});

		expect(serviceMocks.carregarMetricasDaConta).toHaveBeenCalledTimes(1);
	});

	it("ignora falhas quando o componente desmonta antes da rejeicao", async () => {
		let rejecter: ((reason?: unknown) => void) | undefined;

		serviceMocks.carregarMetricasDaConta.mockImplementation(
			() =>
				new Promise((_, reject) => {
					rejecter = reject;
				}),
		);

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			root.unmount();
			await flush();
		});

		rejecter?.(new Error("falha tardia"));

		await act(async () => {
			await flush();
		});

		expect(serviceMocks.carregarMetricasDaConta).toHaveBeenCalledTimes(1);
	});

	it("atualiza as metricas no intervalo", async () => {
		vi.useFakeTimers();
		serviceMocks.carregarMetricasDaConta
			.mockResolvedValueOnce({
				depositRaw: 150000000000000000000n,
				deposit: "150",
				rewardsRaw: 5000000000000000000n,
				rewards: "5",
				isActive: true,
				perfilAtivo: "tecnico",
				badgeLevel: "Ouro",
				reputationLevel: 4,
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
			})
			.mockResolvedValueOnce({
				depositRaw: 0n,
				deposit: "0",
				rewardsRaw: 0n,
				rewards: "0",
				isActive: false,
				perfilAtivo: null,
				badgeLevel: "Sem carteira",
				reputationLevel: 0,
				totalPointsRaw: 0n,
				totalPoints: "0",
				positiveRatingsRaw: 0n,
				positiveRatings: "0",
				negativeRatingsRaw: 0n,
				negativeRatings: "0",
				totalRatingsRaw: 0n,
				totalRatings: "0",
				ratingSumRaw: 0n,
				ratingSum: "0",
				averageRating: "0,0",
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
		expect(getLatest()?.deposit).toBe("0");
		expect(getLatest()?.canWithdrawDeposit).toBe(false);
	});
});
