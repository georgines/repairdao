import type { UserActivationPayload, UserDetails } from "@/services/users/userTypes";

type ApiErrorPayload = {
	message?: string;
};

async function readErrorMessage(response: Response, fallback: string) {
	try {
		const payload = (await response.json()) as ApiErrorPayload;
		return payload.message ?? fallback;
	} catch {
		return fallback;
	}
}

export async function persistUserProfile(payload: UserActivationPayload): Promise<UserDetails> {
	const response = await fetch("/api/users", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error(await readErrorMessage(response, "Nao foi possivel salvar o usuario."));
	}

	return (await response.json()) as UserDetails;
}

export async function deleteUserProfile(address: string): Promise<void> {
	const response = await fetch("/api/users", {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ address }),
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error(await readErrorMessage(response, "Nao foi possivel remover o usuario."));
	}
}
