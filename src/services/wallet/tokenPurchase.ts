import { BrowserProvider, Contract, parseEther } from "ethers";
import { RepairDAODominioError } from "@/erros/errors";
import { REPAIRDAO_CONTRACTOS } from "@/services/blockchain/gateways/contracts";
import type { EthereumProvider } from "@/services/wallet/provider";

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
	const provider = new BrowserProvider(ethereum as never);
	const signer = await provider.getSigner();
	const valorNormalizado = normalizarQuantidadeEth(quantidadeEth);
	const contrato = new Contract(REPAIRDAO_CONTRACTOS.token.address, REPAIRDAO_CONTRACTOS.token.abi, signer);
	const transacao = await contrato.buy({
		value: parseEther(valorNormalizado),
	});

	if (typeof transacao?.wait === "function") {
		return transacao.wait();
	}

	return transacao;
}
