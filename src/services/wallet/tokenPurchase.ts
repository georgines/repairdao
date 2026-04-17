import { BrowserProvider, parseEther } from "ethers";
import { RepairDAODominioError } from "@/erros/errors";
import { criarRepairDAOBrowserContractClient } from "@/services/blockchain/browserContractClient";
import { criarRepairTokenGateway } from "@/services/blockchain/gateways/tokenGateway";
import type { EthereumProvider } from "@/services/wallet/provider";
import { aguardarTransacao } from "@/services/wallet/transaction";

function normalizarQuantidadeEth(valor: string | number): string {
	const texto = String(valor).trim().replace(",", ".");

	if (!texto) {
		throw new RepairDAODominioError("quantidade_eth_invalida", "A quantidade de ETH precisa ser informada para comprar tokens.");
	}

	const numero = Number(texto);

	if (!Number.isFinite(numero) || numero <= 0) {
		throw new RepairDAODominioError("quantidade_eth_invalida", "A quantidade de ETH precisa ser maior que zero.", {
			valor,
		});
	}

	return texto;
}

export async function comprarToken(ethereum: EthereumProvider, quantidadeEth: string | number): Promise<unknown> {
	const valorNormalizado = normalizarQuantidadeEth(quantidadeEth);
	const provider = new BrowserProvider(ethereum as never);
	const contrato = criarRepairTokenGateway(criarRepairDAOBrowserContractClient(provider));
	const transacao = await contrato.writeContract({
		functionName: "buy",
		args: [
			{
				value: parseEther(valorNormalizado),
			},
		],
	});

	return aguardarTransacao(transacao);
}
