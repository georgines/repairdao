import { NextResponse } from "next/server";
import { carregarConfiguracaoDepositoDaBlockchainNoServidor, sincronizarConfiguracaoDepositoNoServidor } from "@/services/deposit/depositConfigurationBlockchain";

export const dynamic = "force-dynamic";

export async function GET() {
	const configuracao = await sincronizarConfiguracaoDepositoNoServidor().catch(() => carregarConfiguracaoDepositoDaBlockchainNoServidor());

	return NextResponse.json({
		network: configuracao.network,
		contractAddress: configuracao.contractAddress,
		ownerAddress: configuracao.ownerAddress,
		minDepositRaw: configuracao.minDepositRaw.toString(),
		minDeposit: configuracao.minDeposit,
		syncedAt: configuracao.syncedAt,
	});
}

