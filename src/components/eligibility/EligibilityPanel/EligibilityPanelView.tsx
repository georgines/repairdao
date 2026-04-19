import { Card, Divider, Stack, Text } from "@mantine/core";
import { BalanceSummary } from "@/components/balance/BalanceSummary";
import { EligibilityPanelHeader } from "@/components/eligibility/EligibilityPanel/EligibilityPanelHeader/EligibilityPanelHeader";
import { EligibilityPanelRoleSection } from "@/components/eligibility/EligibilityPanel/EligibilityPanelRoleSection/EligibilityPanelRoleSection";
import { EligibilityPanelIdentitySection } from "@/components/eligibility/EligibilityPanel/EligibilityPanelIdentitySection/EligibilityPanelIdentitySection";
import { EligibilityPanelStatusSection } from "@/components/eligibility/EligibilityPanel/EligibilityPanelStatusSection/EligibilityPanelStatusSection";
import { EligibilityPanelDepositSection } from "@/components/eligibility/EligibilityPanel/EligibilityPanelDepositSection/EligibilityPanelDepositSection";
import styles from "./EligibilityPanelView.module.css";

export type EligibilityPanelViewProps = {
	ethBalance: string;
	usdBalance: string;
	ethUsdPrice: string;
	tokensPerEth: string;
	rptBalance: string;
	badgeLevel: string;
	isActive: boolean;
	perfilAtivo: "cliente" | "tecnico" | null;
	mostrarSeletoresPapel: boolean;
	perfilSelecionado: "cliente" | "tecnico";
	perfilConfirmacao: "cliente" | "tecnico";
	nome: string;
	areaAtuacao: string;
	identificadorCarteira: string;
	quantidadeRpt: string | number | null;
	quantidadeErro: string | null;
	quantidadeMinima: number;
	acaoLabel: string;
	mensagemAcao: string;
	walletNotice: string | null;
	depositing: boolean;
	error: string | null;
	onPerfilChange: (value: "cliente" | "tecnico") => void;
	onNomeChange: (value: string) => void;
	onAreaAtuacaoChange: (value: string) => void;
	onQuantidadeChange: (value: string | number) => void;
	onDeposit: () => void;
	connected: boolean;
};

export function EligibilityPanelView({
	ethBalance,
	usdBalance,
	ethUsdPrice,
	tokensPerEth,
	rptBalance,
	badgeLevel,
	isActive,
	perfilAtivo,
	mostrarSeletoresPapel,
	perfilSelecionado,
	perfilConfirmacao,
	nome,
	areaAtuacao,
	identificadorCarteira,
	quantidadeRpt,
	quantidadeErro,
	quantidadeMinima,
	acaoLabel,
	mensagemAcao,
	walletNotice,
	depositing,
	error,
	onPerfilChange,
	onNomeChange,
	onAreaAtuacaoChange,
	onQuantidadeChange,
	onDeposit,
	connected,
}: EligibilityPanelViewProps) {
	const quantidadeTexto = typeof quantidadeRpt === "number" ? String(quantidadeRpt) : typeof quantidadeRpt === "string" ? quantidadeRpt.trim() : "";
	const quantidadeNumerica = Number(quantidadeTexto.replace(",", "."));
	const quantidadeValida = quantidadeTexto !== "" && Number.isFinite(quantidadeNumerica) && quantidadeNumerica >= quantidadeMinima;
	const precisaAreaAtuacao = isActive ? perfilAtivo === "cliente" : perfilConfirmacao === "tecnico";
	const podeDepositar = connected && !depositing && quantidadeValida && quantidadeErro === null && nome.trim().length > 0 && (!precisaAreaAtuacao || areaAtuacao.trim().length > 0);
	const mostrarBotaoAcao = !isActive || podeDepositar;
	const perfilExibido = perfilAtivo ?? perfilSelecionado;
	const exibirAreaAtuacao = precisaAreaAtuacao;

	return (
		<Card radius="sm" withBorder shadow="none" padding="lg" className={styles.card}>
			<Stack gap="lg" className={styles.content}>
				<EligibilityPanelHeader />

				<EligibilityPanelRoleSection
					mostrarSeletoresPapel={mostrarSeletoresPapel}
					perfilSelecionado={perfilSelecionado}
					onPerfilChange={onPerfilChange}
				/>

				<EligibilityPanelIdentitySection
					nome={nome}
					areaAtuacao={areaAtuacao}
					identificadorCarteira={identificadorCarteira}
					depositing={depositing}
					exibirAreaAtuacao={exibirAreaAtuacao}
					onNomeChange={onNomeChange}
					onAreaAtuacaoChange={onAreaAtuacaoChange}
				/>

				<Stack gap="md" className={styles.summaryRow}>
					<div className={styles.balanceSummary}>
						<BalanceSummary
							rptBalance={rptBalance}
							tokensPerEth={tokensPerEth}
							ethUsdPrice={ethUsdPrice}
							ethBalance={ethBalance}
							usdBalance={usdBalance}
							note={walletNotice}
						/>
					</div>

					<div className={styles.statusSummary}>
						<EligibilityPanelStatusSection
							badgeLevel={badgeLevel}
							isActive={isActive}
							perfilExibido={perfilExibido}
						/>
					</div>
				</Stack>

				<Divider />

				<EligibilityPanelDepositSection
					quantidadeRpt={quantidadeRpt}
					quantidadeErro={quantidadeErro}
					quantidadeMinima={quantidadeMinima}
					acaoLabel={acaoLabel}
					mensagemAcao={mensagemAcao}
					error={error}
					onQuantidadeChange={onQuantidadeChange}
					onDeposit={onDeposit}
					podeDepositar={podeDepositar}
					mostrarBotaoAcao={mostrarBotaoAcao}
					depositing={depositing}
				/>
			</Stack>
		</Card>
	);
}
