import { Box, Card, Table } from "@mantine/core";
import styles from "./ServiceRequestsPanelTableView.module.css";
import { ServiceRequestsPanelEmptyState } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelEmptyState/ServiceRequestsPanelEmptyState";
import { ServiceRequestsPanelTableRow } from "@/components/services/ServiceRequestsPanel/ServiceRequestsPanelTableRow/ServiceRequestsPanelTableRow";
import type { ServiceRequestSummary } from "@/services/serviceRequests";

type ServiceRequestsPanelTableViewProps = {
	connected: boolean;
	visibleRequests: ServiceRequestSummary[];
	perfilAtivo: "cliente" | "tecnico" | null;
	walletAddress: string | null;
	busyRequestId: number | null;
	onOpenRequestModal: (requestId: number, action: "details" | "budget" | "pay" | "complete" | "confirm" | "rate" | "dispute") => void;
};

export function ServiceRequestsPanelTableView({
	connected,
	visibleRequests,
	perfilAtivo,
	walletAddress,
	busyRequestId,
	onOpenRequestModal,
}: ServiceRequestsPanelTableViewProps) {
	if (!connected) {
		return <ServiceRequestsPanelEmptyState hasWallet={false} hasResults={false} />;
	}

	if (visibleRequests.length === 0) {
		return <ServiceRequestsPanelEmptyState hasWallet={true} hasResults={false} />;
	}

	return (
		<Box className={styles.scrollArea}>
			<Card withBorder radius="sm" shadow="none" padding="md" className={styles.card}>
				<Table withTableBorder withColumnBorders highlightOnHover miw={920}>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Tecnico</Table.Th>
							<Table.Th>Descricao</Table.Th>
							<Table.Th>Status</Table.Th>
							<Table.Th>Orcamento (RPT)</Table.Th>
							<Table.Th>Acoes</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{visibleRequests.map((request) => (
							<ServiceRequestsPanelTableRow
								key={request.id}
								request={request}
								perfilAtivo={perfilAtivo}
								walletAddress={walletAddress}
								busyRequestId={busyRequestId}
								onOpenRequestModal={onOpenRequestModal}
							/>
						))}
					</Table.Tbody>
				</Table>
			</Card>
		</Box>
	);
}
