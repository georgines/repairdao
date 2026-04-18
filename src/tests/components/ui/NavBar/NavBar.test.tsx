import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppShell as MantineAppShell, MantineProvider } from "@mantine/core";
import { NavBar } from "@/components/ui/NavBar/NavBar";

const pathnameState = vi.hoisted(() => ({ value: "/" }));
const profileState = vi.hoisted(() => ({ perfilAtivo: "cliente" as "cliente" | "tecnico" | null }));

vi.mock("next/navigation", () => ({
	usePathname: () => pathnameState.value,
}));

vi.mock("@/hooks/useAccountProfile", () => ({
	useAccountProfile: () => ({
		perfilAtivo: profileState.perfilAtivo,
	}),
}));

function renderWithMantine(node: ReactElement) {
	return renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>);
}

describe("components/ui/NavBar/NavBar", () => {
	it("destaca a rota ativa na navbar", () => {
		pathnameState.value = "/account";
		profileState.perfilAtivo = "cliente";

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
		expect(markup).toContain("Tecnicos");
		expect(markup).not.toContain("Servicos");
	});

	it("mantem a rota pai ativa em subrotas", () => {
		pathnameState.value = "/store/orders";
		profileState.perfilAtivo = "tecnico";

		const markup = renderWithMantine(
			<MantineAppShell header={{ height: 4 }} navbar={{ width: 280, breakpoint: 0 }}>
				<MantineAppShell.Navbar>
					<NavBar onNavigate={() => {}} />
				</MantineAppShell.Navbar>
			</MantineAppShell>,
		);

		expect(markup).toContain('href="/store"');
		expect(markup).toContain('data-active="true"');
		expect(markup).toContain("Servicos");
		expect(markup).not.toContain("Tecnicos");
	});
});
