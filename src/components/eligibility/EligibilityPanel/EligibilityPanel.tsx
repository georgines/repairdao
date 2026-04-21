"use client";

import { useEligibilityPanel } from "@/hooks/useEligibilityPanel";
import { EligibilityPanelView } from "@/components/eligibility/EligibilityPanel/EligibilityPanelView";

export function EligibilityPanel() {
	const panel = useEligibilityPanel();

	return (
		<EligibilityPanelView
			balance={{
				ethBalance: panel.ethBalance,
				usdBalance: panel.usdBalance,
				ethUsdPrice: panel.ethUsdPrice,
				tokensPerEth: panel.tokensPerEth,
				rptBalance: panel.rptBalance,
				walletNotice: panel.walletNotice,
			}}
			status={{
				badgeLevel: panel.badgeLevel,
				isActive: panel.isActive,
				perfilAtivo: panel.perfilAtivo,
			}}
			registration={{
				mostrarSeletoresPapel: panel.mostrarSeletoresPapel,
				perfilSelecionado: panel.perfilSelecionado,
				perfilConfirmacao: panel.perfilConfirmacao,
				nome: panel.nome,
				areaAtuacao: panel.areaAtuacao,
				identificadorCarteira: panel.identificadorCarteira,
				depositing: panel.depositing,
				onPerfilChange: panel.handlePerfilChange,
				onNomeChange: panel.handleNomeChange,
				onAreaAtuacaoChange: panel.handleAreaAtuacaoChange,
			}}
			deposit={{
				quantidadeRpt: panel.quantidadeRpt,
				quantidadeErro: panel.quantidadeErro,
				quantidadeMinima: panel.quantidadeMinima,
				acaoLabel: panel.acaoLabel,
				mensagemAcao: panel.mensagemAcao,
				error: panel.error,
				connected: panel.connected,
				onQuantidadeChange: panel.handleQuantidadeChange,
				onDeposit: panel.handleDeposit,
			}}
		/>
	);
}
