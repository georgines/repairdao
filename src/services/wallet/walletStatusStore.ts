import { ESTADO_INICIAL_CARTEIRA, type WalletSnapshot } from "@/services/wallet/walletSnapshot";

export type WalletStoreState = WalletSnapshot & {
	loading: boolean;
};

const estadoInicial: WalletStoreState = {
	...ESTADO_INICIAL_CARTEIRA,
	loading: false,
};

let estadoAtual: WalletStoreState = estadoInicial;
const listeners = new Set<() => void>();

export function obterEstadoCarteira() {
	return estadoAtual;
}

export function assinarEstadoCarteira(listener: () => void) {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
}

export function atualizarEstadoCarteira(proximoEstado: WalletStoreState) {
	estadoAtual = proximoEstado;

	for (const listener of listeners) {
		listener();
	}
}

export function redefinirEstadoCarteira() {
	atualizarEstadoCarteira(estadoInicial);
}
