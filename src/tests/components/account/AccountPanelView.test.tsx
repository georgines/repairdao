// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MantineProvider } from "@mantine/core";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { AccountPanelView } from "@/components/account/AccountPanel/AccountPanelView";

function renderWithMantine(node: ReactElement) {
	return renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>);
}

describe("AccountPanelView", () => {
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

	it("renderiza os blocos da conta e as acoes principais", () => {
		const markup = renderWithMantine(
			<AccountPanelView
				walletAddress="0x1234567890abcdef1234567890abcdef12345678"
				walletNotice={null}
				ethBalance="0.5"
				usdBalance="1000"
				ethUsdPrice="2000"
				tokensPerEth="250"
				rptBalance="155"
				deposit="150"
				rewards="5"
				badgeLevel="Ouro"
				reputationLevelName="Platinum"
				perfilAtivo="tecnico"
				isActive={true}
				totalPoints="32"
				positiveRatings="8"
				negativeRatings="1"
				totalRatings="9"
				ratingSum="41"
				averageRating="4,6"
				withdrawingDeposit={false}
				withdrawingRewards={false}
				error={null}
				canWithdrawDeposit={true}
				canWithdrawRewards={true}
				onWithdrawDeposit={() => {}}
				onWithdrawRewards={() => {}}
				connected={true}
			/>,
		);

		expect(markup).toContain("Meu dinheiro depositado, rendimento, nivel e minhas avaliacoes");
		expect(markup).toContain("Saldo atual");
		expect(markup).toContain("RPT 155,00");
		expect(markup).toContain("Conta ativa");
		expect(markup).toContain("Nivel Ouro");
		expect(markup).toContain("Perfil tecnico");
		expect(markup).toContain("RPT 150,00");
		expect(markup).toContain("RPT 5,00");
		expect(markup).toContain("Platinum");
		expect(markup).toContain("4,6/5");
		expect(markup).toContain("Taxa positiva");
		expect(markup).toContain("89%");
		expect(markup).toContain("Soma das notas: 41");
		expect(markup).toContain("Sacar deposito");
		expect(markup).toContain("Sacar rendimentos");
		expect((markup.match(/min-height:140px/g) ?? []).length).toBeGreaterThanOrEqual(4);
	});

	it("mostra estado desconectado e bloqueia as acoes", () => {
		const markup = renderWithMantine(
			<AccountPanelView
				walletAddress={null}
				walletNotice="Carteira desconectada"
				ethBalance="0"
				usdBalance="0"
				ethUsdPrice="0"
				tokensPerEth="0"
				rptBalance="0"
				deposit="0"
				rewards="0"
				badgeLevel="Sem carteira"
				reputationLevelName="None"
				perfilAtivo={null}
				isActive={false}
				totalPoints="0"
				positiveRatings="0"
				negativeRatings="0"
				totalRatings="5"
				ratingSum="0"
				averageRating="0,0"
				withdrawingDeposit={false}
				withdrawingRewards={false}
				error={null}
				canWithdrawDeposit={false}
				canWithdrawRewards={false}
				onWithdrawDeposit={() => {}}
				onWithdrawRewards={() => {}}
				connected={false}
			/>,
		);

		expect(markup).toContain("Conta inativa");
		expect(markup).toContain("Nivel Sem carteira");
		expect(markup).toContain("Carteira desconectada");
		expect(markup).toContain("Conecte a carteira para carregar e sacar os valores da conta.");
		expect(markup).toContain("0%");
	});

	it("mostra taxa zerada quando nao ha avaliacoes registradas", () => {
		const markup = renderWithMantine(
			<AccountPanelView
				walletAddress={null}
				walletNotice={null}
				ethBalance="0"
				usdBalance="0"
				ethUsdPrice="0"
				tokensPerEth="0"
				rptBalance="0"
				deposit="0"
				rewards="0"
				badgeLevel="Sem carteira"
				reputationLevelName="None"
				perfilAtivo={null}
				isActive={false}
				totalPoints="0"
				positiveRatings="0"
				negativeRatings="0"
				totalRatings="0"
				ratingSum="0"
				averageRating="0,0"
				withdrawingDeposit={false}
				withdrawingRewards={false}
				error={null}
				canWithdrawDeposit={false}
				canWithdrawRewards={false}
				onWithdrawDeposit={() => {}}
				onWithdrawRewards={() => {}}
				connected={false}
			/>,
		);

		expect(markup).toContain("0%");
		expect(markup).toContain("(0)");
		expect(markup).toContain("Soma das notas: 0");
	});

	it("propaga os eventos das acoes", async () => {
		const onWithdrawDeposit = vi.fn();
		const onWithdrawRewards = vi.fn();

		await act(async () => {
			root.render(
				<MantineProvider>
					<AccountPanelView
						walletAddress="0x1234567890abcdef1234567890abcdef12345678"
						walletNotice={null}
						ethBalance="0.5"
						usdBalance="1000"
						ethUsdPrice="2000"
						tokensPerEth="250"
						rptBalance="155"
						deposit="150"
						rewards="5"
						badgeLevel="Ouro"
						reputationLevelName="Platinum"
						perfilAtivo={null}
						isActive={true}
						totalPoints="32"
						positiveRatings="8"
						negativeRatings="1"
						totalRatings="9"
						ratingSum="41"
						averageRating="4,6"
						withdrawingDeposit={false}
						withdrawingRewards={false}
						error="falha ao sacar"
						canWithdrawDeposit={true}
						canWithdrawRewards={true}
						onWithdrawDeposit={onWithdrawDeposit}
						onWithdrawRewards={onWithdrawRewards}
						connected={true}
					/>
				</MantineProvider>,
			);
			await Promise.resolve();
		});

		const buttons = Array.from(container.querySelectorAll("button"));
		buttons.find((button) => button.textContent?.includes("Sacar deposito"))?.click();
		buttons.find((button) => button.textContent?.includes("Sacar rendimentos"))?.click();

		expect(onWithdrawDeposit).toHaveBeenCalledTimes(1);
		expect(onWithdrawRewards).toHaveBeenCalledTimes(1);
		expect(container.textContent).toContain("falha ao sacar");
	});
});
