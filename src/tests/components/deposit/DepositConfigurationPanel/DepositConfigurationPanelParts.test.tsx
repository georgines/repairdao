import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MantineProvider } from "@mantine/core";
import { DepositConfigurationPanelAccessNotice } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelAccessNotice/DepositConfigurationPanelAccessNotice";
import { DepositConfigurationPanelAlerts } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelAlerts/DepositConfigurationPanelAlerts";
import { DepositConfigurationPanelDisconnectedNotice } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelDisconnectedNotice/DepositConfigurationPanelDisconnectedNotice";
import { DepositConfigurationPanelForm } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelForm/DepositConfigurationPanelForm";
import { DepositConfigurationPanelFormError } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelFormError/DepositConfigurationPanelFormError";
import { DepositConfigurationPanelFormField } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelFormField/DepositConfigurationPanelFormField";
import { DepositConfigurationPanelFormFooter } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelFormFooter/DepositConfigurationPanelFormFooter";
import { DepositConfigurationPanelHeader } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelHeader/DepositConfigurationPanelHeader";
import { DepositConfigurationPanelHeaderDetails } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelHeaderDetails/DepositConfigurationPanelHeaderDetails";
import { DepositConfigurationPanelHeaderTop } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelHeaderTop/DepositConfigurationPanelHeaderTop";
import { DepositConfigurationPanelLoadError } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelLoadError/DepositConfigurationPanelLoadError";
import { DepositConfigurationPanelLoading } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelLoading/DepositConfigurationPanelLoading";
import { DepositConfigurationPanelRestrictedNotice } from "@/components/deposit/DepositConfigurationPanel/DepositConfigurationPanelRestrictedNotice/DepositConfigurationPanelRestrictedNotice";

describe("DepositConfigurationPanel parts", () => {
	it("mostra o estado de carregamento", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<DepositConfigurationPanelLoading />
			</MantineProvider>,
		);

		expect(markup).toContain("Carregando configuracao do deposito");
	});

	it("mostra a mensagem de acesso desconectado e restrito", () => {
		const disconnected = renderToStaticMarkup(
			<MantineProvider>
				<DepositConfigurationPanelAccessNotice connected={false} canCreateProposal={false} />
			</MantineProvider>,
		);
		const restricted = renderToStaticMarkup(
			<MantineProvider>
				<DepositConfigurationPanelAccessNotice connected={true} canCreateProposal={false} />
			</MantineProvider>,
		);

		expect(disconnected).toContain("Carteira desconectada");
		expect(restricted).toContain("Acesso restrito");
	});

	it("mostra o cabeçalho com os dados de saldo e dono", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<DepositConfigurationPanelHeader
					statusLabel="Dono autenticado"
					statusColor="teal"
					minDeposit="100"
					donoAtualCurto="0xowne...wner"
					walletNotice="0xowner"
				/>
			</MantineProvider>,
		);

		expect(markup).toContain("Deposito minimo para ativacao");
		expect(markup).toContain("Valor atual");
		expect(markup).toContain("0xowner");
	});

	it("mostra os blocos pequenos do cabeçalho", () => {
		const topMarkup = renderToStaticMarkup(
			<MantineProvider>
				<DepositConfigurationPanelHeaderTop statusLabel="Dono autenticado" statusColor="teal" />
			</MantineProvider>,
		);
		const detailsMarkup = renderToStaticMarkup(
			<MantineProvider>
				<DepositConfigurationPanelHeaderDetails minDeposit="100" donoAtualCurto="0xowner" walletNotice="0xowner" />
			</MantineProvider>,
		);

		expect(topMarkup).toContain("Deposito minimo para ativacao");
		expect(detailsMarkup).toContain("Carteira conectada");
	});

	it("mostra os alertas combinados", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<DepositConfigurationPanelAlerts error="Falha ao carregar" formError="Falha ao salvar" />
			</MantineProvider>,
		);

		expect(markup).toContain("Falha ao carregar");
		expect(markup).toContain("Falha ao salvar");
	});

	it("mostra os alertas pequenos", () => {
		const loadMarkup = renderToStaticMarkup(
			<MantineProvider>
				<DepositConfigurationPanelLoadError message="Falha ao carregar" />
			</MantineProvider>,
		);
		const formMarkup = renderToStaticMarkup(
			<MantineProvider>
				<DepositConfigurationPanelFormError message="Falha ao salvar" />
			</MantineProvider>,
		);

		expect(loadMarkup).toContain("Falha ao carregar");
		expect(formMarkup).toContain("Falha ao salvar");
	});

	it("mostra o formulario com rodape correto", () => {
		const markup = renderToStaticMarkup(
			<MantineProvider>
				<DepositConfigurationPanelForm
					connected={true}
					isOwner={true}
					editingMinDeposit="100"
					saving={false}
					onEditingMinDepositChange={() => {}}
					onSubmit={async () => {}}
				/>
			</MantineProvider>,
		);

		expect(markup).toContain("Deposito minimo (RPT)");
		expect(markup).toContain("Criar proposta");
		expect(markup).toContain("A mudanca sera enviada como proposta de governanca.");
	});

	it("mostra os blocos pequenos do formulario e do acesso", () => {
		const fieldMarkup = renderToStaticMarkup(
			<MantineProvider>
				<DepositConfigurationPanelFormField
					connected={true}
					isOwner={true}
					editingMinDeposit="100"
					saving={false}
					onEditingMinDepositChange={() => {}}
				/>
			</MantineProvider>,
		);
		const footerMarkup = renderToStaticMarkup(
			<MantineProvider>
				<DepositConfigurationPanelFormFooter connected={true} isOwner={true} saving={false} onSubmit={async () => {}} />
			</MantineProvider>,
		);
		const disconnectedMarkup = renderToStaticMarkup(
			<MantineProvider>
				<DepositConfigurationPanelDisconnectedNotice />
			</MantineProvider>,
		);
		const restrictedMarkup = renderToStaticMarkup(
			<MantineProvider>
				<DepositConfigurationPanelRestrictedNotice />
			</MantineProvider>,
		);

		expect(fieldMarkup).toContain("Deposito minimo (RPT)");
		expect(footerMarkup).toContain("Criar proposta");
		expect(disconnectedMarkup).toContain("Carteira desconectada");
		expect(restrictedMarkup).toContain("Acesso restrito");
	});
});
