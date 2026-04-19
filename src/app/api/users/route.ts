import { NextResponse } from "next/server";
import { RepairDAODominioError } from "@/erros/errors";
import { loadUserDetails, loadUsersForDiscovery } from "@/services/users/userDiscoveryServer";
import { registerUser, updateUserProfile, withdrawUser } from "@/services/users/userRepository";
import type { UserActivationPayload } from "@/services/users/userTypes";

export const dynamic = "force-dynamic";

function toErrorResponse(error: unknown) {
	if (error instanceof RepairDAODominioError) {
		return NextResponse.json(
			{
				code: error.code,
				message: error.message,
			},
			{ status: 400 },
		);
	}

	return NextResponse.json(
		{
			message: error instanceof Error ? error.message : "Falha ao processar o usuario.",
		},
		{ status: 500 },
	);
}

export async function POST(request: Request) {
	try {
		const payload = (await request.json()) as UserActivationPayload;
		const user = await registerUser(payload);

		return NextResponse.json(user, { status: 201 });
	} catch (error) {
		return toErrorResponse(error);
	}
}

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const address = searchParams.get("address");

		if (address) {
			const user = await loadUserDetails(address);

			if (!user) {
				return NextResponse.json(
					{
						message: "Usuario nao encontrado.",
					},
					{ status: 404 },
				);
			}

			return NextResponse.json(user);
		}

		return NextResponse.json(await loadUsersForDiscovery());
	} catch (error) {
		return toErrorResponse(error);
	}
}

export async function PUT(request: Request) {
	try {
		const payload = (await request.json()) as UserActivationPayload;
		const user = await updateUserProfile(payload);

		return NextResponse.json(user);
	} catch (error) {
		return toErrorResponse(error);
	}
}

export async function DELETE(request: Request) {
	try {
		const payload = (await request.json()) as { address?: string };

		if (!payload.address) {
			throw new RepairDAODominioError("identificador_invalido", "O identificador da conta e obrigatorio.");
		}

		const removed = await withdrawUser(payload.address);

		if (!removed) {
			return NextResponse.json(
				{
					message: "Usuario nao encontrado.",
				},
				{ status: 404 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		return toErrorResponse(error);
	}
}
