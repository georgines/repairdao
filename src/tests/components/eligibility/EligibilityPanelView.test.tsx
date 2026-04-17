// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { EligibilityPanelView } from "@/components/eligibility/EligibilityPanel/EligibilityPanelView";

function renderWithMantine(node: ReactElement) {
	return renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>);
}

const baseProps = {
	ethBalance: "0.5",
	usdBalance: "1000",
	ethUsdPrice: "2000",
	tokensPerEth: "250",
	rptBalance: "10",
	badgeLevel: "bronze",
	isActive: false,
	perfilAtivo: null,
	mostrarSeletoresPapel: true,
	perfilSelecionado: "cliente" as const,
	perfilConfirmacao: "cliente" as const,
	nome: "Ana",
	areaAtuacao: "",
	identificadorCarteira: "0x1234567890abcdef1234567890abcdef12345678",
	quantidadeRpt: null as string | number | null,
	quantidadeErro: null as string | null,
	quantidadeMinima: 100,
	acaoLabel: "Ativar como cliente",
	mensagemAcao: "Ao ativar como cliente, o valor digitado sera confirmado antes de salvar o cadastro.",
	walletNotice: null as string | null,
	depositing: false,
	error: null as string | null,
	onPerfilChange: vi.fn(),
	onNomeChange: vi.fn(),
	onAreaAtuacaoChange: vi.fn(),
	onQuantidadeChange: vi.fn(),
	onDeposit: vi.fn(),
	connected: true,
};

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

	it("renderiza o cadastro, o seletor de papel e o card de nivel", async () => {
		const markup = renderWithMantine(<EligibilityPanelView {...baseProps} />);

		expect(markup).toContain("Depositar RPT e ativar conta");
		expect(markup).toContain("Definir papel");
		expect(markup).toContain("Nome do usuario");
		expect(markup).toContain("Identificador da carteira");
		expect(markup).toContain("Nivel do cliente");
		expect(markup).toContain("Quanto RPT deseja depositar");
		expect(markup).toContain("Ativar como cliente");
		expect(markup).toContain("RPT 10,00");
		expect(markup).toContain("ETH comprado 0,0400");
		expect(markup).toContain("USD comprado US$");
		expect(markup).toContain("80,00");
		expect(markup).toContain("0x1234567890abcdef1234567890abcdef12345678");
	});

	it("mostra estado desconectado e bloqueia o deposito", () => {
		const markup = renderWithMantine(
			<EligibilityPanelView
				{...baseProps}
				connected={false}
				ethBalance="0"
				usdBalance="0"
				rptBalance="0"
				badgeLevel="Sem carteira"
				walletNotice="Carteira desconectada"
				quantidadeErro="O valor para deposito deve ser maior ou igual a 100 RPT."
				identificadorCarteira=""
			/>,
		);

		expect(markup).toContain("Carteira desconectada");
		expect(markup).toContain("O valor para deposito deve ser maior ou igual a 100 RPT.");
		expect(markup).toContain("Nivel do cliente");
		expect(markup).toContain("USD comprado US$");
		expect(markup).toContain("0,00");
	});

	it("exibe saldo de RPT grande sem abreviacao", () => {
		const markup = renderWithMantine(
			<EligibilityPanelView
				{...baseProps}
				isActive={true}
				perfilAtivo="cliente"
				mostrarSeletoresPapel={false}
				perfilConfirmacao="tecnico"
				areaAtuacao="Eletrica"
				rptBalance="1000000"
				tokensPerEth="1000000"
				acaoLabel="Trocar para tecnico"
				mensagemAcao="Ao trocar para tecnico, o saldo atual sera sacado, a confirmacao sera aguardada e o cadastro sera salvo depois da confirmacao."
			/>,
		);

		expect(markup).toContain("RPT 1.000.000,00");
		expect(markup).toContain("Area de atuacao");
	});

	it("oculta os seletores quando a conta esta ativa e troca com um unico botao", async () => {
		const onPerfilChange = vi.fn();
		const onDeposit = vi.fn();

		await act(async () => {
			root.render(
				<MantineProvider>
					<EligibilityPanelView
						{...baseProps}
						isActive={true}
						perfilAtivo="cliente"
						mostrarSeletoresPapel={false}
						perfilConfirmacao="tecnico"
						areaAtuacao="Eletrica"
						quantidadeRpt={2}
						quantidadeErro={null}
						acaoLabel="Trocar para tecnico"
						mensagemAcao="Ao trocar para tecnico, o saldo atual sera sacado, a confirmacao sera aguardada e o cadastro sera salvo depois da confirmacao."
						error="falha no deposito"
						onPerfilChange={onPerfilChange}
						onDeposit={onDeposit}
					/>
				</MantineProvider>,
			);
			await Promise.resolve();
		});

		const buttons = Array.from(container.querySelectorAll("button"));
		const clienteButton = buttons.find((button) => button.textContent?.includes("Cliente"));
		const tecnicoButton = buttons.find((button) => button.textContent?.includes("Tecnico"));
		const depositButton = buttons.find((button) => button.textContent?.includes("Trocar para tecnico"));

		if (clienteButton || tecnicoButton || !depositButton) {
			throw new Error("Botoes esperados nao encontrados.");
		}

		await act(async () => {
			depositButton.click();
			await Promise.resolve();
		});

		expect(onPerfilChange).not.toHaveBeenCalled();
		expect(onDeposit).toHaveBeenCalledTimes(1);
		expect(container.textContent).toContain("falha no deposito");
		expect(container.textContent).toContain("Papel registrado");
	});

	it("destaca o papel tecnico antes da ativacao", () => {
		const markup = renderWithMantine(
			<EligibilityPanelView
				{...baseProps}
				perfilSelecionado="tecnico"
				perfilConfirmacao="tecnico"
				areaAtuacao="Eletrica"
				acaoLabel="Ativar como tecnico"
				mensagemAcao="Ao ativar como tecnico, o valor digitado sera confirmado antes de salvar o cadastro."
			/>,
		);

		expect(markup).toContain("Definir papel");
		expect(markup).toContain("Ativar como tecnico");
		expect(markup).toContain("Tecnico");
		expect(markup).toContain("Area de atuacao");
	});

	it("dispara os handlers dos seletores e entradas", async () => {
		const onPerfilChange = vi.fn();
		const onNomeChange = vi.fn();
		const onAreaAtuacaoChange = vi.fn();
		const onQuantidadeChange = vi.fn();

		await act(async () => {
			root.render(
				<MantineProvider>
					<EligibilityPanelView
						{...baseProps}
						onPerfilChange={onPerfilChange}
						onNomeChange={onNomeChange}
						onAreaAtuacaoChange={onAreaAtuacaoChange}
						onQuantidadeChange={onQuantidadeChange}
						perfilSelecionado="tecnico"
						perfilConfirmacao="tecnico"
						areaAtuacao="Eletrica"
					/>
				</MantineProvider>,
			);
			await Promise.resolve();
		});

		fireEvent.click(screen.getByRole("button", { name: "Cliente" }));
		fireEvent.click(screen.getByRole("button", { name: "Tecnico" }));
		fireEvent.change(screen.getByRole("textbox", { name: "Nome do usuario" }), {
			target: { value: "Maria" },
		});
		fireEvent.change(screen.getByPlaceholderText("Ex.: eletrica residencial"), {
			target: { value: "Redes" },
		});
		fireEvent.change(screen.getByRole("textbox", { name: "Quanto RPT deseja depositar" }), {
			target: { value: "250" },
		});

		expect(onPerfilChange).toHaveBeenCalledWith("tecnico");
		expect(onNomeChange).toHaveBeenCalledWith("Maria");
		expect(onAreaAtuacaoChange).toHaveBeenCalledWith("Redes");
		expect(onQuantidadeChange).toHaveBeenCalled();
	});
});
