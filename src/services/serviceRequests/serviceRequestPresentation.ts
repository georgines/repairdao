import type { ServiceRequestSummary, ServiceRequestStatus } from "@/services/serviceRequests";
import type { ServiceRequestsPanelAction } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanel.types";
import { formatarRPT } from "@/services/wallet";

export function formatServiceRequestStatus(status: ServiceRequestSummary["status"]) {
	switch (status) {
		case "aberta":
			return "Aberta";
		case "aceita":
			return "Aceita";
		case "orcada":
			return "Aguardando pagamento";
		case "aceito_cliente":
			return "Paga";
		case "concluida":
			return "Concluida";
		case "disputada":
			return "Em disputa";
	}
}

export function getServiceRequestStatusColor(status: ServiceRequestSummary["status"]) {
	switch (status) {
		case "aberta":
			return "teal";
		case "aceita":
			return "yellow";
		case "orcada":
			return "orange";
		case "aceito_cliente":
			return "teal";
		case "concluida":
			return "gray";
		case "disputada":
			return "red";
	}
}

export function formatServiceRequestBudget(value: number | null) {
	if (value === null) {
		return "-";
	}

	return formatarRPT(value, 0);
}

export function shortServiceRequestAddress(address: string) {
	if (address.length <= 12) {
		return address;
	}

	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getServiceRequestsPanelEmptyStateMessage(hasWallet: boolean, hasResults: boolean) {
	if (!hasWallet) {
		return "Conecte a carteira para ver suas ordens de servico.";
	}

	if (!hasResults) {
		return "Nenhuma ordem foi encontrada para esta carteira.";
	}

	return "Nenhuma ordem encontrou este criterio.";
}

export function getServiceRequestPanelStatusMessage(hasResults: boolean) {
	return hasResults ? "Use a lista para acompanhar suas ordens." : "Nenhuma ordem encontrou este criterio.";
}

export function getServiceRequestPrincipalAction(
	request: ServiceRequestSummary,
	perfilAtivo: "cliente" | "tecnico" | null,
	walletAddress: string | null,
) {
	if (!walletAddress) {
		return null;
	}

	const ehCliente = perfilAtivo === "cliente" && request.clientAddress === walletAddress;
	const ehTecnico = perfilAtivo === "tecnico" && request.technicianAddress === walletAddress;

	if (request.status === "concluida" && ehCliente) {
		if (!request.deliveryConfirmedAt) {
			return { label: "Confirmar entrega", action: "confirm" as const };
		}

		if (!request.clientRated) {
			return { label: "Avaliar", action: "rate" as const };
		}
	}

	if (request.status === "concluida" && ehTecnico && !request.technicianRated) {
		return { label: "Avaliar", action: "rate" as const };
	}

	if (ehTecnico && (request.status === "aberta" || request.status === "aceita")) {
		return { label: "Gerar detalhes", action: "budget" as const };
	}

	if (ehCliente && request.status === "orcada") {
		return { label: "Pagar", action: "pay" as const };
	}

	if (ehTecnico && request.status === "aceito_cliente") {
		return { label: "Finalizar", action: "complete" as const };
	}

	return null;
}

export function getServiceRequestDisputeAction(
	request: ServiceRequestSummary,
	perfilAtivo: "cliente" | "tecnico" | null,
	walletAddress: string | null,
) {
	if (!walletAddress) {
		return null;
	}

	const ehCliente = perfilAtivo === "cliente" && request.clientAddress === walletAddress;
	const ehTecnico = perfilAtivo === "tecnico" && request.technicianAddress === walletAddress;

	if (!ehCliente && !ehTecnico) {
		return null;
	}

	if (request.status === "aceito_cliente" || request.status === "concluida") {
		return { label: "Disputar", action: "dispute" as const };
	}

	return null;
}

export function getServiceRequestModalTitle(modalAction: ServiceRequestsPanelAction) {
	switch (modalAction) {
		case "budget":
			return "Definir valor do servico";
		case "pay":
			return "Confirmar pagamento do orcamento";
		case "complete":
			return "Confirmar finalizacao da ordem";
		case "confirm":
			return "Confirmar entrega";
		case "rate":
			return "Avaliar servico";
		case "dispute":
			return "Abrir disputa";
		default:
			return "Detalhes da ordem";
	}
}

export function getServiceRequestModalHelperText(modalAction: ServiceRequestsPanelAction) {
	switch (modalAction) {
		case "budget":
			return "Informe o valor que sera enviado ao cliente para aprovacao.";
		case "pay":
			return "O pagamento trava o valor no contrato ate a conclusao.";
		case "complete":
			return "A finalizacao libera o valor ao tecnico.";
		case "confirm":
			return "A confirmacao da entrega libera o pagamento ao tecnico.";
		case "rate":
			return "A avaliacao fica disponivel depois da finalizacao.";
		case "dispute":
			return "Explique o motivo e abra a disputa contra a outra parte.";
		default:
			return null;
	}
}

export function getServiceRequestModalActionNotice(modalAction: ServiceRequestsPanelAction, status: ServiceRequestStatus, deliveryConfirmedAt?: string | null) {
	if (modalAction === "pay" && status !== "orcada") {
		return "Esta ordem ainda nao recebeu um orcamento.";
	}

	if (modalAction === "complete" && status !== "aceito_cliente") {
		return "O cliente ainda nao pagou o orcamento.";
	}

	if (modalAction === "confirm" && status !== "concluida") {
		return "A ordem precisa estar concluida antes da confirmacao.";
	}

	if (modalAction === "confirm" && deliveryConfirmedAt) {
		return "A entrega ja foi confirmada.";
	}

	if (modalAction === "rate" && status !== "concluida") {
		return "A ordem ainda nao foi finalizada.";
	}

	if (modalAction === "dispute" && status !== "aceito_cliente" && status !== "concluida") {
		return "A disputa so pode ser aberta quando a ordem estiver em andamento ou concluida.";
	}

	return null;
}

export function getServiceRequestModalSubmitLabel(modalAction: ServiceRequestsPanelAction) {
	switch (modalAction) {
		case "budget":
			return "Aceitar orcamento";
		case "pay":
			return "Pagar";
		case "complete":
			return "Finalizar";
		case "confirm":
			return "Confirmar entrega";
		case "rate":
			return "Avaliar";
		case "dispute":
			return "Abrir disputa";
		default:
			return "Fechar";
	}
}
