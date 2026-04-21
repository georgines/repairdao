import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MantineProvider } from "@mantine/core";
import { DepositConfigurationPanel } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanel";

const hookState = vi.hoisted(() => ({
	connected: true,
	isOwner: true,
	canCreateProposal: true,
	loading: false,
	error: null as string | null,
	formError: null as string | null,
	walletAddress: "0xowner",
	donoAtualCurto: "0xowne...wner",
	minDeposit: "100",
	editingMinDeposit: "100",
	saving: false,
}));

vi.mock("@/hooks/useDepositConfiguration", () => ({
	useDepositConfiguration: () => ({
		connected: hookState.connected,
		isOwner: hookState.isOwner,
		canCreateProposal: hookState.canCreateProposal,
		loading: hookState.loading,
		error: hookState.error,
		formError: hookState.formError,
		walletAddress: hookState.walletAddress,
		donoAtualCurto: hookState.donoAtualCurto,
		minDeposit: hookState.minDeposit,
		editingMinDeposit: hookState.editingMinDeposit,
		saving: hookState.saving,
		setEditingMinDeposit: () => {},
		submit: async () => {},
	}),
}));

describe("DepositConfigurationPanel", () => {
	beforeEach(() => {
		hookState.connected = true;
		hookState.isOwner = true;
		hookState.canCreateProposal = true;
		hookState.loading = false;
		hookState.error = null;
		hookState.formError = null;
		hookState.walletAddress = "0xowner";
		hookState.donoAtualCurto = "0xowne...wner";
		hookState.minDeposit = "100";
		hookState.editingMinDeposit = "100";
		hookState.saving = false;
	});

	it("mostra a interface quando a carteira e do dono", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<DepositConfigurationPanel />
			</MantineProvider>,
		);

		expect(markup).toContain("Deposito minimo para ativacao");
		expect(markup).toContain("Valor atual");
		expect(markup).toContain("Criar proposta");
	});

	it("bloqueia quando a carteira esta desconectada", () => {
		hookState.connected = false;
		hookState.isOwner = false;
		hookState.canCreateProposal = false;

		const markup = renderToStaticMarkup(
			<MantineProvider>
				<DepositConfigurationPanel />
			</MantineProvider>,
		);

		expect(markup).toContain("Carteira desconectada");
	});

	it("bloqueia quando a carteira nao e do dono", () => {
		hookState.connected = true;
		hookState.isOwner = false;
		hookState.canCreateProposal = false;

		const markup = renderToStaticMarkup(
			<MantineProvider>
				<DepositConfigurationPanel />
			</MantineProvider>,
		);

		expect(markup).toContain("Acesso restrito");
	});
});
