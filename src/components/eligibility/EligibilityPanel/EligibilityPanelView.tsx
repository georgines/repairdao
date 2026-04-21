import { Card, Divider, Stack } from "@mantine/core";
import { BalanceSummary } from "@/components/balance/BalanceSummary";
import { EligibilityPanelHeader } from "@/components/eligibility/EligibilityPanel/EligibilityPanelHeader/EligibilityPanelHeader";
import { EligibilityPanelRoleSection } from "@/components/eligibility/EligibilityPanel/EligibilityPanelRoleSection/EligibilityPanelRoleSection";
import { EligibilityPanelIdentitySection } from "@/components/eligibility/EligibilityPanel/EligibilityPanelIdentitySection/EligibilityPanelIdentitySection";
import { EligibilityPanelStatusSection } from "@/components/eligibility/EligibilityPanel/EligibilityPanelStatusSection/EligibilityPanelStatusSection";
import { EligibilityPanelDepositSection } from "@/components/eligibility/EligibilityPanel/EligibilityPanelDepositSection/EligibilityPanelDepositSection";
import styles from "./EligibilityPanelView.module.css";

export type EligibilityPanelBalanceProps = {
	ethBalance: string;
	usdBalance: string;
	ethUsdPrice: string;
	tokensPerEth: string;
	rptBalance: string;
	walletNotice: string | null;
};

export type EligibilityPanelStatusProps = {
	badgeLevel: string;
	isActive: boolean;
	perfilAtivo: "cliente" | "tecnico" | null;
};

export type EligibilityPanelRegistrationProps = {
	mostrarSeletoresPapel: boolean;
	perfilSelecionado: "cliente" | "tecnico";
	perfilConfirmacao: "cliente" | "tecnico";
	nome: string;
	areaAtuacao: string;
	identificadorCarteira: string;
	depositing: boolean;
	onPerfilChange: (value: "cliente" | "tecnico") => void;
	onNomeChange: (value: string) => void;
	onAreaAtuacaoChange: (value: string) => void;
};

export type EligibilityPanelDepositProps = {
	quantidadeRpt: string | number | null;
	quantidadeErro: string | null;
	quantidadeMinima: number;
	acaoLabel: string;
	mensagemAcao: string;
	error: string | null;
	connected: boolean;
	onQuantidadeChange: (value: string | number) => void;
	onDeposit: () => void;
};

export type EligibilityPanelViewProps = {
	balance: EligibilityPanelBalanceProps;
	status: EligibilityPanelStatusProps;
	registration: EligibilityPanelRegistrationProps;
	deposit: EligibilityPanelDepositProps;
};

export function EligibilityPanelView({ balance, status, registration, deposit }: EligibilityPanelViewProps) {
	const quantidadeTexto =
		typeof deposit.quantidadeRpt === "number"
			? String(deposit.quantidadeRpt)
			: typeof deposit.quantidadeRpt === "string"
				? deposit.quantidadeRpt.trim()
				: "";
	const quantidadeNumerica = Number(quantidadeTexto.replace(",", "."));
	const quantidadeValida =
		quantidadeTexto !== "" && Number.isFinite(quantidadeNumerica) && quantidadeNumerica >= deposit.quantidadeMinima;
	const precisaAreaAtuacao = status.isActive ? status.perfilAtivo === "cliente" : registration.perfilConfirmacao === "tecnico";
	const podeDepositar =
		deposit.connected &&
		!registration.depositing &&
		quantidadeValida &&
		deposit.quantidadeErro === null &&
		registration.nome.trim().length > 0 &&
		(!precisaAreaAtuacao || registration.areaAtuacao.trim().length > 0);
	const mostrarBotaoAcao = !status.isActive || podeDepositar;
	const perfilExibido = status.perfilAtivo ?? registration.perfilSelecionado;
	const exibirAreaAtuacao = precisaAreaAtuacao;

	return (
		<Card radius="sm" withBorder shadow="none" padding="lg" className={styles.card}>
			<Stack gap="lg" className={styles.content}>
				<EligibilityPanelHeader />

				<EligibilityPanelRoleSection
					mostrarSeletoresPapel={registration.mostrarSeletoresPapel}
					perfilSelecionado={registration.perfilSelecionado}
					onPerfilChange={registration.onPerfilChange}
				/>

				<EligibilityPanelIdentitySection
					nome={registration.nome}
					areaAtuacao={registration.areaAtuacao}
					identificadorCarteira={registration.identificadorCarteira}
					depositing={registration.depositing}
					exibirAreaAtuacao={exibirAreaAtuacao}
					onNomeChange={registration.onNomeChange}
					onAreaAtuacaoChange={registration.onAreaAtuacaoChange}
				/>

				<Stack gap="md" className={styles.summaryRow}>
					<div className={styles.balanceSummary}>
						<BalanceSummary
							rptBalance={balance.rptBalance}
							tokensPerEth={balance.tokensPerEth}
							ethUsdPrice={balance.ethUsdPrice}
							ethBalance={balance.ethBalance}
							usdBalance={balance.usdBalance}
							note={balance.walletNotice}
						/>
					</div>

					<div className={styles.statusSummary}>
						<EligibilityPanelStatusSection
							badgeLevel={status.badgeLevel}
							isActive={status.isActive}
							perfilExibido={perfilExibido}
						/>
					</div>
				</Stack>

				<Divider />

				<EligibilityPanelDepositSection
					quantidadeRpt={deposit.quantidadeRpt}
					quantidadeErro={deposit.quantidadeErro}
					quantidadeMinima={deposit.quantidadeMinima}
					acaoLabel={deposit.acaoLabel}
					mensagemAcao={deposit.mensagemAcao}
					error={deposit.error}
					onQuantidadeChange={deposit.onQuantidadeChange}
					onDeposit={deposit.onDeposit}
					podeDepositar={podeDepositar}
					mostrarBotaoAcao={mostrarBotaoAcao}
					depositing={registration.depositing}
				/>
			</Stack>
		</Card>
	);
}
