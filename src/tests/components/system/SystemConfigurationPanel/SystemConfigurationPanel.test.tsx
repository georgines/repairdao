import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MantineProvider } from "@mantine/core";
import { SystemConfigurationPanel } from "@/components/system/SystemConfigurationPanel/SystemConfigurationPanel";

const hookState = vi.hoisted(() => ({
	connected: true,
	isOwner: true,
	isDepositOwner: true,
	isTokenOwner: true,
	canCreateProposal: true,
	loading: false,
	error: null as string | null,
	minDepositError: null as string | null,
	tokensPerEthError: null as string | null,
	walletAddress: "0xowner",
	donoDepositoAtualCurto: "0xowne...wner",
	donoTokenAtualCurto: "0xowne...wner",
	minDeposit: "100",
	editingMinDeposit: "100",
	savingMinDeposit: false,
	tokensPerEth: "1000",
	editingTokensPerEth: "1000",
	savingTokensPerEth: false,
}));

vi.mock("@/hooks/useSystemConfiguration", () => ({
	useSystemConfiguration: () => ({
		connected: hookState.connected,
		isOwner: hookState.isOwner,
		isDepositOwner: hookState.isDepositOwner,
		isTokenOwner: hookState.isTokenOwner,
		canCreateProposal: hookState.canCreateProposal,
		loading: hookState.loading,
		error: hookState.error,
		minDepositError: hookState.minDepositError,
		tokensPerEthError: hookState.tokensPerEthError,
		walletAddress: hookState.walletAddress,
		donoDepositoAtualCurto: hookState.donoDepositoAtualCurto,
		donoTokenAtualCurto: hookState.donoTokenAtualCurto,
		minDeposit: hookState.minDeposit,
		editingMinDeposit: hookState.editingMinDeposit,
		savingMinDeposit: hookState.savingMinDeposit,
		tokensPerEth: hookState.tokensPerEth,
		editingTokensPerEth: hookState.editingTokensPerEth,
		savingTokensPerEth: hookState.savingTokensPerEth,
		setEditingMinDeposit: () => {},
		setEditingTokensPerEth: () => {},
		submitMinDeposit: async () => {},
		submitTokensPerEth: async () => {},
		refresh: async () => null,
		configuracao: null,
		donoDepositoAtual: null,
		donoTokenAtual: null,
	}),
}));

describe("SystemConfigurationPanel", () => {
	beforeEach(() => {
		hookState.connected = true;
		hookState.isOwner = true;
		hookState.isDepositOwner = true;
		hookState.isTokenOwner = true;
		hookState.canCreateProposal = true;
		hookState.loading = false;
		hookState.error = null;
		hookState.minDepositError = null;
		hookState.tokensPerEthError = null;
		hookState.walletAddress = "0xowner";
		hookState.minDeposit = "100";
		hookState.editingMinDeposit = "100";
		hookState.savingMinDeposit = false;
		hookState.tokensPerEth = "1000";
		hookState.editingTokensPerEth = "1000";
		hookState.savingTokensPerEth = false;
	});

	it("mostra a interface quando a carteira e do dono", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<SystemConfigurationPanel />
			</MantineProvider>,
		);

		expect(markup).toContain("Configuracoes do sistema");
		expect(markup).toContain("Deposito minimo");
		expect(markup).toContain("Taxa de cambio ETH para RPT");
		expect(markup).toContain("Criar proposta do deposito");
		expect(markup).toContain("Criar proposta da taxa");
	});

	it("bloqueia quando a carteira esta desconectada", () => {
		hookState.connected = false;
		hookState.isOwner = false;
		hookState.canCreateProposal = false;

		const markup = renderToStaticMarkup(
			<MantineProvider>
				<SystemConfigurationPanel />
			</MantineProvider>,
		);

		expect(markup).toContain("Carteira desconectada");
		expect(markup).toContain("Configuracoes do sistema");
	});

	it("bloqueia quando a carteira nao e dona de nenhum contrato", () => {
		hookState.connected = true;
		hookState.isOwner = false;
		hookState.isDepositOwner = false;
		hookState.isTokenOwner = false;
		hookState.canCreateProposal = false;

		const markup = renderToStaticMarkup(
			<MantineProvider>
				<SystemConfigurationPanel />
			</MantineProvider>,
		);

		expect(markup).toContain("Acesso restrito");
	});
});
