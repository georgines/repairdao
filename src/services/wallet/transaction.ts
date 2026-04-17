export async function aguardarTransacao(transacao: unknown): Promise<unknown> {
	if (typeof (transacao as { wait?: unknown } | null)?.wait === "function") {
		return (transacao as { wait: () => Promise<unknown> }).wait();
	}

	return transacao;
}
