import { Badge, Button, Group, Stack, Table, Text } from "@mantine/core";
import styles from "./ServiceRequestsPanelTableRowView.module.css";
import type { ServiceRequestSummary } from "@/services/serviceRequests";
import {
	formatServiceRequestBudget,
	formatServiceRequestStatus,
	getServiceRequestDisputeAction,
	getServiceRequestPrincipalAction,
	getServiceRequestStatusColor,
} from "@/services/serviceRequests/serviceRequestPresentation";

type ServiceRequestsPanelTableRowViewProps = {
	request: ServiceRequestSummary;
	perfilAtivo: "cliente" | "tecnico" | null;
	walletAddress: string | null;
	busyRequestId: number | null;
	onOpenRequestModal: (requestId: number, action: "details" | "budget" | "pay" | "complete" | "confirm" | "rate" | "dispute") => void;
};

export function ServiceRequestsPanelTableRowView({
	request,
	perfilAtivo,
	walletAddress,
	busyRequestId,
	onOpenRequestModal,
}: ServiceRequestsPanelTableRowViewProps) {
	const acaoPrincipal = getServiceRequestPrincipalAction(request, perfilAtivo, walletAddress);
	const acaoDisputa = getServiceRequestDisputeAction(request, perfilAtivo, walletAddress);
	const principalActionButton = acaoPrincipal ? (
		<Button
			size="xs"
			onClick={() => onOpenRequestModal(request.id, acaoPrincipal.action)}
			loading={busyRequestId === request.id}
		>
			{acaoPrincipal.label}
		</Button>
	) : null;
	const disputeActionButton = acaoDisputa ? (
		<Button
			size="xs"
			variant="light"
			color="red"
			onClick={() => onOpenRequestModal(request.id, acaoDisputa.action)}
			loading={busyRequestId === request.id}
		>
			{acaoDisputa.label}
		</Button>
	) : null;

	return (
		<Table.Tr>
			<Table.Td>
				<Stack gap={0}>
					<Text fw={600}>{request.technicianName}</Text>
					<Text size="xs" c="dimmed">
						{request.technicianAddress}
					</Text>
				</Stack>
			</Table.Td>
			<Table.Td>{request.description}</Table.Td>
			<Table.Td>
				<Badge variant="light" color={getServiceRequestStatusColor(request.status)}>
					{formatServiceRequestStatus(request.status)}
				</Badge>
			</Table.Td>
			<Table.Td>{formatServiceRequestBudget(request.budgetAmount)}</Table.Td>
			<Table.Td className={styles.actionsCell}>
				<Group gap="xs" wrap="nowrap">
					<Button size="xs" variant="light" onClick={() => onOpenRequestModal(request.id, "details")}>
						Detalhes
					</Button>
					{principalActionButton}
					{disputeActionButton}
				</Group>
			</Table.Td>
		</Table.Tr>
	);
}
