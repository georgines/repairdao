import { NextResponse } from "next/server";
import { RepairDAODominioError } from "@/erros/errors";
import {
	acceptServiceBudget,
	acceptServiceRequest,
	createServiceRequest,
	completeServiceRequest,
	openServiceDispute,
	listServiceRequests,
	sendServiceBudget,
} from "@/services/serviceRequests/serviceRequestRepository";
import type {
	ServiceRequestClientAcceptanceInput,
	ServiceRequestAcceptInput,
	ServiceRequestCompletionInput,
	ServiceRequestDisputeInput,
	ServiceRequestBudgetInput,
	ServiceRequestCreateInput,
} from "@/services/serviceRequests/serviceRequestTypes";

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
			message: error instanceof Error ? error.message : "Falha ao processar a ordem de servico.",
		},
		{ status: 500 },
	);
}

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);

		return NextResponse.json(
			await listServiceRequests({
				clientAddress: searchParams.get("clientAddress") ?? undefined,
				technicianAddress: searchParams.get("technicianAddress") ?? undefined,
			}),
		);
	} catch (error) {
		return toErrorResponse(error);
	}
}

export async function POST(request: Request) {
	try {
		const payload = (await request.json()) as ServiceRequestCreateInput;
		const requestOrder = await createServiceRequest(payload);

		return NextResponse.json(requestOrder, { status: 201 });
	} catch (error) {
		return toErrorResponse(error);
	}
}

export async function PATCH(request: Request) {
	try {
		const payload = (await request.json()) as
			| (ServiceRequestAcceptInput & { action: "accept" })
		| (ServiceRequestClientAcceptanceInput & { action: "accept_budget" })
		| (ServiceRequestBudgetInput & { action: "budget" })
		| (ServiceRequestCompletionInput & { action: "complete" })
		| (ServiceRequestDisputeInput & { action: "dispute" });

		if (payload.action === "accept") {
			const requestOrder = await acceptServiceRequest(payload);
			return NextResponse.json(requestOrder);
		}

		if (payload.action === "accept_budget") {
			const requestOrder = await acceptServiceBudget(payload);
			return NextResponse.json(requestOrder);
		}

		if (payload.action === "complete") {
			const requestOrder = await completeServiceRequest(payload);
			return NextResponse.json(requestOrder);
		}

		if (payload.action === "dispute") {
			const requestOrder = await openServiceDispute(payload);
			return NextResponse.json(requestOrder);
		}

		const requestOrder = await sendServiceBudget(payload);
		return NextResponse.json(requestOrder);
	} catch (error) {
		return toErrorResponse(error);
	}
}
