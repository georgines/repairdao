"use client";

import { useEligibilityPanel } from "@/hooks/useEligibilityPanel";
import { EligibilityPanelView } from "@/components/eligibility/EligibilityPanel/EligibilityPanelView";

export function EligibilityPanel() {
	const panel = useEligibilityPanel();

	return (
		<EligibilityPanelView
			ethBalance={panel.ethBalance}
			usdBalance={panel.usdBalance}
			ethUsdPrice={panel.ethUsdPrice}
			tokensPerEth={panel.tokensPerEth}
			rptBalance={panel.rptBalance}
			badgeLevel={panel.badgeLevel}
			isActive={panel.isActive}
			perfilAtivo={panel.perfilAtivo}
			mostrarSeletoresPapel={panel.mostrarSeletoresPapel}
			perfilSelecionado={panel.perfilSelecionado}
			perfilConfirmacao={panel.perfilConfirmacao}
			nome={panel.nome}
			areaAtuacao={panel.areaAtuacao}
			identificadorCarteira={panel.identificadorCarteira}
			quantidadeRpt={panel.quantidadeRpt}
			quantidadeErro={panel.quantidadeErro}
			quantidadeMinima={panel.quantidadeMinima}
			acaoLabel={panel.acaoLabel}
			mensagemAcao={panel.mensagemAcao}
			walletNotice={panel.walletNotice}
			depositing={panel.depositing}
			error={panel.error}
			onPerfilChange={panel.handlePerfilChange}
			onNomeChange={panel.handleNomeChange}
			onAreaAtuacaoChange={panel.handleAreaAtuacaoChange}
			onQuantidadeChange={panel.handleQuantidadeChange}
			onDeposit={panel.handleDeposit}
			connected={panel.connected}
		/>
	);
}
