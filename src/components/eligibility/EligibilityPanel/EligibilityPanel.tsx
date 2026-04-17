"use client";

import { useEligibilityPanel } from "@/hooks/useEligibilityPanel";
import { EligibilityPanelView } from "@/components/eligibility/EligibilityPanel/EligibilityPanelView";

export function EligibilityPanel() {
	const panel = useEligibilityPanel();

	return (
		<EligibilityPanelView
			ethBalance={panel.ethBalance}
			usdBalance={panel.usdBalance}
			rptBalance={panel.rptBalance}
			badgeLevel={panel.badgeLevel}
			isActive={panel.isActive}
			perfilSelecionado={panel.perfilSelecionado}
			quantidadeRpt={panel.quantidadeRpt}
			quantidadeErro={panel.quantidadeErro}
			quantidadeMinima={panel.quantidadeMinima}
			acaoLabel={panel.acaoLabel}
			mensagemAcao={panel.mensagemAcao}
			walletNotice={panel.walletNotice}
			depositing={panel.depositing}
			error={panel.error}
			onPerfilChange={panel.handlePerfilChange}
			onQuantidadeChange={panel.handleQuantidadeChange}
			onDeposit={panel.handleDeposit}
			connected={panel.connected}
		/>
	);
}
