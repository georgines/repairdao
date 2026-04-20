import { Button, Group } from "@mantine/core";
import type { ServiceRequestsPanelModalProps } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanel.types";
import { getServiceRequestModalSubmitLabel } from "@/services/serviceRequests/serviceRequestPresentation";

export function ServiceRequestsPanelModalActionsView({
	requestModalAction,
	requestModalRequest,
	requestModalBudget,
	requestModalDisputeReason,
	busyRequestId,
	onCloseRequestModal,
	onSubmitBudget,
	onPayBudget,
	onCompleteOrder,
	onConfirmDelivery,
	onRateService,
	onOpenDispute,
}: ServiceRequestsPanelModalProps) {
	if (!requestModalAction || !requestModalRequest) {
		return null;
	}

	const submitLabel = getServiceRequestModalSubmitLabel(requestModalAction);
	const closeLabel = requestModalAction === "details" ? "Fechar" : "Cancelar";
	const submitDisabled =
		(requestModalAction === "budget" && (requestModalBudget === null || requestModalBudget <= 0)) ||
		(requestModalAction === "pay" && (requestModalRequest.status !== "orcada" || requestModalRequest.budgetAmount === null)) ||
		(requestModalAction === "complete" && requestModalRequest.status !== "aceito_cliente") ||
		(requestModalAction === "confirm" && (requestModalRequest.status !== "concluida" || Boolean(requestModalRequest.deliveryConfirmedAt))) ||
		(requestModalAction === "rate" && requestModalRequest.status !== "concluida") ||
		(requestModalAction === "dispute" &&
			((requestModalRequest.status !== "aceito_cliente" && requestModalRequest.status !== "concluida") ||
				requestModalDisputeReason.trim().length === 0));

	let actionButton = null;
	if (requestModalAction === "budget") {
		actionButton = (
			<Button onClick={() => void onSubmitBudget()} loading={busyRequestId === requestModalRequest.id} disabled={submitDisabled}>
				{submitLabel}
			</Button>
		);
	} else if (requestModalAction === "pay") {
		actionButton = (
			<Button onClick={() => void onPayBudget()} loading={busyRequestId === requestModalRequest.id} disabled={submitDisabled}>
				{submitLabel}
			</Button>
		);
	} else if (requestModalAction === "complete") {
		actionButton = (
			<Button onClick={() => void onCompleteOrder()} loading={busyRequestId === requestModalRequest.id} disabled={submitDisabled}>
				{submitLabel}
			</Button>
		);
	} else if (requestModalAction === "confirm") {
		actionButton = (
			<Button onClick={() => void onConfirmDelivery()} loading={busyRequestId === requestModalRequest.id} disabled={submitDisabled}>
				{submitLabel}
			</Button>
		);
	} else if (requestModalAction === "rate") {
		actionButton = (
			<Button onClick={() => void onRateService()} loading={busyRequestId === requestModalRequest.id} disabled={submitDisabled}>
				{submitLabel}
			</Button>
		);
	} else if (requestModalAction === "dispute") {
		actionButton = (
			<Button color="red" onClick={() => void onOpenDispute()} loading={busyRequestId === requestModalRequest.id} disabled={submitDisabled}>
				{submitLabel}
			</Button>
		);
	}

	return (
		<Group justify="flex-end">
			<Button variant="light" onClick={onCloseRequestModal}>
				{closeLabel}
			</Button>
			{actionButton}
		</Group>
	);
}
