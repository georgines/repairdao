// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MantineProvider } from "@mantine/core";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { EligibilityPanelView } from "@/components/eligibility/EligibilityPanel/EligibilityPanelView";

function renderWithMantine(node: ReactElement) {
	return renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>);
}

describe("EligibilityPanelView", () => {
	let container: HTMLDivElement;
	let root: ReturnType<typeof createRoot>;

	beforeEach(() => {
		(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
		(globalThis as typeof globalThis & { ResizeObserver?: typeof ResizeObserver }).ResizeObserver = class {
			observe() {}
			unobserve() {}
			disconnect() {}
		};
		window.matchMedia = vi.fn().mockReturnValue({
			matches: false,
			media: "",
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		});
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
	});

	afterEach(async () => {
		await act(async () => {
			root.unmount();
			await Promise.resolve();
		});
		container.remove();
	});

	it("renderiza o seletor de papel, o campo de valor e o card de nivel", async () => {
		const markup = renderWithMantine(
			<EligibilityPanelView
				ethBalance="0.5"
				usdBalance="1000"
				rptBalance="10"
				badgeLevel="bronze"
				isActive={true}
				perfilSelecionado="cliente"
				quantidadeRpt={null}
				quantidadeErro={null}
				quantidadeMinima={100}
				acaoLabel="Mudar para cliente"
				mensagemAcao="Ao mudar para cliente, todo o valor atual sera sacado e o valor digitado sera o inicio do novo nivel."
				walletNotice={null}
				depositing={false}
				error={null}
				onPerfilChange={() => {}}
				onQuantidadeChange={() => {}}
				onDeposit={() => {}}
				connected={true}
			/>,
		);

		expect(markup).toContain("Depositar RPT e ativar conta");
		expect(markup).toContain("Definir papel");
		expect(markup).toContain("Cliente");
		expect(markup).toContain("Tecnico");
		expect(markup).toContain("Nivel do cliente");
		expect(markup).toContain("Conta ativa");
		expect(markup).toContain("Quanto RPT deseja depositar");
		expect(markup).toContain("Mudar para cliente");
		expect(markup).toContain("RPT 10,00");
		expect(markup).toContain("ETH 0,5000");
		expect(markup).toContain("1.000,00");
		expect(markup).toContain("Valor minimo: 100 RPT.");

		await act(async () => {
			root.render(
				<MantineProvider>
					<EligibilityPanelView
						ethBalance="0.5"
						usdBalance="1000"
						rptBalance="10"
						badgeLevel="bronze"
						isActive={true}
						perfilSelecionado="cliente"
						quantidadeRpt={null}
						quantidadeErro={null}
						quantidadeMinima={100}
						acaoLabel="Mudar para cliente"
						mensagemAcao="Ao mudar para cliente, todo o valor atual sera sacado e o valor digitado sera o inicio do novo nivel."
						walletNotice={null}
						depositing={false}
						error={null}
						onPerfilChange={() => {}}
						onQuantidadeChange={() => {}}
						onDeposit={() => {}}
						connected={true}
					/>
				</MantineProvider>,
			);
			await Promise.resolve();
		});

		const buttons = Array.from(container.querySelectorAll("button"));
		expect(buttons.some((button) => button.textContent?.includes("Cliente"))).toBe(true);
		expect(buttons.some((button) => button.textContent?.includes("Tecnico"))).toBe(true);
	});

	it("mostra estado desconectado e bloqueia o deposito", () => {
		const markup = renderWithMantine(
			<EligibilityPanelView
				ethBalance="0"
				usdBalance="0"
				rptBalance="0"
				badgeLevel="Sem carteira"
				isActive={false}
				perfilSelecionado="cliente"
				quantidadeRpt={0}
				quantidadeErro="O valor para deposito deve ser maior ou igual a 100 RPT."
				quantidadeMinima={100}
				acaoLabel="Mudar para cliente"
				mensagemAcao="Ao mudar para cliente, todo o valor atual sera sacado e o valor digitado sera o inicio do novo nivel."
				walletNotice="Carteira desconectada"
				depositing={false}
				error={null}
				onPerfilChange={() => {}}
				onQuantidadeChange={() => {}}
				onDeposit={() => {}}
				connected={false}
			/>,
		);

		expect(markup).toContain("Carteira desconectada");
		expect(markup).toContain("O valor para deposito deve ser maior ou igual a 100 RPT.");
		expect(markup).toContain("Nivel do cliente");
	});

	it("propaga a troca de perfil e o clique de deposito", async () => {
		const onPerfilChange = vi.fn();
		const onDeposit = vi.fn();

		await act(async () => {
			root.render(
				<MantineProvider>
					<EligibilityPanelView
						ethBalance="0"
						usdBalance="0"
						rptBalance="5"
						badgeLevel="bronze"
						isActive={false}
						perfilSelecionado="tecnico"
						quantidadeRpt={2}
						quantidadeErro={null}
						quantidadeMinima={100}
						acaoLabel="Depositar mais como tecnico"
						mensagemAcao="Ao manter tecnico, voce pode depositar mais RPT sem sacar o saldo atual."
						walletNotice={null}
						depositing={false}
						error="falha no deposito"
						onPerfilChange={onPerfilChange}
						onQuantidadeChange={() => {}}
						onDeposit={onDeposit}
						connected={true}
					/>
				</MantineProvider>,
			);
			await Promise.resolve();
		});

		const buttons = Array.from(container.querySelectorAll("button"));
		const clienteButton = buttons.find((button) => button.textContent?.includes("Cliente"));
		const tecnicoButton = buttons.find((button) => button.textContent?.includes("Tecnico"));
		const depositButton = buttons.find((button) => button.textContent?.includes("Depositar mais"));

		if (!clienteButton || !tecnicoButton || !depositButton) {
			throw new Error("Botoes esperados nao encontrados.");
		}

		await act(async () => {
			clienteButton.click();
			tecnicoButton.click();
			depositButton.click();
			await Promise.resolve();
		});

		expect(onPerfilChange).toHaveBeenCalledWith("cliente");
		expect(onPerfilChange).toHaveBeenCalledWith("tecnico");
		expect(onDeposit).toHaveBeenCalledTimes(1);
		expect(container.textContent).toContain("falha no deposito");
		expect(container.textContent).toContain("Nivel do tecnico");
	});
});
