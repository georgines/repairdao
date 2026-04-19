import { NextResponse } from "next/server";
import {
	carregarConfiguracaoSistemaDaBlockchainNoServidor,
	sincronizarConfiguracaoSistemaNoServidor,
} from "@/services/system/systemConfigurationBlockchain";

export const dynamic = "force-dynamic";

export async function GET() {
	const configuracao = await sincronizarConfiguracaoSistemaNoServidor().catch(() => carregarConfiguracaoSistemaDaBlockchainNoServidor());

	return NextResponse.json({
		network: configuracao.network,
		depositContractAddress: configuracao.depositContractAddress,
		depositOwnerAddress: configuracao.depositOwnerAddress,
		minDepositRaw: configuracao.minDepositRaw.toString(),
		minDeposit: configuracao.minDeposit,
		tokenContractAddress: configuracao.tokenContractAddress,
		tokenOwnerAddress: configuracao.tokenOwnerAddress,
		tokensPerEthRaw: configuracao.tokensPerEthRaw.toString(),
		tokensPerEth: configuracao.tokensPerEth,
		syncedAt: configuracao.syncedAt,
	});
}
