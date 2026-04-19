// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as userValidation from "@/services/users/userValidation";

const serviceMocks = vi.hoisted(() => ({
	carregarMetricasDaConta: vi.fn(),
	carregarMetricasElegibilidade: vi.fn(),
	depositarTokens: vi.fn(),
	sacarDeposito: vi.fn(),
	persistUserProfile: vi.fn(),
	obterEthereumProvider: vi.fn(),
	useWalletStatus: vi.fn(),
}));

vi.mock("@/services/account/accountMetrics", () => ({
	carregarMetricasDaConta: serviceMocks.carregarMetricasDaConta,
}));

vi.mock("@/services/eligibility/eligibilityMetrics", () => ({
	carregarMetricasElegibilidade: serviceMocks.carregarMetricasElegibilidade,
}));

vi.mock("@/services/eligibility/tokenDeposit", () => ({
	depositarTokens: serviceMocks.depositarTokens,
	sacarDeposito: serviceMocks.sacarDeposito,
}));

vi.mock("@/services/users/userClient", () => ({
	persistUserProfile: serviceMocks.persistUserProfile,
}));

vi.mock("@/services/wallet/provider", () => ({
	obterEthereumProvider: serviceMocks.obterEthereumProvider,
}));

vi.mock("@/hooks/useWalletStatus", () => ({
	useWalletStatus: serviceMocks.useWalletStatus,
}));

import { useEligibilityPanel } from "@/hooks/useEligibilityPanel";

async function flush() {
	await Promise.resolve();
	await Promise.resolve();
}

describe("useEligibilityPanel", () => {
	let container: HTMLDivElement;
	let root: ReturnType<typeof createRoot>;
	const capture = vi.fn<(value: ReturnType<typeof useEligibilityPanel>) => void>();

	function Probe() {
		capture(useEligibilityPanel());
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
			depositRaw: 0n,
			deposit: "0",
			rewardsRaw: 0n,
			rewards: "0",
			isActive: true,
			perfilAtivo: "cliente",
			badgeLevel: "bronze",
			reputationLevel: 0,
			reputationLevelName: "None",
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
		serviceMocks.carregarMetricasElegibilidade.mockResolvedValue({
			rptBalanceRaw: 5500000000000000000n,
			rptBalance: "5.5",
			tokensPerEthRaw: 250n,
			tokensPerEth: "250",
			badgeLevel: "bronze",
			isActive: true,
			perfilAtivo: "cliente",
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
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

	it("expõe os dados da carteira e deposita como cliente por padrão", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.connected).toBe(true);
		expect(getLatest()?.ethBalance).toBe("0.5");
		expect(getLatest()?.rptBalance).toBe("5.5");
		expect(getLatest()?.badgeLevel).toBe("bronze");
		expect(getLatest()?.isActive).toBe(true);
		expect(getLatest()?.perfilAtivo).toBe("cliente");
		expect(getLatest()?.mostrarSeletoresPapel).toBe(false);
		expect(getLatest()?.perfilSelecionado).toBe("cliente");
		expect(getLatest()?.perfilConfirmacao).toBe("tecnico");
		expect(getLatest()?.quantidadeRpt).toBeNull();
		expect(getLatest()?.quantidadeErro).toBeNull();
		expect(getLatest()?.acaoLabel).toBe("Trocar para tecnico");
		expect(getLatest()?.identificadorCarteira).toBe("0x1234567890abcdef1234567890abcdef12345678");

		serviceMocks.persistUserProfile.mockResolvedValue({
			address: "0x1234567890abcdef1234567890abcdef12345678",
			name: "Ana",
			expertiseArea: "Eletrica",
			role: "tecnico",
			badgeLevel: "bronze",
			reputation: 0,
			depositLevel: 5,
			isActive: true,
			isEligible: true,
			updatedAt: "2026-04-17T10:00:00.000Z",
			syncedAt: "2026-04-17T10:01:00.000Z",
		});
		serviceMocks.depositarTokens.mockResolvedValue("ok");

		await act(async () => {
			getLatest()?.handleNomeChange("Ana");
			getLatest()?.handleAreaAtuacaoChange("Eletrica");
			getLatest()?.handleQuantidadeChange(150);
			await flush();
		});

		await act(async () => {
			await getLatest()?.handleDeposit();
			await flush();
		});

		expect(serviceMocks.sacarDeposito).toHaveBeenCalledTimes(1);
		expect(serviceMocks.depositarTokens).toHaveBeenCalledWith(expect.any(Object), 150000000000000000000n, true);
		expect(serviceMocks.persistUserProfile).toHaveBeenCalledWith(
			expect.objectContaining({
				address: "0x1234567890abcdef1234567890abcdef12345678",
				name: "Ana",
				role: "tecnico",
				expertiseArea: "Eletrica",
			}),
		);
	});

	it("mantem o papel registrado e permite trocar para cliente quando o nivel ativo e tecnico", async () => {
		serviceMocks.carregarMetricasDaConta.mockResolvedValue({
			depositRaw: 0n,
			deposit: "0",
			rewardsRaw: 0n,
			rewards: "0",
			isActive: true,
			perfilAtivo: "tecnico",
			badgeLevel: "bronze",
			reputationLevel: 0,
			reputationLevelName: "None",
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
		serviceMocks.carregarMetricasElegibilidade.mockResolvedValue({
			rptBalanceRaw: 5500000000000000000n,
			rptBalance: "5.5",
			tokensPerEthRaw: 250n,
			tokensPerEth: "250",
			badgeLevel: "bronze",
			isActive: true,
			perfilAtivo: "tecnico",
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.handlePerfilChange("tecnico");
			getLatest()?.handleQuantidadeChange(150.5);
			await flush();
		});

		expect(getLatest()?.perfilAtivo).toBe("tecnico");
		expect(getLatest()?.mostrarSeletoresPapel).toBe(false);
		expect(getLatest()?.perfilSelecionado).toBe("cliente");
		expect(getLatest()?.perfilConfirmacao).toBe("cliente");
		expect(getLatest()?.acaoLabel).toBe("Trocar para cliente");
		expect(getLatest()?.mensagemAcao).toContain("cadastro sera salvo depois da confirmacao");
	});

	it("expõe mensagens corretas quando a conta está inativa", async () => {
		serviceMocks.carregarMetricasElegibilidade.mockResolvedValue({
			rptBalanceRaw: 0n,
			rptBalance: "0",
			tokensPerEthRaw: 250n,
			tokensPerEth: "250",
			badgeLevel: "Sem carteira",
			isActive: false,
			perfilAtivo: null,
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.acaoLabel).toBe("Ativar como cliente");
		expect(getLatest()?.mensagemAcao).toContain("Ao ativar como cliente");

		await act(async () => {
			getLatest()?.handlePerfilChange("tecnico");
			await flush();
		});

		expect(getLatest()?.acaoLabel).toBe("Ativar como tecnico");
		expect(getLatest()?.mensagemAcao).toContain("Ao ativar como tecnico");
		expect(getLatest()?.perfilConfirmacao).toBe("tecnico");
	});

	it("trata quantidade nula como valor invalido", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.handleQuantidadeChange(null);
			await flush();
		});

		expect(getLatest()?.quantidadeErro).toBeNull();

		await act(async () => {
			await getLatest()?.handleDeposit();
			await flush();
		});

		expect(getLatest()?.error).toBe("Informe um valor para depositar.");
	});

	it("aceita quantidade informada como texto", async () => {
		vi.useFakeTimers();

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.handleQuantidadeChange(" 150,5 ");
			await flush();
		});

		await act(async () => {
			vi.advanceTimersByTime(500);
			await flush();
		});

		expect(getLatest()?.quantidadeErro).toBeNull();
		expect(getLatest()?.quantidadeRpt).toBe(" 150,5 ");
	});

	it("bloqueia o deposito quando o valor e menor que o minimo", async () => {
		vi.useFakeTimers();

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.handleQuantidadeChange(0.5);
			await flush();
		});

		await act(async () => {
			vi.advanceTimersByTime(500);
			await flush();
		});

		expect(getLatest()?.quantidadeErro).toContain("maior ou igual");

		await act(async () => {
			await getLatest()?.handleDeposit();
			await flush();
		});

		expect(serviceMocks.depositarTokens).not.toHaveBeenCalled();
		expect(serviceMocks.sacarDeposito).not.toHaveBeenCalled();
		expect(getLatest()?.error).toContain("maior ou igual");
	});

	it("bloqueia o deposito quando a carteira nao esta disponivel", async () => {
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
			getLatest()?.handleNomeChange("Ana");
			getLatest()?.handleAreaAtuacaoChange("Eletrica");
			getLatest()?.handleQuantidadeChange(150);
			await flush();
		});

		await act(async () => {
			await getLatest()?.handleDeposit();
			await flush();
		});

		expect(serviceMocks.depositarTokens).not.toHaveBeenCalled();
		expect(getLatest()?.error).toBe("Conecte a carteira para depositar os RPT.");
	});

	it("usa mensagem padrao quando a transferencia falha com valor nao tipado", async () => {
		serviceMocks.depositarTokens.mockRejectedValue("falha bruta");

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.handleNomeChange("Ana");
			getLatest()?.handleAreaAtuacaoChange("Eletrica");
			getLatest()?.handleQuantidadeChange(150);
			await flush();
		});

		await act(async () => {
			await getLatest()?.handleDeposit();
			await flush();
		});

		expect(getLatest()?.error).toBe("Nao foi possivel concluir o deposito dos RPT.");
	});

	it("usa a mensagem do erro quando a transferencia falha com Error", async () => {
		serviceMocks.depositarTokens.mockRejectedValue(new Error("falha de deposito"));

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.handleNomeChange("Ana");
			getLatest()?.handleAreaAtuacaoChange("Eletrica");
			getLatest()?.handleQuantidadeChange(150);
			await flush();
		});

		await act(async () => {
			await getLatest()?.handleDeposit();
			await flush();
		});

		expect(getLatest()?.error).toBe("falha de deposito");
	});

	it("valida os dados antes de depositar", async () => {
		serviceMocks.persistUserProfile.mockResolvedValue({
			address: "0x1234567890abcdef1234567890abcdef12345678",
			name: "Ana",
			expertiseArea: null,
			role: "cliente",
			badgeLevel: "bronze",
			reputation: 0,
			depositLevel: 5,
			isActive: true,
			isEligible: true,
			updatedAt: "2026-04-17T10:00:00.000Z",
			syncedAt: "2026-04-17T10:01:00.000Z",
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.handleNomeChange("   ");
			getLatest()?.handleAreaAtuacaoChange("   ");
			getLatest()?.handleQuantidadeChange(150);
			await flush();
		});

		await act(async () => {
			await getLatest()?.handleDeposit();
			await flush();
		});

		expect(getLatest()?.error).toBe("O campo nome nao pode ser vazio.");
		expect(serviceMocks.depositarTokens).not.toHaveBeenCalled();
	});

	it("faz rollback quando o endereco desaparece apos o deposito", async () => {
		serviceMocks.persistUserProfile.mockResolvedValue({
			address: "0x1234567890abcdef1234567890abcdef12345678",
			name: "Ana",
			expertiseArea: null,
			role: "cliente",
			badgeLevel: "bronze",
			reputation: 0,
			depositLevel: 5,
			isActive: true,
			isEligible: true,
			updatedAt: "2026-04-17T10:00:00.000Z",
			syncedAt: "2026-04-17T10:01:00.000Z",
		});
		serviceMocks.depositarTokens.mockResolvedValue("ok");
		serviceMocks.sacarDeposito.mockResolvedValue("ok");

		serviceMocks.useWalletStatus.mockReturnValue({
			state: {
				connected: true,
				loading: false,
				address: null,
				chainLabel: "Local",
				ethBalance: "0.5",
				usdBalance: "1000",
				ethUsdPrice: "2000",
			},
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.handleNomeChange("Ana");
			getLatest()?.handleAreaAtuacaoChange("Eletrica");
			getLatest()?.handleQuantidadeChange(150);
			await flush();
		});

		await act(async () => {
			await getLatest()?.handleDeposit();
			await flush();
		});

		expect(getLatest()?.error).toBe("Endereco da carteira indisponivel.");
		expect(serviceMocks.sacarDeposito).toHaveBeenCalledTimes(2);
	});

	it("ignora a falha do rollback quando o endereco desaparece apos o deposito", async () => {
		serviceMocks.persistUserProfile.mockResolvedValue({
			address: "0x1234567890abcdef1234567890abcdef12345678",
			name: "Ana",
			expertiseArea: null,
			role: "cliente",
			badgeLevel: "bronze",
			reputation: 0,
			depositLevel: 5,
			isActive: true,
			isEligible: true,
			updatedAt: "2026-04-17T10:00:00.000Z",
			syncedAt: "2026-04-17T10:01:00.000Z",
		});
		serviceMocks.depositarTokens.mockResolvedValue("ok");
		serviceMocks.sacarDeposito
			.mockResolvedValueOnce("ok")
			.mockRejectedValueOnce(new Error("rollback falhou"));

		serviceMocks.useWalletStatus.mockReturnValue({
			state: {
				connected: true,
				loading: false,
				address: null,
				chainLabel: "Local",
				ethBalance: "0.5",
				usdBalance: "1000",
				ethUsdPrice: "2000",
			},
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.handleNomeChange("Ana");
			getLatest()?.handleAreaAtuacaoChange("Eletrica");
			getLatest()?.handleQuantidadeChange(150);
			await flush();
		});

		await act(async () => {
			await getLatest()?.handleDeposit();
			await flush();
		});

		expect(getLatest()?.error).toBe("Endereco da carteira indisponivel.");
		expect(serviceMocks.sacarDeposito).toHaveBeenCalledTimes(2);
	});

	it("usa a mensagem padrao quando a validacao falha com valor nao tipado", async () => {
		const validateSpy = vi.spyOn(userValidation, "validateUserActivationForm").mockImplementation(() => {
			throw "falha bruta";
		});

		try {
			await act(async () => {
				root.render(<Probe />);
				await flush();
			});

			await act(async () => {
				getLatest()?.handleNomeChange("Ana");
				getLatest()?.handleQuantidadeChange(150);
				await flush();
			});

			await act(async () => {
				await getLatest()?.handleDeposit();
				await flush();
			});

			expect(getLatest()?.error).toBe("Dados invalidos para ativacao.");
		} finally {
			validateSpy.mockRestore();
		}
	});

	it("ativa um cliente sem area de atuacao", async () => {
		serviceMocks.carregarMetricasElegibilidade.mockResolvedValue({
			rptBalanceRaw: 5500000000000000000n,
			rptBalance: "5.5",
			tokensPerEthRaw: 250n,
			tokensPerEth: "250",
			badgeLevel: "bronze",
			isActive: false,
			perfilAtivo: null,
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
		});
		serviceMocks.depositarTokens.mockResolvedValue("ok");
		serviceMocks.persistUserProfile.mockResolvedValue({
			address: "0x1234567890abcdef1234567890abcdef12345678",
			name: "Ana",
			expertiseArea: null,
			role: "cliente",
			badgeLevel: "bronze",
			reputation: 0,
			depositLevel: 5,
			isActive: true,
			isEligible: true,
			updatedAt: "2026-04-17T10:00:00.000Z",
			syncedAt: "2026-04-17T10:01:00.000Z",
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.handleNomeChange("Ana");
			getLatest()?.handleQuantidadeChange(150);
			await flush();
		});

		await act(async () => {
			await getLatest()?.handleDeposit();
			await flush();
		});

		expect(serviceMocks.persistUserProfile).toHaveBeenCalledWith(
			expect.objectContaining({
				role: "cliente",
				expertiseArea: null,
			}),
		);
	});

	it("ignora a atualizacao do intervalo apos desmontar", async () => {
		vi.useFakeTimers();
		serviceMocks.carregarMetricasElegibilidade.mockResolvedValue({
			rptBalanceRaw: 5500000000000000000n,
			rptBalance: "5.5",
			tokensPerEthRaw: 250n,
			tokensPerEth: "250",
			badgeLevel: "bronze",
			isActive: true,
			perfilAtivo: "cliente",
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			root.unmount();
			vi.advanceTimersByTime(15000);
			await flush();
		});

		expect(serviceMocks.carregarMetricasElegibilidade).toHaveBeenCalled();
	});

	it("bloqueia troca de papel quando a conta ja esta ativa", async () => {
		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		await act(async () => {
			getLatest()?.handlePerfilChange("cliente");
			await flush();
		});

		expect(getLatest()?.perfilSelecionado).toBe("cliente");

		serviceMocks.carregarMetricasElegibilidade.mockResolvedValue({
			rptBalanceRaw: 5500000000000000000n,
			rptBalance: "5.5",
			tokensPerEthRaw: 250n,
			tokensPerEth: "250",
			badgeLevel: "bronze",
			isActive: true,
			perfilAtivo: "cliente",
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
		});

		await act(async () => {
			getLatest()?.handlePerfilChange("tecnico");
			await flush();
		});

		expect(getLatest()?.perfilSelecionado).toBe("cliente");
	});

	it("zera o saldo e o nivel quando a carteira esta desconectada", async () => {
		serviceMocks.useWalletStatus.mockReturnValue({
			state: {
				connected: false,
				loading: false,
				address: null,
				chainLabel: "Sem conexao",
				ethBalance: "9.9",
				usdBalance: "999",
				ethUsdPrice: "0",
			},
		});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.connected).toBe(false);
		expect(getLatest()?.ethBalance).toBe("0");
		expect(getLatest()?.usdBalance).toBe("0");
		expect(getLatest()?.rptBalance).toBe("0");
		expect(getLatest()?.badgeLevel).toBe("Sem carteira");
		expect(getLatest()?.isActive).toBe(false);
		expect(getLatest()?.walletNotice).toBe("Carteira desconectada");
	});

	it("zera as metricas quando o carregamento falha", async () => {
		serviceMocks.carregarMetricasDaConta.mockRejectedValue(new Error("falha"));
		serviceMocks.carregarMetricasElegibilidade.mockRejectedValue(new Error("falha"));

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(getLatest()?.rptBalance).toBe("0");
		expect(getLatest()?.badgeLevel).toBe("Sem carteira");
	});

	it("atualiza as metricas no intervalo", async () => {
		vi.useFakeTimers();
		serviceMocks.carregarMetricasDaConta
			.mockResolvedValueOnce({
				depositRaw: 0n,
				deposit: "0",
				rewardsRaw: 0n,
				rewards: "0",
				isActive: true,
				perfilAtivo: "cliente",
				badgeLevel: "bronze",
				reputationLevel: 0,
				reputationLevelName: "None",
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
			})
			.mockResolvedValueOnce({
				depositRaw: 0n,
				deposit: "0",
				rewardsRaw: 0n,
				rewards: "0",
				isActive: true,
				perfilAtivo: "cliente",
				badgeLevel: "silver",
				reputationLevel: 0,
				reputationLevelName: "None",
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
		serviceMocks.carregarMetricasElegibilidade
			.mockResolvedValueOnce({
			rptBalanceRaw: 5500000000000000000n,
			rptBalance: "5.5",
			tokensPerEthRaw: 250n,
			tokensPerEth: "250",
			badgeLevel: "bronze",
			isActive: true,
			perfilAtivo: "cliente",
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
			})
			.mockResolvedValueOnce({
			rptBalanceRaw: 7000000000000000000n,
			rptBalance: "7",
			tokensPerEthRaw: 300n,
			tokensPerEth: "300",
			badgeLevel: "silver",
			isActive: true,
			perfilAtivo: "cliente",
			minDepositRaw: 100000000000000000000n,
			minDeposit: "100",
			});

		await act(async () => {
			root.render(<Probe />);
			await flush();
		});

		expect(serviceMocks.carregarMetricasElegibilidade).toHaveBeenCalledTimes(1);

		await act(async () => {
			vi.advanceTimersByTime(15000);
			await flush();
		});

		expect(serviceMocks.carregarMetricasElegibilidade).toHaveBeenCalledTimes(2);
		expect(getLatest()?.rptBalance).toBe("7");
		expect(getLatest()?.badgeLevel).toBe("silver");
	});

	it("ignora a atualizacao do intervalo depois que o componente e desmontado enquanto a consulta ainda esta pendente", async () => {
		let resolver!: (value: {
			rptBalanceRaw: bigint;
			rptBalance: string;
			tokensPerEthRaw: bigint;
			tokensPerEth: string;
			badgeLevel: string;
			isActive: boolean;
			perfilAtivo: "cliente" | "tecnico" | null;
			minDepositRaw: bigint;
			minDeposit: string;
		}) => void;
		let intervalo: (() => void) | null = null;
		const setIntervalSpy = vi.spyOn(window, "setInterval").mockImplementation(((handler: TimerHandler) => {
			intervalo = () => {
				void handler();
			};
			return 1 as unknown as number;
		}) as typeof window.setInterval);
		const clearIntervalSpy = vi.spyOn(window, "clearInterval").mockImplementation(() => undefined);

		serviceMocks.carregarMetricasElegibilidade
			.mockResolvedValueOnce({
				rptBalanceRaw: 5500000000000000000n,
				rptBalance: "5.5",
				tokensPerEthRaw: 250n,
				tokensPerEth: "250",
				badgeLevel: "bronze",
				isActive: true,
				perfilAtivo: "cliente",
				minDepositRaw: 100000000000000000000n,
				minDeposit: "100",
			})
			.mockReturnValueOnce(
				new Promise((resolve) => {
					resolver = resolve;
				}),
			);

		try {
			await act(async () => {
				root.render(<Probe />);
				await flush();
			});

			await act(async () => {
				intervalo?.();
				await flush();
			});

			await act(async () => {
				root.unmount();
				await flush();
			});

			await act(async () => {
				resolver({
					rptBalanceRaw: 9000000000000000000n,
					rptBalance: "9",
					tokensPerEthRaw: 250n,
					tokensPerEth: "250",
					badgeLevel: "silver",
					isActive: true,
					perfilAtivo: "cliente",
					minDepositRaw: 100000000000000000000n,
					minDeposit: "100",
				});
				await flush();
			});

			expect(serviceMocks.carregarMetricasElegibilidade).toHaveBeenCalledTimes(2);
			expect(clearIntervalSpy).toHaveBeenCalledTimes(2);
			expect(setIntervalSpy).toHaveBeenCalledTimes(2);
		} finally {
			setIntervalSpy.mockRestore();
			clearIntervalSpy.mockRestore();
		}
	});

	it("nao atualiza as metricas apos desmontar durante a sincronizacao", async () => {
		let resolver!: (value: {
			rptBalanceRaw: bigint;
			rptBalance: string;
			tokensPerEthRaw: bigint;
			tokensPerEth: string;
			badgeLevel: string;
			isActive: boolean;
			perfilAtivo: "cliente" | "tecnico" | null;
			minDepositRaw: bigint;
			minDeposit: string;
		}) => void;

		serviceMocks.carregarMetricasElegibilidade.mockReturnValue(
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

		await act(async () => {
			resolver({
				rptBalanceRaw: 9000000000000000000n,
				rptBalance: "9",
				tokensPerEthRaw: 250n,
				tokensPerEth: "250",
				badgeLevel: "silver",
				isActive: true,
				perfilAtivo: "cliente",
				minDepositRaw: 100000000000000000000n,
				minDeposit: "100",
			});
			await flush();
		});

		expect(serviceMocks.carregarMetricasElegibilidade).toHaveBeenCalledTimes(1);
	});

	it("nao atualiza as metricas apos desmontar quando a sincronizacao falha", async () => {
		let rejecter!: (reason?: unknown) => void;

		serviceMocks.carregarMetricasElegibilidade.mockReturnValue(
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

		await act(async () => {
			rejecter(new Error("falha"));
			await flush();
		});

		expect(serviceMocks.carregarMetricasElegibilidade).toHaveBeenCalledTimes(1);
	});
});
