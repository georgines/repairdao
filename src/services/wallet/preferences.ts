const AUTO_CONNECT_STORAGE_KEY = "repairdao.wallet.autoconnect";

export function reconexaoAutomaticaHabilitada() {
	if (typeof window === "undefined") {
		return true;
	}

	return window.localStorage.getItem(AUTO_CONNECT_STORAGE_KEY) !== "false";
}

export function definirReconexaoAutomatica(habilitada: boolean) {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(AUTO_CONNECT_STORAGE_KEY, habilitada ? "true" : "false");
}
