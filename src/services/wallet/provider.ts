export type EthereumProvider = {
	request(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<unknown>;
	on?: (event: string, handler: (...args: unknown[]) => void) => void;
	removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

export function obterEthereumProvider() {
	if (typeof window === "undefined") {
		return undefined;
	}

	return (window as Window & { ethereum?: EthereumProvider }).ethereum;
}
