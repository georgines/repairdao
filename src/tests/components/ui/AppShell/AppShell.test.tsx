import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AppShell from "@/components/ui/AppShell/AppShell";

vi.mock("next/navigation", () => ({
	usePathname: () => "/",
}));

vi.mock("@/hooks/useAccountProfile", () => ({
	useAccountProfile: () => ({
		perfilAtivo: "cliente",
	}),
}));

vi.mock("@/hooks/useSystemConfigurationAccess", () => ({
	useSystemConfigurationAccess: () => ({
		isOwner: false,
		isDepositOwner: false,
		isTokenOwner: false,
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

describe("components/ui/AppShell/AppShell", () => {
	it("envolve o conteudo no shell global", () => {
		const markup = renderToStaticMarkup(
			<AppShell>
				<div>conteudo</div>
			</AppShell>,
		);

		expect(markup).toContain("conteudo");
		expect(markup).toContain("RepairDAO");
		expect(markup).toContain("Toggle navigation");
	});
});
