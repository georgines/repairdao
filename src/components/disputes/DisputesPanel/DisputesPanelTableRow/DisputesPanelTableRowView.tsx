import { Badge, Button, Stack, Table, Text } from "@mantine/core";
import type { DisputeItem } from "@/components/disputes/DisputesPanel/DisputesPanel.types";
import { formatarEnderecoCurto } from "@/services/wallet/formatters";
import { statusColor, statusLabel } from "@/components/disputes/DisputesPanel/DisputesPanel.utils";
import styles from "./DisputesPanelTableRowView.module.css";

type DisputesPanelTableRowViewProps = {
	dispute: DisputeItem;
	selected: boolean;
	onSelectDispute: (disputeId: number) => Promise<void>;
};

export function DisputesPanelTableRowView({ dispute, selected, onSelectDispute }: DisputesPanelTableRowViewProps) {
	const estado = dispute.contract?.estado;
	const rowSelected = selected ? "true" : undefined;
	const participantLabel = `${formatarEnderecoCurto(dispute.request.clientName)} x ${formatarEnderecoCurto(dispute.request.technicianName)}`;
	let motivoLabel = "-";

	if (dispute.contract?.motivo) {
		motivoLabel = dispute.contract.motivo;
	} else if (dispute.request.disputeReason) {
		motivoLabel = dispute.request.disputeReason;
	}

	return (
		<Table.Tr data-selected={rowSelected}>
			<Table.Td className={styles.titleCell}>
				<Stack gap={0} align="flex-start">
					<Text fw={600}>Disputa #{dispute.request.id}</Text>
					<Text size="xs" c="dimmed">
						{participantLabel}
					</Text>
				</Stack>
			</Table.Td>
			<Table.Td className={styles.bodyCell}>
				<Text fw={500} lineClamp={2}>
					{motivoLabel}
				</Text>
			</Table.Td>
			<Table.Td className={styles.bodyCell}>
				<Badge variant="light" color={statusColor(estado)}>
					{statusLabel(estado)}
				</Badge>
			</Table.Td>
			<Table.Td className={styles.bodyCell}>
				<Button size="xs" variant="light" onClick={() => void onSelectDispute(dispute.request.id)}>
					Detalhes
				</Button>
			</Table.Td>
		</Table.Tr>
	);
}
