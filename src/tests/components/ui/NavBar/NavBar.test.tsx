import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppShell as MantineAppShell, MantineProvider } from "@mantine/core";
import { NavBar } from "@/components/ui/NavBar/NavBar";

const pathnameState = vi.hoisted(() => ({ value: "/" }));
const profileState = vi.hoisted(() => ({ perfilAtivo: "cliente" as "cliente" | "tecnico" | null }));
const depositAccessState = vi.hoisted(() => ({ isOwner: false }));

vi.mock("next/navigation", () => ({
	usePathname: () => pathnameState.value,
}));

vi.mock("@/hooks/useAccountProfile", () => ({
	useAccountProfile: () => ({
		perfilAtivo: profileState.perfilAtivo,
	}),
}));

vi.mock("@/hooks/useSystemConfigurationAccess", () => ({
	useSystemConfigurationAccess: () => ({
		isOwner: depositAccessState.isOwner,
		isDepositOwner: depositAccessState.isOwner,
		isTokenOwner: depositAccessState.isOwner,
		loading: false,
		error: null,
		configuracao: null,
		donoDepositoAtual: null,
		donoDepositoAtualCurto: "Carteira desconectada",
		donoTokenAtual: null,
		donoTokenAtualCurto: "Carteira desconectada",
		connected: false,
		walletAddress: null,
		refresh: async () => null,
	}),
}));

function renderWithMantine(node: ReactElement) {
	return renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>);
}

describe("components/ui/NavBar/NavBar", () => {
	it("destaca a rota ativa na navbar", () => {
		pathnameState.value = "/account";
		profileState.perfilAtivo = "cliente";
		depositAccessState.isOwner = false;

		const markup = renderWithMantine(
			<MantineAppShell header={{ height: 4 }} navbar={{ width: 280, breakpoint: 0 }}>
				<MantineAppShell.Navbar>
					<NavBar />
				</MantineAppShell.Navbar>
			</MantineAppShell>,
		);

		expect(markup).toContain('data-active="true"');
		expect(markup).toContain("Minha conta");
		expect(markup).toContain("Loja");
		expect(markup).toContain("Elegibilidade");
		expect(markup).toContain("Servicos");
		expect(markup).toContain("Disputas");
		expect(markup).toContain("Tecnicos disponiveis");
	});

	it("mantem a rota pai ativa em subrotas", () => {
		pathnameState.value = "/store/orders";
		profileState.perfilAtivo = "tecnico";
		depositAccessState.isOwner = false;

		const markup = renderWithMantine(
			<MantineAppShell header={{ height: 4 }} navbar={{ width: 280, breakpoint: 0 }}>
				<MantineAppShell.Navbar>
					<NavBar onNavigate={() => {}} />
				</MantineAppShell.Navbar>
			</MantineAppShell>,
		);

		expect(markup).toContain('href="/store"');
		expect(markup).toContain('data-active="true"');
		expect(markup).toContain("Disputas");
		expect(markup).not.toContain('href="/technicians"');
	});

	it("exibe a configuracao do deposito somente para o dono", () => {
		pathnameState.value = "/eligibility";
		profileState.perfilAtivo = "cliente";
		depositAccessState.isOwner = true;

		const markup = renderWithMantine(
			<MantineAppShell header={{ height: 4 }} navbar={{ width: 280, breakpoint: 0 }}>
				<MantineAppShell.Navbar>
					<NavBar />
				</MantineAppShell.Navbar>
			</MantineAppShell>,
		);

		expect(markup).toContain("Configuracoes do sistema");
		expect(markup).toContain('href="/eligibility/configuration"');
	});
});
