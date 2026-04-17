import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { AppShell as MantineAppShell, MantineProvider } from "@mantine/core";
import Home from "@/app/page";
import StorePage from "@/app/store/page";
import AppShell from "@/components/ui/AppShell/AppShell";
import { NavBar } from "@/components/ui/NavBar/NavBar";

const pathnameState = vi.hoisted(() => ({ value: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameState.value,
}));

function renderWithMantine(node: ReactElement) {
  return renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>);
}

describe("fase 1 da interface", () => {
  it("renderiza a home com atalho para a loja", () => {
    const markup = renderWithMantine(<Home />);

    expect(markup).toContain("Economia inicial do RepairDAO");
    expect(markup).toContain("Ir para a loja");
    expect(markup).toContain('href="/store"');
  });

  it("renderiza a loja com o card de compra de tokens", () => {
    const markup = renderWithMantine(<StorePage />);

    expect(markup).toContain("Comprar tokens");
    expect(markup).toContain("Saldo mínimo");
  });

  it("destaca a rota ativa na navbar", () => {
    pathnameState.value = "/store";

    const markup = renderWithMantine(
      <MantineAppShell header={{ height: 4 }} navbar={{ width: 280, breakpoint: 0 }}>
        <MantineAppShell.Navbar>
          <NavBar />
        </MantineAppShell.Navbar>
      </MantineAppShell>,
    );

    expect(markup).toContain('data-active="true"');
    expect(markup).toContain("Loja");
  });

  it("mantem a rota pai ativa em subrotas", () => {
    pathnameState.value = "/store/orders";

    const markup = renderWithMantine(
      <MantineAppShell header={{ height: 4 }} navbar={{ width: 280, breakpoint: 0 }}>
        <MantineAppShell.Navbar>
          <NavBar onNavigate={() => {}} />
        </MantineAppShell.Navbar>
      </MantineAppShell>,
    );

    expect(markup).toContain('href="/store"');
    expect(markup).toContain('data-active="true"');
  });

  it("envolve o conteúdo no shell global", () => {
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
